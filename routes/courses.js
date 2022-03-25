const express = require('express');
const HttpError = require('http-errors');
const { isEmpty } = require('./../services/utils');
const Course = require('./../models/Course');
// const User = require('./../models/User');
const { authorizeSession } = require('./../services/auth');

module.exports = () => {
  const router = express.Router();

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
        // prep for auth
        // const sender = await User.findOne({ userId: res.locals.userId });
        // if(!(sender.role === 'director' || sender.role === 'admin')) {
        //   throw new HttpError.Forbidden('You are not allowed to do this');
        // }
        await Course.remove(Id);
      }
    } catch (error) {
      next(error);
    }
  });

  return router;
};
