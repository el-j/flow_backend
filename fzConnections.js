const _ = require('lodash')
// const inData = require('./data/out.json')

module.exports.fzConnections = (mainBoardName, inData) => {
  let name = mainBoardName
  let otherParts = []
  console.log(mainBoardName);
  let thisIsMypart = (name) =>{
    return  _.find(inData, function(el,key) {
      if (el.name.includes(name)&&!el.name.includes('shield') ) {
        // console.log(key);
        return el
      }
    })}

    let makePathsFromIndex = (data, part) => {
      // console.log(part);
          let getEndOFLine =(data, v, k) => {
            // console.log(targetIndex);
            let targetIndex = v.targetIndex
            let result = getNextElement(data, targetIndex, k);
            let lastResult;
            // console.log(result);
            let wireWay = []
            if (result) {
              while(result && result.name.includes('wire') ) {
                lastResult = result;
                wireWay.push(lastResult.modelIndex)
                result = getNextElement(data, result.connectedTo.breadboard[0].targetIndex, k+1);
              }
            }
            result = result || lastResult; //HACKY!!!
            // result.originIndex = v.originIndex
            result.connectedTo.wireWay = wireWay
            // console.log("HERE IS THE WIREWAY",wireWay, "AND THE OTHER RESULT",result);
            return result;
          }

          let getNextElement = (data, targetIndex, k) => {
            return data.find(function(el) {
              return (targetIndex === el.modelIndex && el.connectedTo.breadboard[0] !== 'none' && el.modelIndex !== part.modelIndex);
            })
          }

          part.endConnection = []
          // console.log(part.connectedTo);
          let test = _.forEach(part.connectedTo.breadboard, (v,k) => {
            // console.log(v);
            let temp = getEndOFLine(inData, v, k);
            console.log("##########THE TEMPDATE FORM SORTING THE ENDCONNECTION",temp.name)
            console.log("value from get end ofline ",v.originId);
            let tempData = {}
              // if (temp.name !== 'wire.fzp') {
                // console.log("this is temp",temp.connectedTo);
                tempData = {
                  name: temp.name,
                  index: temp.modelIndex,
                  wireWay: temp.connectedTo.wireWay,
                  connections: temp.connectedTo.breadboard.map((data) => {
                    return {startId: v.originId, startIndex: v.originIndex,originId: data.originId, originIndex: data.originIndex, targetIndex: data.targetIndex, targetId: data.targetId, connectorLayer: data.layer}
                  })
                  // temp.
                }
                console.log("TEMP DATA CONNECTIONS",tempData.connections);
                part.endConnection.push(tempData)
              // }
          })
          return part
    }

    let mainBoard = makePathsFromIndex(inData, thisIsMypart(name))
      console.log("THE endConnection ",mainBoard.endConnection);
      // mainBoard.endConnection.map((next,key) => {
      // otherParts.push(makePathsFromIndex(inData, thisIsMypart(next.name)))
      // })

    myReturnObj = {
      mainBoardName: mainBoard.name,
      mainBoardIndex: mainBoard.modelIndex,
      mainBoardEndConnection: mainBoard.endConnection,
       otherParts
    }
// console.log(myReturnObj.mainBoardEndConnection[0].endConnection[0].endConnection[0].endConnection[0]);
return myReturnObj

}
