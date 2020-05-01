#!/usr/bin/env node
var fs = require('fs-extra');
fs.rmdir('./public/externalLibs/sourceror', function (err) {
    console.log('File deleted!');
});  
