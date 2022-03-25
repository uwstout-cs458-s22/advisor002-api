const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { isEmpty } = require('./../services/utils');
const Course = require('./../models/Course');
const User = require('./../models/User');
const { authorizeSession } = require('./../services/auth');

module.exports = () => {
  const router = express.Router();


  // Find one course - STILL REQUIRES JEST/MOCK TESTS
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


  // Edit a course (PUT request)
  // Access via http://localhost:3000/courses/# (# is the id of the course to edit)
  // PUT body should contain JSON for course name, courseId, credits
  router.put('/:id', authorizeSession, async (req, res, next) => {
    try {
      // Get the course to edit and make sure it exists in database
      const id = req.params.id;
      const course = await Course.findOneCourse({
        id: id
      });

      // Get userId from session ID
      const sender = await User.findOne({
        userId: res.locals.userId
      });

      // If not enough parameters, error
      if (!id || !course || !sender) {
        throw HttpError(400, 'Missing parameters');
      } else if (isEmpty(course)) { // If course is not found, error
        throw new HttpError.NotFound();
      } else {
        // Check the user's role for permission (must be role 'director')
        if (sender.role === 'director') {
          const newCourseJSON = {
            name: req.body.name,
            courseId: req.body.courseId,
            credits: req.body.credits
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
    } catch (error) {
      next(error);
    }
  });


  return router;
};

