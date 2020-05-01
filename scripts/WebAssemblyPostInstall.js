#!/usr/bin/env node
var fs = require('fs-extra');

var source = './node_modules/sourceror/sourceror'
var destination = './public/externalLibs/sourceror'
 
// copy source folder to destination
fs.copy(source, destination, function (err) {
    if (err){
        console.log('An error occured while copying the folder.')
        return console.error(err)
    }
    console.log('Copy completed!')
});
