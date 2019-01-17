const fritzingConnections = require('./fzConnections.js')
const partNames = require('./data/out.json')

let myConnections = fritzingConnections.fritzingConnections('ardu',partNames)
// console.log(myConnections.mainBoardEndConnection);
