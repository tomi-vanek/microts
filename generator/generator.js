'use strict';

const chalk = require('chalk');
const { init, report, errorReport } = require('./tasks');
const {
  line,
  copy,
  copyFile,
  applyTemplate,
  applyTemplateTarget,
  // emptyDestinationDir,
} = require('./helpers');

const generate = async params => {
  console.log(line);
  console.log(`${chalk.cyan('Microservice configuration')}

${JSON.stringify(params, null, 4)}`);

  // return emptyDestinationDir()
  return Promise.resolve()
    .then(() => {
      console.log(line);
      console.log(chalk.cyan(`Generating files
`));
      return Promise.resolve();
    })
    .then(() => Promise.all([
      // root
      copy('_dockerignore'),
      copy('_editorconfig'),
      copy('_gitignore'),
      copy('_npmignore'),
      copy('copyStaticAssets.ts'),
      applyTemplate('docker-compose.yaml.ejs', params),
      applyTemplate('Dockerfile.ejs', params),
      applyTemplate('README.md.ejs', params),
      applyTemplate('package.json.ejs', params),
      copy('tsconfig.json'),
      copy('tslint.json'),

      // src
      copy('src/create-server.ts'),
      applyTemplate('src/DOCUMENTATION.md.ejs', params),
      applyTemplate('src/server.ts.ejs', params),
      copy('src/setup-mw.ts'),
      applyTemplate('src/setup-ui.ts.ejs', params),

      // src/config
      applyTemplate('src/config/app-config.ts.ejs', params),
      copyFile(params.schemaFile, 'src/config/swagger.yaml'),

      // src/handlers
      generateHandlers(params),

      // src/tech
      copy('src/tech/response.ts'),

      // src/ui
      copy('src/ui/api.css'),
      copy('src/ui/favicon.png'),
      copy('src/ui/logo.png'),
      copy('src/ui/swagger-ui.html'),

      // test
      applyTemplate('test/support/init.ts.ejs', params),
      applyTemplate('test/README-TEST.md.ejs', params),
      generateTests(params),
    ])
      .then(result => {
        // move generated code form temp
        // fse.move... TODO :-)
        // delete temp

        console.log(line);
        // return statistics from the code generation
        return Promise.resolve({ props: params, generated: result.length });
      })
    );
};

const generateHandlers = async params => {
  return Promise.all(params.endpoints.map(
    endpoint => applyTemplateTarget(
      'src/handlers/handler.ts.ejs',
      'src/handlers' + endpoint.path + '.ts',
      endpoint
    )));
};

const generateTests = async params => {
  return Promise.all(params.endpoints.map(
    endpoint => applyTemplateTarget(
      'test/test.spec.ts.ejs',
      'test/' + endpoint.path.substring(1).split(/[{}]/).join('').split('/').join('-') + '.spec.ts',
      endpoint
    )));
};

module.exports = {
  generate: (name, version, schema, port) =>
    init(name, version, schema, port)
      .then(generate)
      .then(report)
      .catch(errorReport)
};
