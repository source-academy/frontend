#!/usr/bin/env node
var fs = require('fs');

fs.unlink('./sample.txt', function (err) {
    if (err) throw err;
    console.log('File deleted!');
});  
