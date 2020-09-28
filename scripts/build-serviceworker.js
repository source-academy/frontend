const fs = require('fs');
fs.renameSync("./build/service-worker.js", "./build/service-worker-base.js");

const serviceworker = fs.readFileSync("./build/service-worker-base.js");
const extension = fs.readFileSync("./build/sw-custom.js");

fs.writeFileSync("./build/service-worker.js", serviceworker + "\n" + extension);
