const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { authorizeSession } = require('./../services/auth');
const Course = require('./../models/Course');
const User = require('./../models/User');
const { isEmpty } = require('./../services/utils');

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
    } catch(error)
    {
      next(error);
    }
  });
      
  router.delete('/', authorizeSession, async (req, res, next) => {
    try {
      const Id = req.body.id;
      const course = await Course.findOne({ id: Id });
      if (!Id) {
        throw HttpError(400, 'Required Parameters Missing');
      }
      else if (isEmpty(course)) {
        throw new HttpError.NotFound();
      } else {
        const sender = await User.findOne({ userId: res.locals.userId });
        if(!(sender.role === 'director')) {
          throw new HttpError.Forbidden('You are not allowed to do this');
        }
        await Course.remove(Id);
        res.send();
      }
    } catch(error) {
       next(error);
    }
  });
  
  // not currently used, but searches for a course based on id
  router.get('/:id', authorizeSession, async (req, res, next) => {
    try {
      const id = req.params.id;
      const course = await Course.findOneCourse({
        id: id,
      });
      if (isEmpty(course)) {
        throw new HttpError.NotFound();
      }
      log.info(`${req.method} ${req.originalUrl} success: returning course ${id}`);
      return res.send(course);
    } catch (error) {
      next(error);
    }
  });

  // needs the id of the user making the request for authorization
  router.post('/', authorizeSession, async (req, res, next) => {
    try {
      const userId = req.body[0].userId;
      const courseId = req.body[0].courseId;
      const name = req.body[0].name;
      const major = req.body[0].major;
      const credits = req.body[0].credits;
      const semester = req.body[0].semester;
      if (!name || !userId || !major || !credits || !semester) {
        throw HttpError(400, 'Required Parameters Missing');
      }
      const user = await User.findOne({ id: userId });
      if (user.role !== 'director') {
        throw HttpError(
          403,
          `requester ${user.email} does not have permissions to create a course`
        );
      } else {
        const course = await Course.create(courseId, name, major, credits, semester);
        res.status(201); // otherwise
        res.setHeader('Location', `/courses/${name}`);
        log.info(`${req.method} ${req.originalUrl} success: returning course ${name}}`);
        return res.send(course);
      }
    } catch (error) {
      next(error);
    }
  });
  return router;
};
