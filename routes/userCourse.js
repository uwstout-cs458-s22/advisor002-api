const express = require('express');
const HttpError = require('http-errors');
const { authorizeSession, checkPermissions } = require('./../services/auth');
const UserCourse = require('./../models/UserCourse');
const Course = require('./../models/Course');
const User = require('./../models/User');
const log = require('loglevel');
const Semester = require('./../models/Semester');
// const Semester = require('./../models/Semester');
const { isEmpty } = require('./../services/utils');

module.exports = () => {
  const router = express.Router();

  router.post('/', authorizeSession, async (req, res, next) => {
    try {
      if (isEmpty(req.body) || isEmpty(req.body[0])) {
        throw new HttpError.BadRequest('Required parameters are missing');
      }
      // Verify Parameters
      const userId = req.body[0].userId
      const courseId = req.body[0].courseId
      const semesterId = req.body[0].semesterId
      const taken = req.body[0].taken // Not required
      if (!userId || !courseId || !semesterId) {
        throw new HttpError.BadRequest('Required parameters are missing');
      }
      // Verify permissions
      const currentUserId = res.locals.userId
      const currentUser = await User.findOne({ userId: currentUserId });
      if (!currentUser || isEmpty(currentUser)) {
        throw new HttpError.Forbidden('You are not allowed to do this');
      }
      if (!(currentUserId === userId || checkPermissions(currentUser.role) >= 1)) {
        throw new HttpError.Forbidden('You are not allowed to do this');
      }
      const user = await User.findOne({ id: userId });
      const course = await Course.findOne({ id: courseId });
      const semester = await Semester.findOne({ id: semesterId }); // await Semester.findOne({ id: semesterId }); // Needs semester to work properly
      if (isEmpty(user) || isEmpty(course) || isEmpty(semester)) {
        throw new HttpError.BadRequest('Invalid parameters');
      }
      await UserCourse.createUserCourse(userId, courseId, semesterId, taken)
      log.debug(`Successfully created userCourse {${userId}, ${courseId}, ${semesterId}}`)
      res.send()
    } catch(error) {
      next(error);
    }
  });

  router.put('/', authorizeSession, async (req, res, next) => {
    try {
      if (isEmpty(req.body) || isEmpty(req.body[0])) {
        throw new HttpError.BadRequest('Required parameters are missing');
      }
      // Verify Parameters
      const userId = req.body[0].userId
      const courseId = req.body[0].courseId
      const semesterId = req.body[0].semesterId
      const taken = req.body[0].taken
      if (!userId || !courseId || !semesterId || typeof taken !== 'boolean') {
        throw new HttpError.BadRequest('Required parameters are missing');
      }
      // Verify permissions
      const currentUserId = res.locals.userId
      const currentUser = await User.findOne({ userId: currentUserId });
      if (!currentUser || isEmpty(currentUser)) {
        throw new HttpError.Forbidden('You are not allowed to do this');
      }
      if (!(currentUserId === userId || checkPermissions(currentUser.role) >= 1)) {
        throw new HttpError.Forbidden('You are not allowed to do this');
      }
      // Verify valid parameters
      const userCourseFound = await UserCourse.findOne({ userid : userId, courseid: courseId, semesterid: semesterId })
      if (!userCourseFound || isEmpty(userCourseFound)) {
        console.log("WHAT??")
        throw new HttpError.BadRequest('Invalid parameters');
      }
      const updatedUserCourse = await UserCourse.editUserCourse(userId, courseId, semesterId, taken)
      log.debug(`Successfully edited userCourse {${userId}, ${courseId}, ${semesterId}}`)
      res.send(updatedUserCourse)
    } catch(error) {
      next(error);
    }
  });

  router.delete('/', authorizeSession, async (req, res, next) => {
    try {
      if (!req.body || isEmpty(req.body) || isEmpty(req.body[0])) {
        throw new HttpError.BadRequest('Required parameters are missing');
      }
      // Verify Parameters
      const userId = req.body[0].userId
      const courseId = req.body[0].courseId
      const semesterId = req.body[0].semesterId
      if (!userId || !courseId || !semesterId) {
        throw new HttpError.BadRequest('Required parameters are missing');
      }
      // Verify permissions
      const currentUserId = res.locals.userId
      const currentUser = await User.findOne({ userId: currentUserId });
      if (!currentUser || isEmpty(currentUser)) {
        throw new HttpError.Forbidden('You are not allowed to do this');
      }
      if (!(currentUserId === userId || checkPermissions(currentUser.role) >= 1)) {
        throw new HttpError.Forbidden('You are not allowed to do this');
      }
      // Verify valid parameters
      const userCourseFound = await UserCourse.findOne({ userid : userId, courseid: courseId, semesterid: semesterId })
      if (!userCourseFound || isEmpty(userCourseFound)) {
        console.log("WHAT??")
        throw new HttpError.BadRequest('Invalid parameters');
      }
      await UserCourse.deleteUserCourse(userId, courseId, semesterId)
      log.debug(`Successfully deleted userCourse {${userId}, ${courseId}, ${semesterId}}`)
      res.send()
    } catch(error) {
      next(error);
    }
  });

  router.get('/', authorizeSession, async (req, res, next) => {
    try {
      if (!req.body || isEmpty(req.body) || isEmpty(req.body[0])) {
        throw new HttpError.BadRequest('Required parameters are missing');
      }
      // Verify Parameters
      const userId = req.body[0].userId
      const courseId = req.body[0].courseId
      const semesterId = req.body[0].semesterId
      if (!userId || !courseId || !semesterId) {
        throw new HttpError.BadRequest('Required parameters are missing');
      }
      // Verify permissions
      const currentUserId = res.locals.userId
      const currentUser = await User.findOne({ userId: currentUserId });
      if (!currentUser || isEmpty(currentUser)) {
        throw new HttpError.Forbidden('You are not allowed to do this');
      }
      if (!(currentUserId === userId || checkPermissions(currentUser.role) >= 1)) {
        throw new HttpError.Forbidden('You are not allowed to do this');
      }
      const userCourseGotten = await UserCourse.findOne({ userid : userId, courseid: courseId, semesterid: semesterId })
      if (!userCourseGotten || isEmpty(userCourseGotten)) {
        throw new HttpError.NotFound('No course found');
      }
      log.debug(`Successfully found userCourse ${JSON.stringify(userCourseGotten)}`)
      res.send(userCourseGotten)
    } catch(error) {
      next(error);
    }
  });

  return router;
};
