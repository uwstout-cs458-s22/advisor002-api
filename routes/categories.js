const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { isEmpty } = require('../services/utils');
const Category = require('../models/Category');
const User = require('../models/User');
const { authorizeSession, checkPermissions } = require('../services/auth');

module.exports = () => {
  const router = express.Router();

  // JUST FOR TESTING PURPOSES
  router.get('/:id', authorizeSession, async (req, res, next) => {
    try {
      const id = req.params.id;
      const user = await Category.findOne({
        id: id,
      });
      if (isEmpty(user)) {
        throw new HttpError.NotFound();
      }
      log.info(`${req.method} ${req.originalUrl} success: returning category ${id}`);
      return res.send(user);
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', authorizeSession, async (req, res, next) => {
    try {
      // Get the course to edit and make sure it exists in database
      const id = req.params.id;
      const category = await Category.findOne({
        id: id,
      });

      // Get userId from session ID
      const sender = await User.findOne({
        userId: res.locals.userId,
      });

      // If not enough parameters, error
      if (!id || !category || !sender) {
        throw HttpError(400, 'Missing parameters');
      } else if (isEmpty(category)) {
        // If course is not found, error
        throw new HttpError.NotFound();
      } else {
        // Check the user's role for permission (must be role 'director')
        if (checkPermissions(sender.role) >= 1) {
          const newCategoryJSON = {
            name: req.body.name,
            prefix: req.body.prefix,
          };

          // Call the function to edit the course parameters and return results
          const updatedCategory = await Category.editCategory(id, newCategoryJSON);
          res.status(200);
          res.send(updatedCategory);
        } else {
          // If user does not have permission, error
          res.status(403);
          res.send({
            error: 'You are not authorized to edit categories',
          });
        }
      }
    } catch (error) {
      next(error);
    }
  });

  // needs the id of the user making the request for authorization
  router.post('/', authorizeSession, async (req, res, next) => {
    try {
      const userId = res.locals.userId;
      const name = req.body.name;
      const prefix = req.body.prefix;

      if (!name || !prefix) {
        throw HttpError(400, 'Required Parameters Missing');
      }
      const user = await User.findOne({ userId: userId });
      if (user.role !== 'director') {
        throw HttpError(
          403,
          `requester ${user.email} does not have permissions to create a category`
        );
      } else {
        const category = await Category.createCategory(name, prefix);
        res.status(201); // otherwise
        res.setHeader('Location', `/category/${name}`);
        log.info(`${req.method} ${req.originalUrl} success: returning category ${name}}`);
        return res.send(category);
      }
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', authorizeSession, async (req, res, next) => {
    try {
      const userId = res.locals.userId;
      const id = req.params.id;
      if (!id) {
        throw HttpError(400, 'Required Parameters Missing');
      }
      const user = await User.findOne({ userId: userId });
      if (user.role !== 'admin') {
        throw HttpError(
          403,
          `requester ${user.email} does not have permissions to delete category`
        );
      } else {
        await Category.deleteCategory(id);
        res.status(200);
        res.send();
      }
    } catch (error) {
      next(error);
    }
  });

  return router;
};
