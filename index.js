#!/usr/bin/env node

'use strict';

const program = require('commander');
const pkg = require('./package.json');
const { generate } = require('./generator/generator');

program
  .version(pkg.version, '-v, --version')
  .option('-s --schema <schema>', 'OpenAPI 2.0 (= Swagger) schema', 'swagger.yaml')
  .option('-p --port <n>', 'Port on which the service will listen (default is 3000)', 3000)
  .parse(process.argv);

generate(pkg.name, pkg.version, program.schema, program.port);
