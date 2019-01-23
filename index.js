// Require express and create an instance of it
const Fritzing = require ('./node_modules/fritzing-js/fritzing.js')
const {FritzingPartsAPIClient} = require('fritzing-parts-api-client-js')
const express = require('express');
const cors = require('cors')
const fs = require('fs');
const path = require('path');
const _ = require('lodash')
const app = express();
// const {parse, stringify} = require('flatted/cjs')
const FZPUtils = require('fzp-js')

const fzConnections = require('./fzConnections.js')
const partNames = require('./partNames.js')
let mysketch

const FritzingAPI = 'https://fritzing.github.io/fritzing-parts';
const FritzingAPISVGCore = FritzingAPI+'/svg/core/';

app.use(cors())

const SketchBundle = Fritzing.SketchBundle
const Sketch = Fritzing.Sketch
let tempBlockConnections = []
let tempAimConnections = []

let filename = 'test.fzz'

const dataBaseFolder = './examples'
const dataBase = []
let newTemp = {}

const loadDataBase = (res) => fs.readdir(dataBaseFolder, (err, files) => {
  console.log(files);
  files.forEach((file,key) => {
		let temp = {name:path.parse(file).name, ext:path.parse(file).ext, data: {} }
    // console.log("this is temp",temp);
		if (_.find(dataBase,el => el.name === temp.name))
			{
          console.log('we have it in database',temp.name);
        _.find(dataBase, function(el, key) {
          if (el.name === temp.name) {
              // console.log('database is empty',dataBase[key],el,temp);
              if (_.isEmpty(el.data)) {
                // console.log('before extension check',temp);
            if (temp.ext === '.json') {
              console.log('have a json for that',temp.name, temp.ext);
              let thePath = './examples/' + temp.name + temp.ext
              console.log(thePath);
                fs.readFile(thePath ,function(err,data){
                  // console.log('storing',key, dataBase[key],data);
                newTemp = JSON.parse(data)
                // console.log('OUR NEW TEMP FROM READFILE',newTemp);
                dataBase[key].data = newTemp
                // console.log('NEW TEMP OUTSIDE READFILE',dataBase)
                  })
                  // console.log('the element', dataBase);
                  // dataBase.push(temp)
            }
          }

        return el === temp}}
      )
			console.log('Known:',dataBase, file);
		}

		else {
      if (temp.ext !== '.json') {
        dataBase.push(temp)
        // console.log('NEW FILE:', temp);

      }
		}
  });
	res.json(dataBase);
})

function download(filename,res) {

    let dbDataName = filename.slice(0, -4)
    console.log(dbDataName);
    if (_.find(dataBase,el =>
      {
        if (!_.isEmpty(el.data)){
        return el.name === dbDataName}
      }
      )){
        _.find(dataBase,el => {
          (el.name === dbDataName) ? (
            // console.log("the data we use",el),
            res.json(el.data)):null
          })
        console.log('USE FROM DATABASE',dbDataName)
      }

    else {
      console.log('READ NEW FILE',filename)

		return fs.readFile('./examples/'+filename,function(err,data){
			if (data) {
					SketchBundle.fromFZZ(data)
						.then((sketchBundle) => {
							console.log("from sketchBundle", filename,filename.slice(0, -1));
							let mytest = sketchBundle.primary

							fzFilename = filename.slice(0, -1)
							let myInstances = sketchBundle.primary[fzFilename].instances
							/*
							get all the parts that are not wires
							*/
							let allParts = _.filter(myInstances, function(el) {
								// if (!el.moduleIdRef.includes('Wire') && !el.moduleIdRef.includes('Via')  && !el.moduleIdRef.includes('Hole') ) {
									return el
								// }
							})
							/*
							get all the partnames from the fz
							*/
							let iLoveTest = partNames.partNames(allParts)
							// fs.writeFileSync('./data/out.json', JSON.stringify(partNames));
							let myConnections = fzConnections.fzConnections('ardu',iLoveTest)
							// fs.writeFileSync('./data/endConnections.json', JSON.stringify(myConnections));
							/*
							get the arduino instance
							*/
							let newArduino = _.find(iLoveTest, function(el) {
 								if (el.name.includes('arduino') && !el.name.includes('shield')){
 								return el
 								}
 							})
              console.log("we have a new Arduino found",newArduino);
						  arduinoConnected = []
							 myConnections.mainBoardEndConnection.map(connector => {
								 arduinoConnected.push({connector:connector.connections[0].startId, type: '',connected: true, breadSvgId: ''})
							 })
               /*
               get the fzp file of the board and the svg
               */
							 FZPUtils.FZPUtils.loadFZPandSVGs('core/'+ newArduino.name)
									 .then(fzp => {
									 let test = fzp
									 let returnObject = {
                     moduelId: test.moduleId,
                     partName: test.title,
										 connected: arduinoConnected,
                     connectors: test.connectors,
                     breadSvg: test.views.breadboard.svg,
                     // pcbSvg: test.views.pcb.svg,
									 }


                   returnObject.connected.map((con,key) => {
                     // console.log(con);
                     let temp = _.find(returnObject.connectors, (el) => {
                       // console.log('EL',el.id, 'CON', con.connector);
                       return el.id === con.connector
                     })
                     // console.log("this is my temps from what i have found",temp);
                     if (temp) {
                       console.log("this is the temp",temp, temp.views.breadboard.svgId);

                     switch (true) {
                       case temp.name.includes('gnd') || temp.name.includes('GND') :
                          console.log("a ground connector");
                          returnObject.connected[key].type = 'GND'
                          returnObject.connected[key].name = temp.name
                          returnObject.connected[key].breadSvgId = temp.views.breadboard.svgId
                         break;

                       case temp.name.includes('5V') || temp.name.includes('3v3') || temp.name.includes('3V') :
                          console.log("a ground connector");
                          returnObject.connected[key].type = 'V'
                              returnObject.connected[key].name = temp.name
                          returnObject.connected[key].breadSvgId = temp.views.breadboard.svgId
                         break;

                       case temp.name.includes('A'):
                       console.log("an analog connector");
                       returnObject.connected[key].type = 'out'
                           returnObject.connected[key].name = temp.name
                       returnObject.connected[key].breadSvgId = temp.views.breadboard.svgId
                       break;

                       default:
                         returnObject.connected[key].type = 'unknown'
                             returnObject.connected[key].name = temp.name
                         returnObject.connected[key].breadSvgId = temp.views.breadboard.svgId
                     }
                     // temp.name
                   }
                   })
                   jsonFilename = filename.slice(0, -4)

                   console.log('the jsonFilename', jsonFilename);
                   _.find(dataBase,el => {
                       if (el.name === jsonFilename){
                           if (_.isEmpty(el.data)) {
                             el.data = returnObject
                             fs.writeFileSync('./examples/'+jsonFilename+'.json', JSON.stringify(returnObject))
                             return
                           }
                          }
                         else {
                        fs.writeFileSync('./examples/'+jsonFilename+'.json', JSON.stringify(returnObject))
                      }
                       return el.name === filename
                    })
                   // console.log(returnObject);

							 	 res.json(returnObject);
							 })
							 .catch((err) => {
								 console.log("we have an error in READ FZP",err);
								 res.json({err:	{show: true,
 								message: 'err from READ FZP'}
							})
						})
					})
					.catch((err) => {
						console.log("we have an error in READ FZZ",err);
						res.json({err:	{show: true,
						message: 'err from sketchBundle'}
						})
				})
			}
			else {
			console.log("err,readFile",err);

			res.json({err:	{show: true,
			message: err}
		})
		}
	})
}
}


app.get('/database', function (req, res) {
  if(_.isEmpty(dataBase)) {
	loadDataBase(res)
  }
  else {
    res.json(dataBase)
  }
	// console.log("get the fzz",tempBlockConnections);

});
app.get('/fzz', function (req, res) {
	loadDataBase(res)
	// console.log("get the fzz",tempBlockConnections);

});
app.get('/fzz/:filename', function (req, res) {
	// req.query.filename
	download(req.params.filename,res)
	// console.log("get the fzz",req.params.filename);
	 // res.json(JSON.stringify(tempBlockConnections));
	 // tempBlockConnections = []
});

// On localhost:3000/welcome
app.get('/welcome', function (req, res) {
    res.send('<b>Hello</b> welcome to my http server made with express');
});

// Change the 404 message modifing the middleware
app.use(function(req, res, next) {
    res.status(404).send("Sorry, that route doesn't exist. Have a nice day :)");
});

// start the server in the port 3000 !
app.listen(3005, function () {
    console.log('Example app listening on port 3005.');
});
