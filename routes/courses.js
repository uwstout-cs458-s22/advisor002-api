const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { isEmpty } = require('./../services/utils');
const Course = require('./../models/Course');
const { authorizeSession } = require('./../services/auth');

module.exports = () => {
  const router = express.Router();
  
  router.get('/', authorizeSession, async (req, res, next) => {
    try {
      const courses = await Course.findAll(null, req.query.limit, req.query.offset);
      log.info(`${req.method} ${req.originalUrl} success: returning ${courses.length} course(s)`);
      return res.send(courses);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id(\\d+)', authorizeSession, async (req, res, next) => {
    try {
      const id = req.params.id;
      const course = await Course.findOne({ id: id });
      if (isEmpty(course)) {
        throw new HttpError.NotFound();
      }
      log.info(`${req.method} ${req.originalUrl} success: returning course ${id}`);
      return res.send(course);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:courseId', authorizeSession, async (req, res, next) => {
    try {
      const courseId = req.params.courseId;
      const course = await Course.findOne({ courseId: courseId });
      if (isEmpty(course)) {
        throw new HttpError.NotFound();
      }
      log.info(`${req.method} ${req.originalUrl} success: returning course ${courseId}`);
      return res.send(course);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:courseId', authorizeSession, async (req, res, next) => {
    try {
      const courseId = req.params.courseId;
      const course = await Course.remove({ courseId: courseId });
      if (isEmpty(course)) {
        throw new HttpError.NotFound();
      }
      return res.send(course);
    } catch (error) {
      next(error);
    }
  });

  // router.post('/', authorizeSession, async (req, res, next) => {
  //   try {
  //     const userId = req.body.userId;
  //     const email = req.body.email;
  //     if (!userId || !email) {
  //       throw HttpError(400, 'Required Parameters Missing');
  //     }
  //     let user = await User.findOne({ userId: userId });
  //     if (isEmpty(user)) {
  //       user = await User.create(userId, email);
  //       res.status(201); // otherwise
  //     }
  //     res.setHeader('Location', `/users/${user.id}`);
  //     log.info(`${req.method} ${req.originalUrl} success: returning user ${email}`);
  //     return res.send(user);
  //   } catch (error) {
  //     next(error);
  //   }
  // });

  return router;
};
