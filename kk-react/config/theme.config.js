const fs = require('fs');
const path = require('path');
const lessToJs = require('less-vars-to-js');

const themePath = path.join(__dirname, '../src/styles/color-board.less');
console.log('test', lessToJs(fs.readFileSync(themePath, 'utf8')));
return lessToJs(fs.readFileSync(themePath, 'utf8'));
// module.exports = () => {
//   const themePath = path.join(__dirname, '../src/styles/color-board.less');
//   console.log('test', lessToJs(fs.readFileSync(themePath, 'utf8')));
//   return lessToJs(fs.readFileSync(themePath, 'utf8'));
// };
