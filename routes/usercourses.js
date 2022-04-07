const express = require('express');
// const log = require('loglevel');
// const HttpError = require('http-errors');
// const { isEmpty } = require('../services/utils');
// const Course = require('../models/Course');
// const User = require('../models/User');
const UserCourse = require('../models/UserCourse');
const { authorizeSession } = require('../services/auth');

module.exports = () => {
  const router = express.Router();

  router.get('/:userid', authorizeSession, async (req, res, next) => {
    try {
      const userid = req.params.userid;
      const semesterid = req.params.semesterid;
      const year = req.params.year;

      const semesterschedule = await UserCourse.getSemesterSchedule(userid, semesterid, year);
      return res.send(semesterschedule);
    } catch (error) {
      next(error);
    }
  });
  return router;
};
