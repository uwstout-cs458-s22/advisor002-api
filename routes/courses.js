const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const {
  isEmpty
} = require('../services/utils');
const Course = require('../models/Course');
const {
  authorizeSession
} = require('../services/auth');

module.exports = () => {
  const router = express.Router();

  // Find all courses
  //   router.get('/', authorizeSession, async (req, res, next) => {
  //     try {
  //       const coursesAll = await Course.findAll(null, req.query.limit, req.query.offset);
  //       log.info(`${req.method} ${req.originalUrl} success: returning ${coursesAll.length} course(s)`);
  //       return res.send(coursesAll);
  //     } catch (error) {
  //       next(error);
  //     }
  //   });

  // Find one course ---- // Do we want to keep this? Only need it if we will let courses have 2 IDs like users (one for database, one to see)
  router.get('/:id(\\d+)', authorizeSession, async (req, res, next) => {
    try {
      const id = req.params.id;
      const course = await Course.findOneCourse({
        id: id
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

  // Find one course
  router.get('/:courseId', authorizeSession, async (req, res, next) => {
    try {
      const courseId = req.params.userId;
      const course = await Course.findOneCourse({
        courseId: courseId
      });
      if (isEmpty(course)) {
        throw new HttpError.NotFound();
      }
      log.info(`${req.method} ${req.originalUrl} success: returning course ${courseId}`);
      return res.send(course);
    } catch (error) {
      next(error);
    }
  });

  // Create a new course
  //   router.post('/', authorizeSession, async (req, res, next) => {
  //     try {
  //       const courseId = req.body.courseId;
  //       const name = req.body.name;
  //       const major = req.body.major;
  //       const credits = req.body.credits;
  //       const semester = req.body.semester;
  //       if (!courseId || !name || !major || !credits || !semester) {
  //         throw HttpError(400, 'Required Parameters Missing');
  //       }
  //       let course = await Course.findOneCourse({ courseId: courseId });
  //       if (isEmpty(course)) {
  //         course = await Course.create(courseId, name, major, credits, semester);
  //         res.status(201); // otherwise
  //       }
  //       res.setHeader('Location', `/courses/${course.id}`);
  //       log.info(`${req.method} ${req.originalUrl} success: returning course ${courseId}`);
  //       return res.send(course);
  //     } catch (error) {
  //       next(error);
  //     }
  //   });


  // Update a course
  router.put('/:id(\\d+)', authorizeSession, async (req, res, next) => {
    try {
      const courseId = req.params.courseId;
      const course = await Course.findOneCourse({
        id: courseId
      });

      if (isEmpty(course)) {
        throw new HttpError.NotFound();
      }

      if (isEmpty(req.body)) {
        throw new HttpError.BadRequest();
      }

      const sender = await Course.findOneCourse({
        id: req.body.senderId
      });

      if (!(sender.role === 'director' || course.id === sender.id)) {
        throw new HttpError.Forbidden();
      }

      const resultCourse = await Course.editCourse(Course.id, req.body);

      res.setHeader('Location', `/users/${course.id}`);
      return res.send(resultCourse);

    } catch (error) {
      next(error);
    }
  });



  return router;
};