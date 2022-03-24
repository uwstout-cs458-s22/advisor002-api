const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { isEmpty } = require('./../services/utils');
const Course = require('./../models/Course');
const { authorizeSession } = require('./../services/auth');

module.exports = () => {
  const router = express.Router();

  router.delete('/:Id', authorizeSession, async (req, res, next) => {
    try {
      const Id = req.params.Id;
      const course = await Course.remove({ id: Id });
      if (isEmpty(course)) {
        throw new HttpError.NotFound();
      }
      return res.send(course);
    } catch (error) {
      next(error);
    }
  });

  return router;
};
