const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const { isEmpty } = require('./../services/utils');
const User = require('./../models/User');
const { authorizeSession } = require('./../services/auth');

module.exports = () => {
    const router = express.Router();
    router.get('/', authorizeSession, async (req, res, next) => {
        try {
          const criteria = {};
          const query = req.query.query ? req.query.query : null;
    
          if(req.query.enable) {
            criteria.enable = (req.query.enable === 'true');
          }
    
          if(req.query.role) {
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

};