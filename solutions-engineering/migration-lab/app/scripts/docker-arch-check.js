const os = require('os');

console.log(`node_arch=${process.arch}`);
console.log(`node_platform=${process.platform}`);
console.log(`cpu_model=${os.cpus()[0] ? os.cpus()[0].model : 'unknown'}`);
console.log(`cpu_count=${os.cpus().length}`);
