const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { isEmpty } = require('./../services/utils');
const User = require('./../models/User');
const { authorizeSession, checkPermissions } = require('./../services/auth');

module.exports = () => {
  const router = express.Router();

  router.get('/', authorizeSession, async (req, res, next) => {
    try {
      const criteria = {};
      const query = req.query.query ? req.query.query : null;

      if (req.query.enable) {
        criteria.enable = req.query.enable === 'true';
      }

      if (req.query.role) {
        criteria.role = req.query.role;
      }

      let users = [];

      users = await User.findAll(criteria, query, req.query.limit, req.query.offset);

      log.info(`${req.method} ${req.originalUrl} success: returning ${users.length} user(s)`);
      return res.send(users);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id(\\d+)', authorizeSession, async (req, res, next) => {
    try {
      const id = req.params.id;
      const user = await User.findOne({ id: id });
      if (isEmpty(user)) {
        throw new HttpError.NotFound();
      }
      log.info(`${req.method} ${req.originalUrl} success: returning user ${id}`);
      return res.send(user);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:userId', authorizeSession, async (req, res, next) => {
    try {
      const userId = req.params.userId;
      const user = await User.findOne({ userId: userId });
      if (isEmpty(user)) {
        throw new HttpError.NotFound();
      }
      log.info(`${req.method} ${req.originalUrl} success: returning user ${userId}`);
      return res.send(user);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:userid/schedule', async (req, res, next) => {
    try {
      const userid = req.params.userid;
      const semesterid = req.query.semesterid;
      const year = req.query.year;
      const type = req.query.type;

      const semesterschedule = await User.getSemesterSchedule(userid, semesterid, year, type);
      return res.send(semesterschedule);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:userid/courseplan', authorizeSession, async (req, res, next) => {
    try {
      const userid = req.params.userid;
      const courseid = req.body[0].courseid;
      const semesterid = req.body[0].semesterid;
      const sender = await User.findOne({ userId: res.locals.userId });

      if (sender.id === userid || checkPermissions(sender.role) > 0) {
        const usersCourses = await User.findUsersCourses(userid, courseid, semesterid);
        return res.send(usersCourses);
      } else {
        throw HttpError(
          403,
          `Forbidden if user is not the user viewing, or if the user viewing is not an admin or director`
        );
      }
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id(\\d+)', authorizeSession, async (req, res, next) => {
    try {
      const id = req.params.id;
      const user = await User.findOne({ id: id });

      if (isEmpty(req.body)) {
        throw new HttpError.BadRequest('Required parameters are missing');
      }

      const sender = await User.findOne({ userId: res.locals.userId });

      if (isEmpty(user) || isEmpty(sender)) {
        throw new HttpError.NotFound();
      }
      
      if(checkPermissions(sender.role) < 2) {
        throw new HttpError.Forbidden('You are not allowed to do this');
      }

      const updatedUser = await User.update(user.id, req.body);

      res.setHeader('Location', `/users/${user.id}`);
      return res.send(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  router.post('/', authorizeSession, async (req, res, next) => {
    try {
      const userId = req.body.userId;
      const email = req.body.email;
      if (!userId || !email) {
        throw HttpError(400, 'Required Parameters Missing');
      }
      let user = await User.findOne({ userId: userId });
      if (isEmpty(user)) {
        user = await User.create(userId, email);
        res.status(201); // otherwise
      }
      res.setHeader('Location', `/users/${user.id}`);
      log.info(`${req.method} ${req.originalUrl} success: returning user ${email}`);
      return res.send(user);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id(\\d+)', async (req, res, next) => {
    try {
      const id = req.params.id;
      const senderId = res.locals.userId;
      const user = await User.findOne({ id: id });
      const sender = await User.findOne({ userId: senderId });

      // check for required parameters
      if (!id) {
        throw HttpError(400, 'Required Parameters Missing');
      }
      // check that user exists
      else if (isEmpty(user)) {
        throw new HttpError.NotFound();
      } else {
        if (checkPermissions(sender.role) >= 2 || user.email === sender.email) {
          await User.deleteUser(id);
          res.status(200);
          res.send();
        } else {
          res.status(403);
          res.send({ error: 'You are not authorized to do this' });
        }
      }
    } catch (error) {
      next(error);
    }
  });
  return router;
};
