#! /usr/bin/env node
require('babel-register')({
  presets: ['env']
});

const fs = require('fs');
const chalk = require('chalk');
const { pluralize, dasherize, singularize } = require('i')();

const CLI = {
  default(commandHandler) {
    !process.argv[2] ? commandHandler() : null;
  },
  command(commandName, commandHandler) {
    commandName === process.argv[2] ? commandHandler() : null;
  }
};

CLI.default(printCommands);
CLI.command('help', printCommands);

CLI.command('init', generateInitialFolderStructure);
CLI.command('new', generateInitialFolderStructure);

CLI.command('g', generateModelFiles);
CLI.command('generate', generateModelFiles);

CLI.command('c', openConsole)
CLI.command('console', openConsole);

CLI.command('browserify', () => {
  let browserify = require('browserify');
  browserify.require('memserver', { expose: 'MemServer' });
  browserify.bundle(() => console.log('bundle complete'));
  // browserify command here with babel
});

function printCommands() {
  console.log(`${chalk.cyan('[MemServer CLI] Usage:')} memserver ${chalk.yellow('<command (Default: help)>')}

memserver init | new                  # Sets up the initial memserver folder structure
memserver generate model ${chalk.yellow('[ModelName]')}  # Generates the initial files for a MemServer Model ${chalk.cyan('[alias: "memserver g model"]')}
memserver console                     # Starts a MemServer console in node.js ${chalk.cyan('[alias: "memserver c"]')}
memserver browserify ${chalk.yellow('[outputFile]')}     # Builds an ES5 javascript bundle with all your memserver code
`);
}

function generateInitialFolderStructure() {
  let memServerDirectory = getMemServerDirectory();

  if (!memServerDirectory) {
    memServerDirectory = './memserver';
    fs.mkdirSync(memServerDirectory);
  }

  if (!fs.existsSync(`${memServerDirectory}/server.js`)) {
    fs.writeFileSync(`${memServerDirectory}/server.js`, `export default function(Models) {
}`);
    console.log(chalk.cyan('[MemServer CLI] /memserver folder created'));
  }

  createFixtureAndModelFoldersIfNeeded(memServerDirectory);
}

function createFixtureAndModelFoldersIfNeeded(memServerDirectory) {
  if (!fs.existsSync(`${memServerDirectory}/fixtures`)) {
    fs.mkdirSync(`${memServerDirectory}/fixtures`);
    console.log(chalk.cyan('[MemServer CLI] /memserver/fixtures folder created'));
  }

  if (!fs.existsSync(`${memServerDirectory}/models`)) {
    fs.mkdirSync(`${memServerDirectory}/models`);
    console.log(chalk.cyan('[MemServer CLI] /memserver/models folder created'));
  }
}

function generateModelFiles() {
  const memServerDirectory = getMemServerDirectory();

  if (!process.argv[3] || !process.argv[4]) {
    throw new Error(chalk.red('[MemServer CLI] Please put a modelName to the memserver generate. Example: $ memserver generate model user'))
  } else if (!memServerDirectory) {
    throw new Error(chalk.red('[MemServer CLI] cannot find /memserver folder. Did you run $ memserver init ?'));
  }

  createFixtureAndModelFoldersIfNeeded(memServerDirectory);

  const modelFileName = dasherize(singularize(process.argv[4]));
  const fixtureFileName = dasherize(pluralize(process.argv[4]));

  if (!fs.existsSync(`${memServerDirectory}/models/${modelFileName}.js`)) {
    fs.writeFileSync(`${memServerDirectory}/models/${modelFileName}.js`, `import Model from 'memserver/model';
export default Model({

});`);
    console.log(chalk.cyan(`[MemServer CLI] /memserver/models/${modelFileName}.js created`));
  }

  if (!fs.existsSync(`${memServerDirectory}/fixtures/${fixtureFileName}.js`)) {
    fs.writeFileSync(`${memServerDirectory}/fixtures/${fixtureFileName}.js`, `export default [
];`);
    console.log(chalk.cyan(`[MemServer CLI] /memserver/fixtures/${fixtureFileName}.js created`));
  }
}

function openConsole() {
  const MemServer = require('./lib/index.js');
  const repl = require('repl');

  console.log(chalk.cyan('[MemServer CLI]'), 'Starting MemServer node.js console - Remember to MemServer.start() ;)');
  repl.start('> ');
}

function getMemServerDirectory() {
  const cwd = process.cwd();

  if (cwd.includes('memserver')) {
    const targetIndex = cwd.lastIndexOf('memserver') + 9;

    return cwd.slice(0, targetIndex);
  }
}
