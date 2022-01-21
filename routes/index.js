const bodyParser = require('body-parser');
const express = require('express');
const log = require('loglevel');

module.exports = () => {
  const router = express.Router();
  router.use(bodyParser.urlencoded({ extended: true }));
  router.use(bodyParser.json());
  const usersRoutes = require('./users')();
  router.use('/users', usersRoutes);
  router.get('/health', (req, res) => {
    const uptime = process.uptime();
    const data = {
      uptime: uptime,
      message: 'Ok',
      date: new Date(),
    };
    log.info(`${req.method} ${req.originalUrl} success: Online for ${uptime} seconds`);
    res.status(200).send(data);
  });
  return router;
};
