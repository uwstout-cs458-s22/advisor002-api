const bodyParser = require('body-parser');
const express = require('express');
const log = require('loglevel');

module.exports = () => {
  const router = express.Router();
<<<<<<< HEAD
  router.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
=======
  router.use(bodyParser.urlencoded({
    extended: true
  }));
>>>>>>> staging
  router.use(bodyParser.json());
  const usersRoutes = require('./users')();
  router.use('/users', usersRoutes);
  const coursesRoutes = require('./courses')();
  router.use('/courses', coursesRoutes);
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