#!/usr/bin/env node
const execSync = require('child_process').execSync;
const os = require('os');

const command = (os.platform() === "win32") ? 'move' : 'mv';
const directories = ' ../node_modules/sourceror/sourceror ../public/externalLibs/sourceror';

try {
    const output = execSync(command.concat(directories), { encoding: 'utf-8' });  // the default is 'buffer'
} catch(err) {
    err.stdout;
    err.stderr;
}
