'use strict';

const fse = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { render } = require('ejs');

const line = `
${chalk.gray('-'.repeat(70))}
`;

// const destinationDir = path.resolve(process.cwd(), 'temp');
const destinationDir = process.cwd();
const templatePath = file => path.resolve(__dirname, 'templates', file);
const destinationPath = file => path.resolve(destinationDir, file);

const cleanString = s => s.split(/\s+/).join(' ').trim();

const emptyDestinationDir = async () => {
  return fse.exists(destinationDir)
    .then(exists => {
      if (exists) {
        const msg = 'Please delete the temp directory.';
        console.log(chalk.red(msg));
        return Promise.reject(new Error(msg));
      } else {
        console.log(chalk.cyan('Initializing temp directory.'));
      }
      return fse.emptyDir(destinationDir);
    });
};
const copy = async file => {
  console.log(file);
  return fse.copy(templatePath(file), destinationPath(file));
};
const copyFile = async (file, target) => {
  console.log(target);
  return fse.copy(file, destinationPath(target));
};
const applyTemplate = async (file, params) => {
  const fragments = file.split('.');
  const target = fragments.slice(0, fragments.length - 1).join('.');
  console.log(target);
  fse.readFile(templatePath(file))
    .then(t => render(t.toString(), params))
    .then(result => fse.outputFile(destinationPath(target), result));
};
const applyTemplateTarget = async (file, target, params) => {
  console.log(target);
  fse.readFile(templatePath(file))
    .then(t => render(t.toString(), params))
    .then(result => fse.outputFile(destinationPath(target), result));
};

module.exports = {
  line: line,
  cleanString: cleanString,
  copy: copy,
  copyFile: copyFile,
  applyTemplate: applyTemplate,
  applyTemplateTarget: applyTemplateTarget,
  emptyDestinationDir: emptyDestinationDir,
};
