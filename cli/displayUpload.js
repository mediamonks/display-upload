#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const packageJson = require('../package.json');
const displayUpload = require('../src/index');

console.log(`Welcome to the ${chalk.green.bold(`Display.Monks Upload Tool`)} v${packageJson.version}`);

program
	.version(packageJson.version)
	.parse(process.argv);

// program
displayUpload({}, true).then(result => console.log(`${chalk.green('✔')} done`));