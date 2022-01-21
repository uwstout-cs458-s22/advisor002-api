## Developer Notes for Advisor API

### Development Environment Setup

#### Required Tools

- Node.js
- PostgreSQL
- Visual Studio Code
- GitHub Desktop
- Postman

#### Setup Instructions

Install the above tools, accept all defaults. You do NOT need to create a Postman account. Create a GitHub account with your UW-Stout email address. See notes on [README](/README.md) for instructions on how to clone this repo and install the npm packages.

_Database Setup_

- Open the pgAdmin tool.
- Set the master password
- Create a database, (i.e. advisordb), accept all defaults
- Don't create any tables or users

_Tools Setup_

- Install the following vscode extensions:
  eslint, prettier, prettier eslint, markdown all in one

- Make the following vscode setting changes:

  - Editor: Format on Save - turn on
  - Editor: Default Formatter - Prettier - Code Formatter (esbenp.prettier-vscode)
  - Eslint › Code Actions On Save: Mode - set to problems

**To run the API server**, from a terminal: run `npm start`

**To run the API server with nodemon**, from a terminal: run `npm run dev`, this will monitor for changes to codebase and will restart the server automatically if it detects a change, pretty nice for active development and testing.

**To run the API server in debug**, with vcode: Run > Start Debugging, Select Node.js if prompted

**To run all Jest tests**, from a terminal: run `npm test`

**To run all Jest tests in debug**, from a terminal: run `npm test:debug`

**To run an individual test**, from a terminal (in windows): run `npx jest -t "the test name"`. The test name is the first parameter in a jest test block, i.e. `test('the test name', async () => { ... `

**To run all tests in an test file**, from a terminal (in windows): run `npx jest <test file>`. e.g. `npx jest users.test.js`

#### Obtaining Bearer Tokens

Essentially, you need to mimic what the FE does to [generate a magic link](https://stytch.com/docs/api/log-in-or-create-user-by-email) with the Stytch Project ID and Secret (listed in Canvas) and your email address. You can make the request easily with CURL or you can use postman. When you receive the email, you can use that link (with the token) to then authenticate your email with Stytch (described above) and obtain the session token.

_TODO_ - Add Postman scripts with shortcuts to generate a magic link and authenticate token to obtain a session token.

### Development Conventions and Design NOtes

- Modules are either:
  - Interface, module.exports is an object, i.e. Services, Models
  - Instance, module.exports is a function returning in an instance, Apps and Routes
- camelCase naming convention shall be used for all naming. This includes Model columns, JSON fields, and Database table columns. Note that the Stytch API uses a snake_case onvention.
- PostgreSQL automatically unfolds all unquoted identifiers into lower case. To support the camelCase standard, all database names (table names, column names, etc.) should be quoted. Note the sqltools has built in quoting.
- All requires() that import from a node_module should be listed on top
- All requires() that import a function should be listed next on top
- All requires() that import an object should be listed after, in it's appropriately used scope
- Never push directly to the main or staging branches, use Pull requests only

### Error Handling

- All routes, if a thrown error is possible, should catch and forward (next(error)) to the Error handler in app.js
- If middleware (e.g. authorizeSession) encounters an unrecoverable error it should throw an HttpError
- All thrown errors should use http-errors modules to create errors

### Logging

- Always use `const log = require('loglevel');`
- Every route should have a log.info on a successful request
- thrown HttpErrors are caught and logged in the middleware error handler (in app.js), no additional logging is necessary
- Underlying services and middleware may use log.debug for logging successful events
- log.trace can be used for adhoc debugging, but should not be committed
- The logging level is set in the LOG_LEVEL environment variable, it defaults to `info`

### Definition of Done

The following criteria should be met before a Pull Request is created for the staging or main branches.

- Models require unit testing all functions mocking necessary services (e.g. database, environment)
- Routes require unit testing all expected outcomes mocking the Models used
- Source code is fully linted with no warnings
- All jest tests run successfully
- Source code is fully linted with no warnings
- All jest tests run successfully.
- Tests should achieve 100% coverage. Documentation and explanation should justify any exceptions.
