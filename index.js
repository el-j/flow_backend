// Require express and create an instance of it
var Fritzing = require ('./node_modules/fritzing-js/fritzing.js')
var express = require('express');
var cors = require('cors')
var fs = require('fs');
var _ = require('lodash')
var app = express();
let mysketch

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
							// console.log("mytest", mytest, mytest[filename]);
							let nexttest = mytest
							let myInstances = sketchBundle.primary[filename].instances

							let allParts = _.find(myInstances, function() {
								return el.moduleIdRef !== el.moduleIdRef.includes('Wire')
							})
							console.log(allParts);
							// get the arduino from the source fz
							let theArduino = _.find(myInstances, function(el) {
								// console.log(myInstances);
								return el.moduleIdRef === 'arduino_Uno_Rev3(fix)'
							 })
							 elCons = theArduino.viewSettings[0].connectors
							 for (var i = 0; i < elCons.length; i++) {
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
							 // console.log(tempBlockConnections);

							 tempBlockConnections.map((element) => {
								 let aimPart = _.find(myInstances, function(el) {
									 if (el.modelIndex === element.elConAimIndex && el.viewSettings.length > 1) {
										 return el.modelIndex === element.elConAimIndex
									 }
									 })
									 // console.log(aimPart);

								 // console.log(aimPart.viewSettings[0].connectors[0].connectsTo[0].modelIndex);
							 })

								 // let aimPart = _.find(tempBlockConnections[i], function(el) {
									//  // console.log(myInstances);
									//  return el.modelIndex === 'arduino_Uno_Rev3(fix)'
								 // })
									// tempBlockConnections[i].elConIndex
							 // }
							 // //  get the connection endpoint ad reference
							 // tempBlockConnections.map(data => {
							 //  // check the connected Part via modelIndex and update the sourceIndex of the connection to compare later
							 //  let theConnection = _.find(myInstances, function(el) {
							 // 	 console.log(el.modelIndex)
							 // 	 	return el.modelIndex === data.elConAimIndex
							 // 	  })
							 // 		console.log(theConnection);
							 // 		data['elConSourceIndex'] = theConnection.viewSettings[0].connectors[0].connectsTo[0].modelIndex
							 //  // console.log(theConnection.viewSettings[0].connectors[0]);
							 // })
							 	 res.json(JSON.stringify(tempBlockConnections));
								 tempBlockConnections = []

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
// download(filename)


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
