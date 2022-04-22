const log = require('loglevel');
const request = require('supertest');
const app = require('../app')();
const Semester = require('../models/Semester');
const User = require('../models/User');

beforeAll(() => {
  log.disableAll();
});

// Helper function for getting semester attributes
function dataForGetSemester(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    data.push({
      id: `${value}`,
      year: `${value}`,
      type: `winter`,
    });
  }
  return data;
}

jest.mock('../models/Semester.js', () => {
  return {
    findOne: jest.fn(),
    editSemester: jest.fn()
  };
});

jest.mock('../models/User.js', () => {
  return {
    findOne: jest.fn(),
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
      res.locals.userId = 'user-test-thingy';
      return next();
    }),
    checkPermissions: jest.fn().mockImplementation((role) => {
      if (role === 'user') {
        return 0;
      } else if (role === 'director') {
        return 1;
      } else if (role === 'admin') {
        return 2;
      }
    }),
  };
});


describe('GET /semesters', () => {
  beforeEach(() => {
    Semester.findOne.mockReset();
    Semester.findOne.mockResolvedValue(null);
  });

  // helper functions - id is a numeric value
  async function callGetOnSemesterRoute(row, key = 'id') {
    const id = row[key];
    Semester.findOne.mockResolvedValueOnce(row);
    const response = await request(app).get(`/semesters/${id}`);
    return response;
  }
  // helper functions - userId is a text value

  describe('given a row id', () => {
    test('should make a call to Semester.findOne', async () => {
      const row = dataForGetSemester(1)[0];
      await callGetOnSemesterRoute(row);
      expect(Semester.findOne.mock.calls).toHaveLength(1);
      expect(Semester.findOne.mock.calls[0]).toHaveLength(1);
      expect(Semester.findOne.mock.calls[0][0]).toHaveProperty('id', row.id);
    });

    test('should respond with a json object containing the semester data', async () => {
      const data = dataForGetSemester(10);
      for (const row of data) {
        const {
          body: semester
        } = await callGetOnSemesterRoute(row);
        expect(semester.id).toBe(row.id);
        expect(semester.year).toBe(row.year);
        expect(semester.type).toBe(row.type);
      }
    });

    test('should specify json in the content type header', async () => {
      const data = dataForGetSemester(1, 100);
      const response = await callGetOnSemesterRoute(data[0]);
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with a 200 status code when semester exists', async () => {
      const data = dataForGetSemester(1, 100);
      const response = await callGetOnSemesterRoute(data[0]);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 404 status code when semester does NOT exists', async () => {
      Semester.findOne.mockResolvedValueOnce({});
      const response = await request(app).get('/semesters/100');
      expect(response.statusCode).toBe(404);
    });

    test('should respond with a 500 status code when an error occurs', async () => {
      Semester.findOne.mockRejectedValueOnce(new Error('Some Database Error'));
      const response = await request(app).get('/semesters/100');
      expect(response.statusCode).toBe(500);
    });
  });

  describe('PUT /semesters', () => {
    beforeEach(() => {
      Semester.findOne.mockReset();
      Semester.findOne.mockResolvedValue(null);
      User.findOne.mockReset();
      User.findOne.mockResolvedValue(null);
      Semester.editSemester.mockReset();
      Semester.editSemester.mockResolvedValue(null);
    });

    describe('Given id', () => {
      test('Testing calling Semester.findOne and Semester.editSemester', async () => {
        const data = dataForGetSemester(1);
        const row = data[0];

        const newSemesterParams = {
          year: 2000,
          type: 'spring'
        };

        const resultSemesterParams = {
          id: row.id,
          year: 2000,
          type: 'fall'
        };

        Semester.findOne.mockResolvedValueOnce({
          id: row.id,
          year: row.year,
          type: row.type
        });
        User.findOne.mockResolvedValueOnce({
          id: 456,
          email: 'fake@aol.com',
          role: 'director',
          enable: true,
          userId: 'userId',
        });

        Semester.editSemester.mockResolvedValueOnce({
          resultSemesterParams,
        });

        const response = await request(app).put(`/semesters/${row.id}`).send(newSemesterParams);
        expect(response.statusCode).toBe(200);
      });

      test('Return course ID in JSON', async () => {
        const data = dataForGetSemester(1);
        const row = data[0];

        const newSemesterParams = {
          year: 2000,
          type: 'spring'
        };

        const resultSemesterParams = {
          id: row.id,
          year: 2000,
          type: 'spring'
        };

        Semester.findOne.mockResolvedValueOnce({
          id: row.id,
          year: row.year,
          type: row.type
        });
        User.findOne.mockResolvedValueOnce({
          id: 456,
          email: 'fake@aol.com',
          role: 'director',
          enable: true,
          userId: 'userId',
        });

        Semester.editSemester.mockResolvedValueOnce({
          resultSemesterParams,
        });

        const {
          body: course
        } = await request(app).put(`/semesters/${row.id}`).send(newSemesterParams);
        expect(course.id).toBe(newSemesterParams.id);
      });

      test('Throw 500 error for extra errors', async () => {
        const data = dataForGetSemester(1);
        const row = data[0];
        const requestParams = {
          email: 'Dummy@Data.com',
          name: 'DummyCourseData',
        };
        Semester.findOne.mockResolvedValueOnce({
          row: row,
        });
        User.findOne.mockResolvedValueOnce({
          id: 456,
          email: 'fake@aol.com',
          role: 'director',
          enable: true,
          userId: 'userId',
        });
        Semester.editSemester.mockRejectedValueOnce(new Error('Database error'));
        const response = await request(app).put(`/semesters/${row.id}`).send(requestParams);
        expect(response.statusCode).toBe(500);
      });

      test('Throw 404 error course not found', async () => {
        const data = dataForGetSemester(1);
        const row = data[0];

        Semester.findOne.mockResolvedValueOnce({});
        User.findOne.mockResolvedValueOnce({
          id: 456,
          email: 'fake@aol.com',
          role: 'director',
          enable: true,
          userId: 'userId',
        });

        const response = await request(app).put(`/semesters/${row.id}`).send({
          Semester: row,
        });
        expect(response.statusCode).toBe(404);
      });

      test('Throw 400 error', async () => {
        const data = dataForGetSemester(1);
        const row = data[0];
        Semester.findOne.mockResolvedValueOnce({
          row: row,
        });

        const response = await request(app).put(`/semesters/${row.id}`).send({});

        expect(response.statusCode).toBe(400);
      });

      test('Throw 403 error', async () => {
        const data = dataForGetSemester(1);
        const row = data[0];

        const newSemesterParams = {
          year: 2000,
          type: 'spring'
        };

        Semester.findOne.mockResolvedValueOnce({
          year: 2000,
          type: 'spring'
        });
        User.findOne.mockResolvedValueOnce({
          id: 456,
          email: 'fake@aol.com',
          role: 'user',
          enable: true,
          userId: 'userId',
        });

        const response = await request(app).put(`/semesters/${row.id}`).send({
          course: newSemesterParams,
        });
        expect(response.statusCode).toBe(403);
      });
    });
  });
});