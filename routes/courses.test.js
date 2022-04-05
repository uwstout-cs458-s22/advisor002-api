const log = require('loglevel');
const request = require('supertest');
const app = require('../app')();
const Course = require('../models/Course');
const User = require('../models/User');

beforeAll(() => {
  log.disableAll();
});
// use for creating course 
function dataForGetCourses(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    data.push({
      id: `${value}`,
      section: value ,
      name: `Course-${value}`,
      credits: 3
    });
  }
  return data;
}

jest.mock('../models/Course.js', () => {
  return {
    findOne: jest.fn(),
    createCourse: jest.fn(),
    findAll: jest.fn(),
    editCourse: jest.fn(),
    deleteCourse: jest.fn()
  };
});

jest.mock('../models/User.js', () => {
  return {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    deleteUser: jest.fn(),
    update: jest.fn()
  };
});

jest.mock('../services/environment', () => {
  return {
    port: 3001,
    stytchProjectId: 'project-test-11111111-1111-1111-1111-111111111111',
    stytchSecret: 'secret-test-111111111111',
    masterAdminEmail: 'master@gmail.com'
  };
});

jest.mock('../services/auth', () => {
  return {
    authorizeSession: jest.fn().mockImplementation((req, res, next) => {
      res.locals.userId = 'user-test-thingy';
      return next();
    }),
  };
});



// a helper that creates an array structure for getCourseById
function dataForGetCourse(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    data.push({
      id: `${value}`,
      name: 'courseTest',
      section: `${value}`,
      credits: `${value}`
    });
  }
  return data;
}



describe('DELETE /courses', () => {
  beforeEach(() => {
    Course.findOne.mockReset();
    Course.findOne.mockResolvedValue(null);
    User.findOne.mockReset();
    User.findOne.mockResolvedValue(null);
  });

  test('Parameters missing', async () =>  {
    const response = await request(app).delete('/courses').send({});
    expect(response.statusCode).toBe(400);
  });

  test('Cannot find locals.userId', async () =>  {
    Course.findOne.mockResolvedValueOnce({id: `145`,
    section: `505`,
      name: `course name`,
      credits: 3})

    const response = await request(app).delete('/courses').send({ id: "145"});
    expect(response.statusCode).toBe(403);
  });

  test('User should not be allowed to delete course', async () =>  {
    Course.findOne.mockResolvedValueOnce({id: `145`,
      section: `505`,
      name: `course name`,
      credits: 3})
    User.findOne.mockResolvedValueOnce({id: 12345,
      email: `emailmine@uwstout.edu`,
      userId: `user-test-someguid`,
      enable: 'false',
      role: 'user'})

    const response = await request(app).delete('/courses').send({ id: "145"});
    expect(response.statusCode).toBe(403);
  });

  test('Admin should not be allowed to delete course', async () =>  {
    Course.findOne.mockResolvedValueOnce({id: `145`,
      section: `505`,
      name: `course name`,
      credits: 3})

    User.findOne.mockResolvedValueOnce({id: 12345,
      email: `emailmine@uwstout.edu`,
      userId: `user-test-someguid`,
      enable: 'false',
      role: 'admin'})

    const response = await request(app).delete('/courses').send({ id: "145"});
    expect(response.statusCode).toBe(403);
  });

  test('Director should be allowed to delete course', async () =>  {
    Course.findOne.mockResolvedValueOnce({id: `145`,
      section: `505`,
      name: `course name`,
      credits: 3})

    User.findOne.mockResolvedValueOnce({id: 12345,
      email: `emailmine@uwstout.edu`,
      userId: `user-test-someguid`,
      enable: 'false',
      role: 'director'})

    Course.deleteCourse.mockResolvedValueOnce(`Successfully deleted course from db`);

    const response = await request(app).delete('/courses').send({ id: "145"});
    expect(response.statusCode).toBe(200);
  });

  test('Course should not be empty', async () =>  {
    Course.findOne.mockResolvedValueOnce({})

    User.findOne.mockResolvedValueOnce({id: 12345,
      email: `emailmine@uwstout.edu`,
      userId: `user-test-someguid`,
      enable: 'false',
      role: 'director'})

    const response = await request(app).delete('/courses').send({ id: "145"});
    expect(response.statusCode).toBe(404);
  });
});


  // Skipping all tests for create

describe('PUT /courses', () => {
  beforeEach(() => {
    Course.findOne.mockReset();
    Course.findOne.mockResolvedValue(null);
    User.findOne.mockReset();
    User.findOne.mockResolvedValue(null);
    Course.editCourse.mockReset();
    Course.editCourse.mockResolvedValue(null);
  });

  describe('Given id', () => {
    test('Testing calling Course.findOne and Course.editCourse', async () => {

      const data = dataForGetCourse(1);
      const row = data[0];

      const newCourseParams = {
        name: 'TestClass',
        section: 5,
        credits: 4
      };

      const resultCourseParams = {
        id: row.id,
        name: 'TestClass',
        section: 5,
        credits: 4
      };

      Course.findOne.mockResolvedValueOnce({
        id: row.id,
        name: row.name,
        section: row.section,
        credits: row.credits
      })
      User.findOne.mockResolvedValueOnce({
        id: 456,
        email: 'fake@aol.com',
        role: 'director',
        enable: true,
        userId: 'userId'
      })

      Course.editCourse.mockResolvedValueOnce({
        resultCourseParams
      });

      const response = await request(app).put(`/courses/${row.id}`).send(newCourseParams);
      expect(response.statusCode).toBe(200);
    });

    test('Return course ID in JSON', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];

      const newCourseParams = {
        name: 'TestClass',
        section: 5,
        credits: 4
      };

      const resultCourseParams = {
        id: row.id,
        name: 'TestClass',
        section: 5,
        credits: 4
      };

      Course.findOne.mockResolvedValueOnce({
        id: row.id,
        name: row.name,
        section: row.section,
        credits: row.credits
      })
      User.findOne.mockResolvedValueOnce({
        id: 456,
        email: 'fake@aol.com',
        role: 'director',
        enable: true,
        userId: 'userId'
      })

      Course.editCourse.mockResolvedValueOnce({
        resultCourseParams
      });

      const {
        body: course
      } = await request(app).put(`/courses/${row.id}`).send(newCourseParams);
      expect(course.id).toBe(newCourseParams.id);
    });

    test('Throw 500 error for extra errors', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];
      const requestParams = {
        email: 'Dummy@Data.com',
        name: 'DummyCourseData'
      };
      Course.findOne.mockResolvedValueOnce({
        row: row
      });
      User.findOne.mockResolvedValueOnce({
        id: 456,
        email: 'fake@aol.com',
        role: 'director',
        enable: true,
        userId: 'userId'
      })
      Course.editCourse.mockRejectedValueOnce(new Error('Database error'));
      const response = await request(app).put(`/courses/${row.id}`).send(requestParams);
      expect(response.statusCode).toBe(500);
    });

    test('Throw 404 error course not found', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];

      Course.findOne.mockResolvedValueOnce({});
      User.findOne.mockResolvedValueOnce({
        id: 456,
        email: 'fake@aol.com',
        role: 'director',
        enable: true,
        userId: 'userId'
      })

      const response = await request(app).put(`/courses/${row.id}`).send({
        course: row
      });
      expect(response.statusCode).toBe(404);
    });

    test('Throw 400 error', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];
      Course.findOne.mockResolvedValueOnce({
        row: row
      });

      const response = await request(app).put(`/courses/${row.id}`).send({})

      expect(response.statusCode).toBe(400);
    });

    test('Throw 403 error', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];

      const newCourseParams = {
        section: 'TestClass546',
        name: 'TestClass',
        credits: 4
      };

      Course.findOne.mockResolvedValueOnce({
        section: 'TestClass123',
        name: 'TestClass',
        credits: 3
      })
      User.findOne.mockResolvedValueOnce({
        id: 456,
        email: 'fake@aol.com',
        role: 'user',
        enable: true,
        userId: 'userId'
      })

      const response = await request(app).put(`/courses/${row.id}`).send({
        course: newCourseParams
      });
      expect(response.statusCode).toBe(403);
    });
  });
});

describe('POST /courses', () => {
  beforeEach(() => {
    Course.findOne.mockReset();
    Course.findOne.mockResolvedValue(null);
    User.findOne.mockReset();
    User.findOne.mockResolvedValue(null);
  });

  test('should return 400 errror when create course parameters missing', async () =>  {
    User.findOne.mockResolvedValueOnce({id: 12345,
      email: `emailmine@uwstout.edu`,
      userId: `user-test-someguid`,
      enable: 'false',
      role: 'user'});

    const fakeCourse = {name: 'operating systems', credits: 4, section: 2};
    Course.findOne.mockResolvedValueOnce(fakeCourse);

    const response = await request(app).post('/courses').send([{}]);

    expect(response.statusCode).toBe(400);
  });

  test('User should not be allowed to create course', async () =>  {
    User.findOne.mockResolvedValueOnce({id: 12345,
      email: `emailmine@uwstout.edu`,
      userId: `user-test-someguid`,
      enable: 'false',
      role: 'user'})

    const response = await request(app).post('/courses').send([{
      section: 505,
      name: `course name`,
      credits: 3}]);
    expect(response.statusCode).toBe(403);
  });

  test('Admin should not be allowed to create course', async () =>  {

    User.findOne.mockResolvedValueOnce({id: 12345,
      email: `emailmine@uwstout.edu`,
      userId: `user-test-someguid`,
      enable: 'false',
      role: 'admin'})

    const response = await request(app).post('/courses').send([{
      section: 505,
      name: `course name`,
      credits: 3}]);
    expect(response.statusCode).toBe(403);
  });

  test('Director should be allowed to create course', async () =>  {

    User.findOne.mockResolvedValueOnce({id: 12345,
      email: `emailmine@uwstout.edu`,
      userId: `user-test-someguid`,
      enable: 'false',
      role: 'director'})

    Course.deleteCourse.mockResolvedValueOnce(`Successfully deleted course from db`);

    const response = await request(app).post('/courses').send([{ 
      section: 505,
      name: `course name`,
      credits: 3}]);
    expect(response.statusCode).toBe(201);
  });
});
describe('Get /courses', () => {
  beforeEach(() => {
    Course.findOne.mockReset();
    Course.findOne.mockResolvedValue(null);
    Course.findAll.mockReset();
    Course.findAll.mockResolvedValue(null);
  })
  describe('querying a group of courses', () => {
    test('should make a call to Course.findAll', async () => {
      const data = dataForGetCourses(10);
      Course.findAll.mockResolvedValueOnce(data);
      await request(app).get('/courses');
      expect(Course.findAll.mock.calls).toHaveLength(1);
      expect(Course.findAll.mock.calls[0]).toHaveLength(3);
      expect(Course.findAll.mock.calls[0][0]).toStrictEqual({});
      expect(Course.findAll.mock.calls[0][1]).toBeUndefined();
      expect(Course.findAll.mock.calls[0][2]).toBeUndefined();
    });

    test('should make a call to findAll - with limits', async () => {
      const data = dataForGetCourses(3);
      Course.findAll.mockResolvedValueOnce(data);
      await request(app).get('/courses?limit=3');
      expect(Course.findAll.mock.calls).toHaveLength(1);
      expect(Course.findAll.mock.calls[0]).toHaveLength(3);
      expect(Course.findAll.mock.calls[0][0]).toStrictEqual({});
      expect(Course.findAll.mock.calls[0][1]).toBe('3');
      expect(Course.findAll.mock.calls[0][2]).toBeUndefined();
    });

    test('should make a call to findAll - with offset', async () => {
      const data = dataForGetCourses(3);
      Course.findAll.mockResolvedValueOnce(data);
      await request(app).get('/courses?offset=1');
      expect(Course.findAll.mock.calls).toHaveLength(1);
      expect(Course.findAll.mock.calls[0]).toHaveLength(3);
      expect(Course.findAll.mock.calls[0][0]).toStrictEqual({});
      expect(Course.findAll.mock.calls[0][1]).toBeUndefined();
      expect(Course.findAll.mock.calls[0][2]).toBe('1');
    });

    test('should make a call to findAll- with limit and offset', async () => {
      const data = dataForGetCourses(3, 1);
      Course.findAll.mockResolvedValueOnce(data);
      await request(app).get('/courses?limit=3&offset=1');
      expect(Course.findAll.mock.calls).toHaveLength(1);
      expect(Course.findAll.mock.calls[0]).toHaveLength(3);
      expect(Course.findAll.mock.calls[0][0]).toStrictEqual({});
      expect(Course.findAll.mock.calls[0][1]).toBe('3');
      expect(Course.findAll.mock.calls[0][2]).toBe('1');
    });

    test('should make a call to findAll- with query and criteria and limit and offset', async () => {
      const data = dataForGetCourses(3, 1);
      Course.findAll.mockResolvedValueOnce(data);
      await request(app).get('/courses?credits=3&limit=100&offset=10');
      expect(Course.findAll.mock.calls).toHaveLength(1);
      expect(Course.findAll.mock.calls[0]).toHaveLength(3);
      expect(Course.findAll.mock.calls[0][0]).toStrictEqual({credits: "3"});
      expect(Course.findAll.mock.calls[0][1]).toBe('100');
      expect(Course.findAll.mock.calls[0][2]).toBe('10');
    });

    test('should respond with a json array object containg the user data', async () => {
      const data = dataForGetCourses(5);
      Course.findAll.mockResolvedValueOnce(data);
      const { body: users } = await request(app).get('/courses');
      expect(users).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        expect(users[i].id).toBe(data[i].id);
        expect(users[i].section).toBe(data[i].section);
        expect(users[i].name).toBe(data[i].name);
        expect(users[i].credits).toBe(data[i].credits);
      }
    });

    test('should respond with a json array object containg no data', async () => {
      Course.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get('/courses');
      expect(response.body).toHaveLength(0);
    });

    test('should specify json in the content type header', async () => {
      Course.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get('/courses');
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with a 200 status code when user data returned', async () => {
      const data = dataForGetCourses(5);
      Course.findAll.mockResolvedValueOnce(data);
      const response = await request(app).get('/courses');
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 200 status code when user data returned (even no users)', async () => {
      Course.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get('/courses');
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 500 status code when an error occurs', async () => {
      Course.findAll.mockRejectedValueOnce(new Error('Some Database Failure'));
      const response = await request(app).get('/courses');
      expect(response.statusCode).toBe(500);
      expect(response.body.error.message).toBe('Some Database Failure');
    });

    test('should respond with 400 because credits is not an integer', async () => {
      const data = dataForGetCourses(3);
      Course.findAll.mockResolvedValueOnce(data);
      const response = await request(app).get('/courses?credits=f');
      expect(response.statusCode).toBe(400);
      expect(response.body.error.message).toBe('Credits must be a valid integer');
    });

    test('should respond with 400 because semester is not in the accepted terms', async () => {
      const data = dataForGetCourses(3);
      Course.findAll.mockResolvedValueOnce(data);
      const response = await request(app).get('/courses?type=f');
      expect(response.statusCode).toBe(400);
      expect(response.body.error.message).toBe('Type must be one of fall, spring, summer, or winter');
    });

    test('should respond with 400 because year is not a valid integer', async () => {
      const data = dataForGetCourses(3);
      Course.findAll.mockResolvedValueOnce(data);
      const response = await request(app).get('/courses?year=f');
      expect(response.statusCode).toBe(400);
      expect(response.body.error.message).toBe('Year must be a valid integer');
    });

    test('should respond with 200 with name, credits, type, and year', async () => {
      const data = dataForGetCourses(3);
      Course.findAll.mockResolvedValueOnce(data);
      await request(app).get('/courses?year=2019&name=blah&type=spring&credits=3');
      expect(Course.findAll.mock.calls).toHaveLength(1);
      expect(Course.findAll.mock.calls[0]).toHaveLength(3);
      expect(Course.findAll.mock.calls[0][0]).toStrictEqual({
        credits: '3',
        name: 'blah',
        type: 'spring',
        year: '2019'
      });
      expect(Course.findAll.mock.calls[0][1]).toBeUndefined();
      expect(Course.findAll.mock.calls[0][2]).toBeUndefined();
    });
  });
});
