const express = require('express');
const log = require('loglevel');
const HttpError = require('http-errors');
const {
    isEmpty
} = require('../services/utils');
const Semester = require('../models/Semester');
const User = require('../models/User');
const {
    authorizeSession,
    checkPermissions
} = require('../services/auth');

module.exports = () => {
    const router = express.Router();

    // JUST FOR TESTING PURPOSES
    router.get('/:id', authorizeSession, async (req, res, next) => {
        try {
            const id = req.params.id;
            const user = await Semester.findOne({
                id: id
            });
            if (isEmpty(user)) {
                throw new HttpError.NotFound();
            }
            log.info(`${req.method} ${req.originalUrl} success: returning semester ${id}`);
            return res.send(user);
        } catch (error) {
            next(error);
        }
    });

    router.delete('/:id', authorizeSession, async (req, res, next) => {
        try {
            const id = req.params.id;
            const userId = res.locals.userId;

            const sender = await User.findOne({userId: userId});

            if(checkPermissions(sender.role) < 1) {
                throw new HttpError(403, 'You are not allowed to do this');
            } else {
                const semester = await Semester.findOne({id: id});

                if(isEmpty(semester)) {
                    throw new HttpError(404, `No course by id ${id} was found`);
                }

                await Semester.deleteSemester(id);
                res.send();
            }
        } catch (err) {
            next(err);
        }
    });

    router.put('/:id', authorizeSession, async (req, res, next) => {
        try {

            // Get the course to edit and make sure it exists in database
            const id = req.params.id;
            const semester = await Semester.findOne({
                id: id
            });

            // Get userId from session ID
            const sender = await User.findOne({
                userId: res.locals.userId
            });

            // If not enough parameters, error
            if (!id || !semester || !sender) {
                throw HttpError(400, 'Missing parameters');
            } else if (isEmpty(semester)) { // If course is not found, error
                throw new HttpError.NotFound();
            } else {
                // Check the user's role for permission (must be role 'director')
                if (checkPermissions(sender.role) >= 1) {
                    const newSemesterJSON = {
                        year: req.body.year,
                        type: req.body.type
                    };

                    // Call the function to edit the course parameters and return results
                    const updatedSemester = await Semester.editSemester(id, newSemesterJSON);
                    res.status(200);
                    res.send(updatedSemester);
                } else { // If user does not have permission, error
                    res.status(403);
                    res.send({
                        error: 'You are not authorized to edit categories'
                    });
                }
            }
        } catch (error) {
            next(error);
        }
    });


    router.post('/', authorizeSession, async(req, res, next) => {

        try {
            const userId = res.locals.userId;
            const year = req.body.year;
            const type = req.body.type;
         
            if (!userId || !year || !type) {
                throw HttpError(400, 'id and year and type are required');
            }
            const user = await User.findOne({ userId: userId });
            
            if (user.role === 'user') {
                throw HttpError(403, `requester ${user.email} does not have permission to create a semester`);
            } else {
                const semester = await Semester.createSemester(year, type);
                log.info(`${req.method} ${req.originalUrl} success: creating semester`);
                return res.send(semester);
            }
        }catch(error) {
            next(error)
        }
    })





    return router;
};