const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');

module.exports = () => {
  const app = express();
  const routes = require('./routes')();
  app.use('/', routes);

  // default error catch
  app.use((request, response, next) => {
    return next(new HttpError.NotFound());
  });

  // error handler middleware
  app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || err.status || 500;
    log.error(`${req.method} ${req.originalUrl} ${err.statusCode}: ${err.message}`);
    res.status(err.statusCode).send({
      error: {
        status: err.statusCode,
        message: err.message,
      },
    });
  });

  return app;
};
