const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const {
  isEmpty
} = require('../services/utils');
const Course = require('../models/Course');
const User = require('../models/User');
const {
  authorizeSession
} = require('../services/auth');

module.exports = () => {
  const router = express.Router();


  router.get('/', authorizeSession, async (req, res, next) => {
    try {
      // const courses = await Course.findAll(null, req.query.limit, req.query.offset);
      // log.info(`${req.method} ${req.originalUrl} success: returning ${courses.length} course(s)`);
      // return res.send(courses);
      res.send("IN courses!")
    } catch (error) {
      next(error);
    }
  });


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

  // // Find one course ---- // Do we want to keep this? Only need it if we will let courses have 2 IDs like users (one for database, one to see)
  // router.get('/:id(\\d+)', authorizeSession, async (req, res, next) => {
  //   try {
  //     const id = req.params.id;
  //     const course = await Course.findOneCourse({
  //       id: id
  //     });
  //     if (isEmpty(course)) {
  //       throw new HttpError.NotFound();
  //     }
  //     log.info(`${req.method} ${req.originalUrl} success: returning course ${id}`);
  //     return res.send(course);
  //   } catch (error) {
  //     next(error);
  //   }
  // });

  // Find one course
  router.get('/:id', authorizeSession, async (req, res, next) => {
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


  // Edit a course (PUT request)
  // Access via http://localhost:3000/courses/# (# is the id of the course to edit)
  // PUT body should contain JSON of email, (name, major, credits, semester)
  router.put('/:id', authorizeSession, async (req, res, next) => {
    try {
      // Get the course to edit and make sure it exists in database
      const id = req.params.id;
      const course = await Course.findOneCourse({
        id: id
      });

      // Get user Email and ensure the user exists in database
      const userEmail = req.body[0].email;
      const user = await User.findOne({
        email: userEmail
      });

      // If not enough parameters, error
      if (!id || !course || !userEmail) {
        throw HttpError(400, 'Missing parameters');
      } else if (isEmpty(course)) { // If course is not found, error
        throw new HttpError.NotFound();
      } else {
        // Check the user's role for permission (must be role 'director')
        if (user.role === 'director') {
          const newCourseJSON = {
            name: req.body[0].name,
            major: req.body[0].major,
            credits: req.body[0].credits,
            semester: req.body[0].semester
          };

          // Call the function to edit the course parameters and return results
          const updatedCourse = await Course.editCourse(id, newCourseJSON);
          res.status(200);
          res.send(updatedCourse);
        } else { // If user does not have permission, error
          res.status(403);
          res.send({
            error: 'You are not authorized to edit courses'
          });
        }
      }


      // res.setHeader('Location', `/users/${course.id}`);

    } catch (error) {
      next(error);
    }
  });



  return router;
};