## advisor001-api

The Program Course Advisor (Advisor) is an app designed to facilitate easier course planning for students and advisors of UW-Stout. The app is being developed in the CS458 capstone course.

This repository is the RESTFUL API back-end for the Advisor web app.

[Developer Notes](docs/developer.md)

[API Documentation](docs/api.md)

### Running the API

Prerequisite: Node.js 14+ must be installed first and you must have a connection string to an accessible PostgreSQL database.

- Clone this repo
- Create a .env in the root of this repo, and set the following environment variables:
  ```env
  PORT=3000
  DATABASE_URL=postgres://postgres:<masterpassword>@localhost:5432/<dbname>
  STYTCH_PROJECT_ID=<See Canvas Notes>
  STYTCH_SECRET=<See Canvas Notes>
  MASTER_ADMIN_EMAIL=<your UW-Stout Email>
  ```
- Open a terminal in the root of this repo:
  - Run `npm install`
  - After install, an audit is run and should show `found 0 vulnerabilities`, if however it says vulnerabilities were found, then run `npm audit fix`
  - Run `npm start`
