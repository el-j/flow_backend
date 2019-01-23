const _ = require('lodash')
// const inData = require('./data/out.json')

module.exports.partNames = (allParts) => {
  return allParts.map((part) => {
    let partName = part.path.substr(part.path.lastIndexOf('/') + 1)
    let breadboardPartConnectesTo = 'none'
    let pcbPartConnectesTo = 'none'
    let schematicPartConnectesTo = 'none'
    let breadboardConnectTo = ['none']
    let pcbConnectTo = ['none']
    let	schematicConnectTo = ['none']
    if ( _.isEmpty(part.viewSettings[0], true)) {
      return ({name: partName, modelIndex: part.modelIndex, connectedTo:{breadboard: breadboardConnectTo, pcb:pcbConnectTo, schematic:schematicConnectTo}})
    }
    else {
      for (let i = 0; i < part.viewSettings.length; i++) {
        let thisView = part.viewSettings[i]
        if (!_.isEmpty(thisView.connectors, true)) {
          let temp = {}
          switch (thisView.name) {
            case 'breadboard':
              // console.log("got breadboard",thisView.connectors);
                breadboardPartConnectesTo = thisView.connectors
                breadboardConnectTo = breadboardPartConnectesTo.map(connectTo => {
                  if (!_.isEmpty(connectTo.connectsTo, true)) {
                  temp = {originId: connectTo.id, originIndex: part.modelIndex, targetIndex:connectTo.connectsTo[0].modelIndex, targetId:connectTo.connectsTo[0].id, layer:connectTo.connectsTo[0].layer}
                  // console.log('temp from switchcase',temp);
                  return temp
                  }
                })
              break;
            //
            // case 'pcb':
            // 	// console.log("got pcb",thisView.name);
            // 	pcbPartConnectesTo = thisView.connectors
            // 	pcbConnectTo = pcbPartConnectesTo.map(connectTo => {
            // 		if (!_.isEmpty(connectTo.connectsTo, true)) {
            // 			temp = {modelIndex:connectTo.connectsTo[0].modelIndex, id:connectTo.connectsTo[0].id, layer:connectTo.connectsTo[0].layer}
            // 			return temp
            // 		}
            // 	})
            // 	break;
            //
            // case 'schematic':
            // 	// console.log("got schematic",thisView.name);
            // 	schematicPartConnectesTo = thisView.connectors
            // 	schematicConnectTo = schematicPartConnectesTo.map(connectTo => {
            // 		if (!_.isEmpty(connectTo.connectsTo, true)) {
            // 		temp = {modelIndex:connectTo.connectsTo[0].modelIndex, id:connectTo.connectsTo[0].id, layer:connectTo.connectsTo[0].layer}
            // 		return temp
            // 		}
            // 	})
              break;
            default:
            // console.log("DEFAULT::::::",thisView.name);
          }
        }
      }
      // return ({name: partName, modelIndex: part.modelIndex, connectedTo:{breadboard: breadboardConnectTo, pcb:pcbConnectTo, schematic:schematicConnectTo}})
      return ({name: partName, modelIndex: part.modelIndex, connectedTo:{breadboard: breadboardConnectTo}})
    }
  })
}
