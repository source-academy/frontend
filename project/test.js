const parser = require('./parser');

const input1 = '2 * ( 3 + 4 )';
const input2 = '3 / ( 4 - 2.1 )';
const input3 = '"Hello" + " " + "World"';

console.log(parser.parse(input1)); // Output: 14
console.log(parser.parse(input2)); // Output: 1.5789473684210527
console.log(parser.parse(input3)); // Output: "Hello World"