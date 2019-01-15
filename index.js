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

let filename = './none'

function download(filename) {
		return fs.readFile('./'+filename,function(err,data){
		SketchBundle.fromFZZ(data)
		.then((sketchBundle) => {
			console.log("from sketchBundle", filename,filename.slice(0, -1));
			let mytest = sketchBundle.primary
			filename = filename.slice(0, -1)
			console.log("mytest", mytest, mytest[filename]);
			let nexttest = mytest
			let myInstances = sketchBundle.primary[filename].instances
			// get the arduino from the source fz
			let theArduino = _.find(myInstances, function(el) {
				// console.log(myInstances);
				return el.moduleIdRef === 'arduino_Uno_Rev3(fix)'
			 })

			 // get all connected connectors of the arduino
			 elementConnectors = theArduino.viewSettings[0].connectors
			 for (var i = 0; i < elementConnectors.length; i++) {
			 	elementConnector = elementConnectors[i]
				elementConnectorSource = elementConnector.id
				// connected to part with modelIndex and the connector id
				elementConnectorAim = elementConnector.connectsTo[0].id
				elementConnectorAimIndex = elementConnector.connectsTo[0].modelIndex
				// console.log(elementConnectorSource, elementConnectorAim, elementConnectorIndex);

				tempBlockConnections.push({elementConnectorSource, elementConnectorAim, elementConnectorAimIndex})
			 }
			 // //  get the connection endpoint ad reference
			 // tempBlockConnections.map(data => {
			 //  // check the connected Part via modelIndex and update the sourceIndex of the connection to compare later
			 //  let theConnection = _.find(myInstances, function(el) {
			 // 	 console.log(el.modelIndex)
			 // 	 	return el.modelIndex === data.elementConnectorAimIndex
			 // 	  })
			 // 		console.log(theConnection);
			 // 		data['elementConnectorSourceIndex'] = theConnection.viewSettings[0].connectors[0].connectsTo[0].modelIndex
			 //  // console.log(theConnection.viewSettings[0].connectors[0]);
			 // })
			})
			.catch((err) => {
				console.log("we have an error",err);
			})
		})
}
download()


app.get('/fzz', function (req, res) {
	download()
	console.log("get the fzz",tempBlockConnections);
	 res.json(JSON.stringify(tempBlockConnections));
	 tempBlockConnections = []
});
app.get('/fzz/:filename', function (req, res) {
	// req.query.filename
	download(req.params.filename)
	console.log("get the fzz",req.params.filename);
	 res.json(JSON.stringify(tempBlockConnections));
	 tempBlockConnections = []
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
