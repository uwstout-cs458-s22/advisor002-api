const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { authorizeSession, checkPermissions } = require('./../services/auth');
const Course = require('./../models/Course');
const User = require('./../models/User');
const { isEmpty } = require('./../services/utils');

module.exports = () => {
  const router = express.Router();

  // needs the id of the user making the request for authorization
  router.post('/', authorizeSession, async (req, res, next) => {
    try {

      const userId = res.locals.userId;
      const section = req.body[0].section;
      const name = req.body[0].name;
      const credits = req.body[0].credits;

      if (!name || !userId || !credits || !section) {
        throw HttpError(400, 'Required Parameters Missing');
      }
      const user = await User.findOne({ userId: userId });
      if (user.role !== 'director') {
        throw HttpError(
          403,
          `requester ${user.email} does not have permissions to create a course`
        );
      } else {
        const course = await Course.createCourse(name, credits, section);
        res.status(201); // otherwise
        res.setHeader('Location', `/courses/${name}`);
        log.info(`${req.method} ${req.originalUrl} success: returning course ${name}}`);
        return res.send(course);
      }
    } catch(error) {
      next(error);
    }
  });
  
  // Edit a course (PUT request)
  // Access via http://localhost:3000/courses/# (# is the id of the course to edit)
  // PUT body should contain JSON for course name, section, credits
  router.put('/:id', authorizeSession, async (req, res, next) => {
    try {

      // Get the course to edit and make sure it exists in database
      const id = req.params.id;
      const course = await Course.findOne({
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
        if (checkPermissions(sender.role) >= 1) {
          const newCourseJSON = {
            name: req.body.name,
            section: req.body.section,
            credits: req.body.credits,
            prefix: req.body.prefix
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
    } catch (error) {
      next(error);
    }
  });

  router.get('/', async (req, res, next) => {
    try {
      const criteria = {};

      if(req.query.credits) {
        if(!parseInt(req.query.credits) && req.query.credits !== '0') {
          throw HttpError(400, 'Credits must be a valid integer');
        }

        criteria.credits = req.query.credits;
      }

      if(req.query.name) {
        criteria.name = req.query.name;
      }

      if(req.query.type) {
        if(req.query.type !== 'fall' && req.query.type !== 'spring' && req.query.type !== 'winter' && req.query.type !== 'summer') {
          throw HttpError(400, 'Type must be one of fall, spring, summer, or winter');
        }

        criteria.type = req.query.type;
      }

      if(req.query.year) {
        if (!parseInt(req.query.year)) {
          throw HttpError(400, 'Year must be a valid integer');
        }

        criteria.year = req.query.year;
      }

      const courses = await Course.findAll(criteria,req.query.limit,req.query.offset);
      return res.send(courses)
    } catch (error) {
      next(error);
    }
  })

  router.get('/:courseid', authorizeSession, async (req, res, next) => {
    try {
      const courseid = req.params.courseid;
      const courses = await Course.findAll({id: courseid});
      if(isEmpty(courses)) {
        throw new HttpError.NotFound();
      }
      log.info(`${req.method} ${req.originalUrl} success: returning courses ${courseid}`);
      return res.send(courses);

    } catch (error) {
      next(error);
    }
  })

  router.delete('/', authorizeSession, async (req, res, next) => {
    try {
      const Id = req.body.id;
      if (isEmpty(req.body) || !Id) {
        throw new HttpError.BadRequest('Required parameters are missing');
      }
      if (res.locals.userId == null) {
        throw new HttpError.Forbidden('You are not allowed to do this');
      }
      const sender = await User.findOne({
        userId: res.locals.userId
      });
      if (!sender || isEmpty(sender)) {
        throw new HttpError.Forbidden('You are not allowed to do this');
      }
      if (!(sender.role === 'director')) {
        throw new HttpError.Forbidden('You are not allowed to do this');
      }
      const course = await Course.findOne({
        id: Id
      });
      if (isEmpty(course)) {
        throw new HttpError.NotFound();
      }
      await Course.deleteCourse(Id);
      return res.send();
    } catch (error) {
      next(error);
    }
  });

  return router;
};
