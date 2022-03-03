const log = require('loglevel');
const request = require('supertest');
const app = require('../app')();
const Course = require('../models/Course');

beforeAll(() => {
    log.disableAll();
});



jest.mock('../models/Course.js', () => {
    return {
        // findOne: jest.fn(),
        // findAll: jest.fn(),
        // create: jest.fn(),
        editCourse: jest.fn()

    };
});

jest.mock('../services/environment', () => {
    return {
        port: 3001,
        stytchProjectId: 'project-test-11111111-1111-1111-1111-111111111111',
        stytchSecret: 'secret-test-111111111111',
        masterAdminEmail: 'master@gmail.com',
    };
});

jest.mock('../services/auth', () => {
    return {
        authorizeSession: jest.fn().mockImplementation((req, res, next) => {
            return next();
        }),
    };
});


describe('PUT /courses', () => {
    beforeEach(() => {
        Course.findOneCourse.mockReset();
        Course.findOneCourse.mockResolvedValue(null);
        Course.editCourse.mockReset();
        Course.editCourse.mockResolvedValue(null);
    });


    // Skipping all tests for create, find, etc.


    // a helper that creates an array structure for getCourseById
    function dataForGetCourse(rows, offset = 0) {
        const data = [];
        for (let i = 1; i <= rows; i++) {
            const value = i + offset;
            data.push({
                id: `${value}`,
                name: `course${value}`,
                courseId: `courseTestId${value}`,
                major: 'compSci',
                credits: `${value}`,
                semester: 'summer',
            });
        }
        return data;
    }



    describe('Given id', () => {
        test('Testing calling Course.findOneCourse and Course.editCourse', async () => {
            const data = dataForGetCourse(3);
            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                const requestor = {
                    // id: 123,
                    // name: `courseTest`,
                    // courseId: `courseTestId`,
                    // major: 'Computer Science',
                    // credits: 1,
                    // semester: 'Spring',
                    id: 123,
                    email: 'fake@aol.com',
                    role: 'director',
                    enable: true,
                    userId: 'userId'
                }
                const requestParams = {
                    senderId: requestor.id,
                    role: requestor.role,
                    id: row.id,
                    name: row.name
                };
                const updatedCourse = {
                    id: row.id,
                    name: requestParams.name,
                    courseId: row.courseId,
                    major: row.major,
                    credits: row.credits,
                    semester: row.semester
                };

                Course.findOneCourse.mockResolvedValueOnce(row).mockResolvedValueOnce(requestor);
                Course.editCourse.mockResolvedValueOnce(updatedCourse);
                await request(app).put(`/courses/${row.id}`).send(requestParams);
                expect(Course.findOneCourse.mock.calls).toHaveLength((i + 1) * 2);
                expect(Course.findOneCourse.mock.calls[i]).toHaveLength(1);
                expect([row.id, requestor.id]).toContain(Course.findOneCourse.mock.calls[i + 1][0].id);
                expect(Course.editCourse.mock.calls).toHaveLength(i + 1);
                expect(Course.editCourse.mock.calls[i]).toHaveLength(2);
                expect(Course.editCourse.mock.calls[i][0]).toBe(row.id);
                expect(Course.editCourse.mock.calls[i][1]).toStrictEqual(requestParams);
            }
        });
        test('Return course ID in JSON', async () => {
            const data = dataForGetCourse(10);
            for (const row of data) {
                const requestor = {
                    id: 123,
                    email: 'fake@aol.com',
                    role: 'director',
                    enable: true,
                    userId: 'userId'
                }
                const requestParams = {
                    senderId: requestor.id,
                    role: 'director'
                };
                const updatedCourse = {
                    id: row.id,
                    name: row.name,
                    courseId: row.courseId,
                    major: row.major,
                    credits: row.credits,
                    semester: row.semester
                };

                Course.findOneCourse.mockResolvedValueOnce(row).mockResolvedValueOnce(requestor);
                Course.editCourse.mockResolvedValueOnce(updatedCourse);

                const {
                    body: course
                } = await request(app).put(`/courses/${row.id}`).send(requestParams);
                expect(course.id).toBe(row.id);
                expect(course.name).toBe(row.name);
                expect(course.courseId).toBe(row.courseId);
                expect(course.major).toBe(row.major);
                expect(course.credits).toBe(row.credits);
                expect(course.semester).toBe(row.semester);
            }
        });
        test('Throw 500 error', async () => {
            const data = dataForGetCourse(1);
            const row = data[0];
            const requestParams = {
                role: 'director'
            };
            Course.findOneCourse.mockResolvedValueOnce({
                row: row
            });
            Course.editCourse.mockRejectedValueOnce(new Error('Database error'));
            const response = await request(app).put('/courses/1').send(requestParams);
            expect(response.statusCode).toBe(500);
        });
        test('Throw 404 error', async () => {
            const requestParams = {
                role: 'director'
            };
            Course.findOneCourse.mockResolvedValueOnce({});
            Course.editCourse.mockRejectedValueOnce(new Error('No course present'));
            const response = await request(app).put('/courses/1').send(requestParams);
            expect(response.statusCode).toBe(404);
        });
        test('Throw 400 error', async () => {
            const data = dataForGetCourse(1);
            const row = data[0];
            Course.findOneCourse.mockResolvedValueOnce({
                row: row
            });
            Course.editCourse.mockRejectedValueOnce(new Error('Database error'));
            const response = await request(app).put('/courses/1').send();
            expect(response.statusCode).toBe(400);
        });
        test('Throw 403 error', async () => {
            const data = dataForGetCourse(1);
            const row = data[0];
            const requestor = {
                id: 123,
                email: 'fake@aol.com',
                role: 'director',
                enable: true,
                userId: 'userId'
            }
            const requestParams = {
                senderId: requestor.id,
                role: 'director',
                id: row.id
            };
            Course.findOneCourse.mockResolvedValueOnce(row).mockResolvedValueOnce(requestor);
            const response = await request(app).put(`/courses/${row.id}`).send(requestParams);
            expect(response.statusCode).toBe(403);
        });
    });
});