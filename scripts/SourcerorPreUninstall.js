#!/usr/bin/env node
var fs = require('fs-extra');
fs.rmdir('./public/externalLibs/sourceror', function(err) {
  if (err) {
    console.log('An error occured while copying the folder.');
    return console.error(err);
  }
  console.log('File deleted!');
});
