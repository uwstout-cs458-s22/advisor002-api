const log = require('loglevel');
const request = require('supertest');
const app = require('../app')();
const Category = require('../models/Category');
const User = require('../models/User');

beforeAll(() => {
  log.disableAll();
});

// Helper function for getting category attributes
function dataForGetCategory(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    data.push({
      id: `${value}`,
      name: `Course-${value}`,
      prefix: `Prefix-${value}`,
    });
  }
  return data;
}

jest.mock('../models/Category.js', () => {
  return {
    findOne: jest.fn(),
    editCategory: jest.fn(),
    createCategory: jest.fn(),
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

describe('GET /categories', () => {
  beforeEach(() => {
    Category.findOne.mockReset();
    Category.findOne.mockResolvedValue(null);
  });

  // helper functions - id is a numeric value
  async function callGetOnCategoryRoute(row, key = 'id') {
    const id = row[key];
    Category.findOne.mockResolvedValueOnce(row);
    const response = await request(app).get(`/categories/${id}`);
    return response;
  }
  // helper functions - userId is a text value

  describe('given a row id', () => {
    test('should make a call to Category.findOne', async () => {
      const row = dataForGetCategory(1)[0];
      await callGetOnCategoryRoute(row);
      expect(Category.findOne.mock.calls).toHaveLength(1);
      expect(Category.findOne.mock.calls[0]).toHaveLength(1);
      expect(Category.findOne.mock.calls[0][0]).toHaveProperty('id', row.id);
    });

    test('should respond with a json object containing the category data', async () => {
      const data = dataForGetCategory(10);
      for (const row of data) {
        const { body: category } = await callGetOnCategoryRoute(row);
        expect(category.id).toBe(row.id);
        expect(category.name).toBe(row.name);
        expect(category.prefix).toBe(row.prefix);
      }
    });

    test('should specify json in the content type header', async () => {
      const data = dataForGetCategory(1, 100);
      const response = await callGetOnCategoryRoute(data[0]);
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with a 200 status code when category exists', async () => {
      const data = dataForGetCategory(1, 100);
      const response = await callGetOnCategoryRoute(data[0]);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 404 status code when category does NOT exists', async () => {
      Category.findOne.mockResolvedValueOnce({});
      const response = await request(app).get('/categories/100');
      expect(response.statusCode).toBe(404);
    });

    test('should respond with a 500 status code when an error occurs', async () => {
      Category.findOne.mockRejectedValueOnce(new Error('Some Database Error'));
      const response = await request(app).get('/categories/100');
      expect(response.statusCode).toBe(500);
    });
  });

  describe('PUT /categories', () => {
    beforeEach(() => {
      Category.findOne.mockReset();
      Category.findOne.mockResolvedValue(null);
      User.findOne.mockReset();
      User.findOne.mockResolvedValue(null);
      Category.editCategory.mockReset();
      Category.editCategory.mockResolvedValue(null);
    });

    describe('Given id', () => {
      test('Testing calling Category.findOne and Category.editCategory', async () => {
        const data = dataForGetCategory(1);
        const row = data[0];

        const newCategoryParams = {
          name: 'TestClass',
          prefix: 'TC',
        };

        const resultCategoryParams = {
          id: row.id,
          name: 'TestClass',
          prefix: 'TC',
        };

        Category.findOne.mockResolvedValueOnce({
          id: row.id,
          name: row.name,
          prefix: row.prefix,
        });
        User.findOne.mockResolvedValueOnce({
          id: 456,
          email: 'fake@aol.com',
          role: 'director',
          enable: true,
          userId: 'userId',
        });

        Category.editCategory.mockResolvedValueOnce({
          resultCategoryParams,
        });

        const response = await request(app).put(`/categories/${row.id}`).send(newCategoryParams);
        expect(response.statusCode).toBe(200);
      });

      test('Return course ID in JSON', async () => {
        const data = dataForGetCategory(1);
        const row = data[0];

        const newCategoryParams = {
          name: 'TestClass',
          prefix: 'TC',
        };

        const resultCategoryParams = {
          id: row.id,
          name: 'TestClass',
          prefix: 'TC',
        };

        Category.findOne.mockResolvedValueOnce({
          id: row.id,
          name: row.name,
          prefix: row.prefix,
        });
        User.findOne.mockResolvedValueOnce({
          id: 456,
          email: 'fake@aol.com',
          role: 'director',
          enable: true,
          userId: 'userId',
        });

        Category.editCategory.mockResolvedValueOnce({
          resultCategoryParams,
        });

        const { body: course } = await request(app)
          .put(`/categories/${row.id}`)
          .send(newCategoryParams);
        expect(course.id).toBe(newCategoryParams.id);
      });

      test('Throw 500 error for extra errors', async () => {
        const data = dataForGetCategory(1);
        const row = data[0];
        const requestParams = {
          email: 'Dummy@Data.com',
          name: 'DummyCourseData',
        };
        Category.findOne.mockResolvedValueOnce({
          row: row,
        });
        User.findOne.mockResolvedValueOnce({
          id: 456,
          email: 'fake@aol.com',
          role: 'director',
          enable: true,
          userId: 'userId',
        });
        Category.editCategory.mockRejectedValueOnce(new Error('Database error'));
        const response = await request(app).put(`/categories/${row.id}`).send(requestParams);
        expect(response.statusCode).toBe(500);
      });

      test('Throw 404 error course not found', async () => {
        const data = dataForGetCategory(1);
        const row = data[0];

        Category.findOne.mockResolvedValueOnce({});
        User.findOne.mockResolvedValueOnce({
          id: 456,
          email: 'fake@aol.com',
          role: 'director',
          enable: true,
          userId: 'userId',
        });

        const response = await request(app).put(`/categories/${row.id}`).send({
          category: row,
        });
        expect(response.statusCode).toBe(404);
      });

      test('Throw 400 error', async () => {
        const data = dataForGetCategory(1);
        const row = data[0];
        Category.findOne.mockResolvedValueOnce({
          row: row,
        });

        const response = await request(app).put(`/categories/${row.id}`).send({});

        expect(response.statusCode).toBe(400);
      });

      test('Throw 403 error', async () => {
        const data = dataForGetCategory(1);
        const row = data[0];

        const newCategoryParams = {
          name: 'TestClass',
          prefix: 'TC',
        };

        Category.findOne.mockResolvedValueOnce({
          name: 'TestClass',
          prefix: 'TC',
        });
        User.findOne.mockResolvedValueOnce({
          id: 456,
          email: 'fake@aol.com',
          role: 'user',
          enable: true,
          userId: 'userId',
        });

        const response = await request(app).put(`/categories/${row.id}`).send({
          course: newCategoryParams,
        });
        expect(response.statusCode).toBe(403);
      });
    });
  });

  describe('Post /category', () => {
    beforeEach(() => {
      Category.findOne.mockReset();
      Category.findOne.mockResolvedValue(null);
      Category.findOne.mockReset();
      Category.findOne.mockResolvedValue(null);
      Category.createCategory.mockReset();
      Category.createCategory.mockResolvedValue(null);
    });

    describe('Create a category', () => {
      test('Should respond with 200 with, id, name, and prefix', async () => {
        const data = dataForGetCategory(3);
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const requestParams = {
            userId: row.userId,
            id: row.id,
            name: row.name,
            prefix: row.prefix,
          };
          Category.findOne.mockResolvedValueOnce({});
          Category.createCategory.mockResolvedValueOnce(row);
          await request(app).post('/category/').send(requestParams);

          // expect(Category.findOneCategory.mock.calls).toHaveLength(i + 1);
          // expect(Category.findOneCategory.mock.calls[i]).toHaveLength(1);
          // expect(Category.findOneCategory.mock.calls[i][0]).toHaveProperty('userId', row.userId);
          // expect(Category.createCategory.mock.calls).toHaveLength(i + 1);
          // expect(Category.createCategory.mock.calls[i]).toHaveLength(2);
          expect(Category.createCategory.mock.calls[i][0]).toBe(row.userId);
          expect(Category.createCategory.mock.calls[i][1]).toBe(row.id);
          expect(Category.createCategory.mock.calls[i][2]).toBe(row.name);
          expect(Category.createCategory.mock.calls[i][3]).toBe(row.prefix);

          /* expect(response.statusCode).toBe(200);
          expect(response.body.userId).toBe(data.userId);
          expect(response.body.id).toBe(data.id);
          expect(response.body.name).toBe(data.name);
          expect(response.body.prefix).toBe(data.prefix); */
        }
      });
    });
  });
});
