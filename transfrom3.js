var _ = require('lodash')
var inData = require('./out.json')

function makePathsFromIndex(data) {
  let ardu = _.find(inData, function(el) {
    if (el.name.includes('arduino') && !el.name.includes('shield')) {
      return el
    }
  })
  console.log("ardu", ardu);

  let getEndOFLine = function(data, targetIndex, k) {
    let result = getNextElement(data, targetIndex, k);
    let lastResult;
    if (result) {
      while(result && result.name.includes('wire')) {
        lastResult = result;
        result = getNextElement(data, result.connectedTo.breadboard[0].modelIndex, k+1);
      }
    }
    result = result || lastResult; //HACKY!!!
    return result;
  }

  let getNextElement = function(data, targetIndex, k) {
    return data.find(function(el) {
      return (targetIndex === el.modelIndex && el.connectedTo.breadboard[0] !== 'none' && el.modelIndex !== ardu.modelIndex);
    })
  }
  ardu.endConnection = []
  let test = _.forEach(ardu.connectedTo.breadboard, (v,k) => {
      let temp = getEndOFLine(inData, v.modelIndex, k);
      // return temp
      if (temp.name !== 'wire.fzp') {
        // console.log("this is temp",temp);
        ardu.endConnection.push(temp)

      }


  })
  console.log(ardu.endConnection[ardu.endConnection.length -1].name, ardu.endConnection[ardu.endConnection.length -1].connectedTo.breadboard, ardu.endConnection.length);
  // console.log(ardu.endConnection);
  // console.log(test);

}

makePathsFromIndex(inData)
