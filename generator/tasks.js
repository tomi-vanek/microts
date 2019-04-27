'use strict';

const fse = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const yaml = require('js-yaml');
const toPascalCase = require('to-pascal-case');
const toSlugCase = require('to-slug-case');
const line = require('./helpers').line;
const cleanString = require('./helpers').cleanString;

const _schemaInYaml = async file => {
  return fse.exists(file)
    .then((exists) => {
      if (!exists) {
        return Promise.reject(new Error(`OpenAPI schema file "${file}" not found.`));
      } else {
        // console.log(line);
        // console.log(chalk.cyan('Reading OpenAPI schema'), file);
        const normalizedName = file.toLowerCase();
        if (normalizedName.endsWith('.yaml') || normalizedName.endsWith('.yml')) {
          return Promise.resolve(file);
        } else if (normalizedName.endsWith('.json')) {
          const yamlSchemaFile = file.toLowerCase().split('.json').join('') + '.yaml';
          console.log('Preparing schema in YAML format', yamlSchemaFile);
          return fse.readJson(file).then(schema => {
            console.log(chalk.cyan('Schema in YAML format'), schema);
            return fse.writeFile(yamlSchemaFile, yaml.safeDump(schema, {
              indent: 4,
              skipInvalid: true
            }))
              .then(() => Promise.resolve(yamlSchemaFile));
          });
        } else {
          return Promise.reject(new Error(`Schema file "${file}" must be either JSON or YAML.`));
        }
      }
    });
};

const init = async (name, version, schema, port) => {
  const props = {
    port: port || 3000,
    schemaFile: await _schemaInYaml(path.resolve(schema || 'swagger.yaml')),
  };

  console.log(line);
  console.log(chalk.cyan('Microservice code generator'), name, version);
  console.log(chalk.cyan('  - Schema'), props.schemaFile);
  console.log(chalk.cyan('  - Port'), props.port);

  // console.log(line);
  if (! await fse.exists(props.schemaFile)) {
    return Promise.reject(new Error(`OpenAPI schema file "${props.schemaFile}" not found.`));
  } else {
    props.schema = await _readSchema(props.schemaFile);
//     console.log(`${chalk.cyan('Microservice schema')} ${props.schemaFile}
// ${JSON.stringify(props.schema, null, 4)}`);

    props.title = props.schema.info.title || 'Microservice';
    const fragments = props.schema.basePath ? props.schema.basePath.split('/') : [];
    props.name = (fragments && fragments[2]) ? fragments[2] : toSlugCase(props.title);
    props.description = props.schema.info.description ? cleanString(props.schema.info.description) : props.title + ' microservice';
    props.version = props.schema.info.version || '1.0.0';
    props.className = toPascalCase(props.title);
    props.basePath = props.schema.basePath ? props.schema.basePath : '';

    props.endpoints = Object.keys(props.schema.paths).map(k => {
      const def = props.schema.paths[k];
      const methods = Object.keys(def);
      const comments = methods.map(
        m => def[m].summary ? cleanString(def[m].summary) :
          def[m].description ? cleanString(def[m].description) : null);
      const params = methods.map(m => {
        const parameters = def[m].parameters;
        if (!parameters) {
          return null;
        }
        const paramNames = Object.keys(parameters);
        return paramNames.map(n => parameters[n]);
      });
      const result = {
        path: k,
        methods,
        comments,
        params,
      };
      return result;
    });

    return Promise.resolve(props);
  }
};

const report = async result => {
  console.log(
    `Generated ${chalk.cyan(result.generated)} files.
${line}
${chalk.cyan('Next steps')}

1.) Run ${chalk.cyan('npm i')} to download libraries and tools.
2.) Start the server with ${chalk.cyan('npm start')} command.
3.) Open the user interface of the microservice in browser with URL ${chalk.cyan(`http://localhost:${result.props.port}${result.props.basePath}/ui`)}.
    Request handler for GET /health responds with code 200.
    Other generated request handlers respond with code 500 - Not implemented error.
    See  ${chalk.cyan('README.md')} for additional information about generated project.
4.) Define in ${chalk.cyan('project.json')} the repository field and the license field.
5.) Implement the request handlers in directory ${chalk.cyan('src/handlers')}.
    Request path corresponds the directory path in API schema - no explicit routing logic is needed.
    Debug the functionality either with UI or with curl commands - command syntax for each action is also in UI.
    For development run the server with ${chalk.cyan('npm run dev')}, so by each save changed code is compiled and the server is restarted.
6.) Implement the end-to-end tests in directory ${chalk.cyan('test')}.
    See the ${chalk.cyan('README-TEST.md')} for additional hints / suggestions for end-to-end tests.
${line}
`);

  return Promise.resolve();
};

const errorReport = async err => {
  console.error(chalk.red('Error in code generaton - the code was not generated correctly.'));
  console.error(err);
};

const _readSchema = async file => fse.readFile(file, 'UTF8').then(y => yaml.safeLoad(y));

module.exports = {
  init: init,
  report,
  errorReport,
};
