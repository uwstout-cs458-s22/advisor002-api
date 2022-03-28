const express = require('express');
// const HttpError = require('http-errors');
// const { isEmpty } = require('../services/utils');
const Course = require('../models/Course');
const { authorizeSession } = require('../services/auth');
const log = require('loglevel');

module.exports = () => {
  const router = express.Router();

  router.get('/', authorizeSession, async (req, res, next) => {
    try {
      const criteria = {};
      const query = req.query.query ? req.query.query : null;

      if (req.query.id) {
        criteria.id = req.query.role;
      }

      if (req.query.role) {
        criteria.role = req.query.role;
      }

      let courses = [];

      courses = await Course.findAll(criteria, query, req.query.limit, req.query.offset);

      log.info(`${req.method} ${req.originalUrl} success: returning ${courses.length} user(s)`);
      return res.send(courses);
    } catch (error) {
      next(error);
    }
  });
  return router;
};
