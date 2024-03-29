#!/usr/bin/env node
const child_process = require('child_process');
const fs = require('fs');

// Init root directory
console.log('Validate and prepare data dir');
let root = (process.env.STORAGE_PATH || process.cwd());
if (!fs.existsSync(root)) {
    fs.mkdirSync(root);
}

// Read registry
let deps = {};
try {
    if (fs.existsSync(root + '/registry.json')) {
        let ex = fs.readFileSync(root + '/registry.json', 'utf8');
        let j = JSON.parse(ex);
        if (Array.isArray(j.packages)) {
            for (let p of j.packages) {
                if (typeof p.name === 'string' && typeof p.version === 'string') {
                    deps[p.name] = p.version;
                }
            }
        }
    }
} catch (e) {
    console.warn(e);
}

// Init modules folder
if (!fs.existsSync(root + '/modules/')) {
    fs.mkdirSync(root + '/modules/');
}

// Write Packages
console.log('Writing package index');
fs.writeFileSync(root + '/modules/package.json', JSON.stringify({
    name: 'nodepi_modules',
    dependencies: {
        'nodepi-server': 'latest',
        ...deps
    }
}));

// Install packages
console.log('Installing packages');
child_process.execSync('yarn', { cwd: root + '/modules/', stdio: 'inherit' });
child_process.execSync('yarn upgrade nodepi-server', { cwd: root + '/modules/', stdio: 'inherit' });

// Run server
console.log('Starting server');
child_process.execSync('node "' + root + '/modules/node_modules/nodepi-server/build/server/index.js"', { cwd: root, stdio: 'inherit' });