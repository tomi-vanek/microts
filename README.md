# _microts_ - code generator for microservices

Microservice code generator with interface-first approach: from **OpenAPI - Swagger** REST API specification is generated complete projectt skeleton with _TypeScript_ code, tests and _Docker_ configuration.

Generated code has the ambition to minimize implementation time & code for new microservices.

## Quick start

1. Install the generator with `npm i -g microts`
1. Create a new project directory. Go to the new project work directory with `cd [NEW-PROJECT]`.
1. Create new microservice schema `swagger.yaml` in root of the project.
1. Generate microservice code with command `microts`.
1. Start the microservice with `npm start`.
1. Open the UI for microservice in browser with URL `localhost:[PORT]` (default port is 3000)

## Code generation in detail

1. Create a new project directory (create a project in GitHub or other VCS and clone). Go to the new project work directory with `cd [NEW-PROJECT]`.
1. Create new microservice schema `swagger.yaml` in root of the project.
1. Generate microservice code with command `microts`.
1. Read the _Next steps_ in the console and familiarize with the generated microservice server.
1. More information about the microservice is in the generated `README.md` file.
1. Add repository and license fields to the generated `package.json`.
1. The source `swagger.yaml` was copied to `src/conf/` directory. The source `swagger.yaml` can be deleted - as it is not used by the server.
1. Search for `TODO` in code, and implement the functionality.

## Microservice development

1. For debugging run the microservice with `npm run dev`.
1. After saving any change the source code is compiled to runtime form in `/dist` directory and the server is restarted.
1. The microservice UI helps by debugging the service. It shows also `curl` commands to call the actions in the service.

## OpenAPI / Swagger schema authoring

Microservice is declared with OpenAPI 2.0 (Swagger) `swagger.yaml` schema with API definition - you can use Swgger editor for schema definition. This design step is crucial for further quality and usage simplicity of the new API. Design is best made in discussion. It may be useful to author the schema with [Online Swagger Editor](https://editor.swagger.io/).

For cloud deployments code generator generates code for health check, if in schema is defined action `GET /health`.

## Generator code from GitHub

1. Download the generator with `git clone https://github.com/tomi-vanek/openapi-micro-ts.git` and go to project repository with `cd microts`
1. Download generator dependencies and tools with `npm i`.
1. Register the tool in local NPM with `npm link` command, so you can use it from command line in any directory with command `microts`.

## Generator in detail

The _openapi-micro-ts_ generator is a simple "one-shot" project initialization tool - after the code is generated, the service functionality is implemented with traditional manual coding.

The microservice interface is defined in form of [OpenAPI 2.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md) schema. (the libraries / tools used in generated code did not support the current version of OpenAPI yet...)

Generated application code is in TypeScript. Basic features of the generated code:

* TypeScript language
* Application configuration in directory `/src/conf`
* Node & Express server setup in `/src`
* Convention-based routing and request handlers in `/src/handlers` - request path corresponds the directory path, no explicit routing logic is needed
* Zero-code automatic input validation defined by rules in OpenAPI / Swagger schema
* User interface for microservice testing and administration in `/src/ui`
* `Dockerfile` for deployment image and `docker-compose.yaml` as an example usage in application integration
* End-to-end tests  in `/test`

Generate new code with command `microts -p PORT` - where _PORT_ is the default HTTP port of the service. For all command line properties call `microts -h`.

## Architecture shape

Generator does not offer rich set of options to tailor the result into different forms. This approach expresses author's architecture experience: generator is a way to define architecture without complex documentation, that gently directs developers in the architecture-envisioned direction:

* Developers are implementing the application logic in request handlers and tests.
* Non-functional concerns are hidden in the generated code.

_openapi-micro-ts_ generator in architecture:

* Operational definition of the architecture (as a replacement of write-only obsolete documentation :-)
* Consistency of project structure - simple global refactoring by changes of the runtime environment
* Developer focus on application code (minimizes developer's creativity in non-functional runtime and security concerns)

As an architect you have your own technical opinion, technology constraints / preferences and infrastructure & security services that have to be integrated into the (micro)service servers.

Just fork this project, or take an inspiration and build your own generator from an proof-of-concept service that best fits your expectations.
