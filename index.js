// Require express and create an instance of it
const Fritzing = require ('./node_modules/fritzing-js/fritzing.js')
const {FritzingPartsAPIClient} = require('fritzing-parts-api-client-js')
const express = require('express');
const cors = require('cors')
const fs = require('fs');
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

function download(filename,res) {
		return fs.readFile('./examples/'+filename,function(err,data){
			if (data) {
					SketchBundle.fromFZZ(data)
						.then((sketchBundle) => {
							console.log("from sketchBundle", filename,filename.slice(0, -1));
							let mytest = sketchBundle.primary
							filename = filename.slice(0, -1)
							let myInstances = sketchBundle.primary[filename].instances
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
							// console.log(myConnections.mainBoardEndConnection[0]);
							fs.writeFileSync('./data/endConnections.json', JSON.stringify(myConnections));
							/*
							get the arduino instance
							*/
							let theArduino = _.find(myInstances, function(el) {
								if (el.moduleIdRef.includes('arduino')){
								return el
								}
							 })

							 let newArduino = _.find(iLoveTest, function(el) {
 								if (el.name.includes('arduino')){
 								return el
 								}
 							 })
							 console.log(newArduino.name);
							 arduinoConnected = []
							 myConnections.mainBoardEndConnection.map(connector => {
								 arduinoConnected.push(connector.connections[0].startId)
							 })


							 console.log(arduinoConnected);

							 FZPUtils.FZPUtils.loadFZP('core/'+ newArduino.name)
									 .then(fzp => {
										 // console.log(fzp);
										 thePart(fzp)

									 let test = thePart
									 console.log(test);

							 elCons = theArduino.viewSettings[0].connectors
							 for (let i = 0; i < elCons.length; i++) {
							 	elCon = elCons[i]
								elConSource = elCon.id
								name = elCon.id

								if (i %2 === 0) {
									type = 'in'

								}
								else  {
									type = 'out'

								}
								elConSourceIndex = theArduino.modelIndex
								elConAim = elCon.connectsTo[0].id
								elConAimIndex = elCon.connectsTo[0].modelIndex
								if (elConAimIndex !== elConSourceIndex) {
									tempBlockConnections.push({name,type,elConSourceIndex,elConSource, elConAim, elConAimIndex})
								}
							 }

							 tempBlockConnections.map((element) => {
								 let aimPart = _.find(myInstances, function(el) {
									 if (el.modelIndex === element.elConAimIndex && el.viewSettings.length > 1) {
										 return el.modelIndex === element.elConAimIndex
									 }
									 })
							 })

							tempBlockConnections.connected = arduinoConnected
							console.log('THE', tempBlockConnections.connected, tempBlockConnections);
							 	 res.json(JSON.stringify(tempBlockConnections));
								 tempBlockConnections = []
							 })
							 .catch(e => {
								 // Raven.captureException(e)
								 // alert('LOAD FZP ERROR '+e)
							 });
							})
							.catch((err) => {
								console.log("we have an error",err);
								res.json(JSON.stringify({err:	{show: true,
								message: 'err from sketchBundle'}
								})
							);
			})
		}else {
			console.log("err,readFile",err);

			res.json({err:	{show: true,
			message: err}
		})
		}
	})
}


app.get('/fzz', function (req, res) {
	download('none',res)
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
