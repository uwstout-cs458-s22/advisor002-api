const log = require('loglevel');
const request = require('supertest');
const app = require('../app')();
const User = require('../models/User');

beforeAll(() => {
  log.disableAll();
});

jest.mock('../models/User.js', () => {
  return {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
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

// a helper that creates an array structure for getUserById
function dataForGetUser(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    data.push({
      id: `${value}`,
      email: `email${value}@uwstout.edu`,
      userId: `user-test-someguid${value}`,
      enable: 'false',
      role: 'user',
    });
  }
  return data;
}

describe('GET /users', () => {
  beforeEach(() => {
    User.create.mockReset();
    User.create.mockResolvedValue(null);
    User.findOne.mockReset();
    User.findOne.mockResolvedValue(null);
    User.findAll.mockReset();
    User.findAll.mockResolvedValue(null);
  });

  // helper functions - id is a numeric value
  async function callGetOnUserRoute(row, key = 'id') {
    const id = row[key];
    User.findOne.mockResolvedValueOnce(row);
    const response = await request(app).get(`/users/${id}`);
    return response;
  }
  // helper functions - userId is a text value

  describe('given a row id', () => {
    test('should make a call to User.findOne', async () => {
      const row = dataForGetUser(1)[0];
      await callGetOnUserRoute(row);
      expect(User.findOne.mock.calls).toHaveLength(1);
      expect(User.findOne.mock.calls[0]).toHaveLength(1);
      expect(User.findOne.mock.calls[0][0]).toHaveProperty('id', row.id);
    });

    test('should respond with a json object containg the user data', async () => {
      const data = dataForGetUser(10);
      for (const row of data) {
        const { body: user } = await callGetOnUserRoute(row);
        expect(user.id).toBe(row.id);
        expect(user.email).toBe(row.email);
        expect(user.userId).toBe(row.userId);
        expect(user.enable).toBe(row.enable);
        expect(user.role).toBe(row.role);
      }
    });

    test('should specify json in the content type header', async () => {
      const data = dataForGetUser(1, 100);
      const response = await callGetOnUserRoute(data[0]);
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with a 200 status code when user exists', async () => {
      const data = dataForGetUser(1, 100);
      const response = await callGetOnUserRoute(data[0]);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 404 status code when user does NOT exists', async () => {
      User.findOne.mockResolvedValueOnce({});
      const response = await request(app).get(`/users/100`);
      expect(response.statusCode).toBe(404);
    });

    test('should respond with a 500 status code when an error occurs', async () => {
      User.findOne.mockRejectedValueOnce(new Error('Some Database Error'));
      const response = await request(app).get(`/users/100`);
      expect(response.statusCode).toBe(500);
    });
  });

  describe('given a userId (from Stytch)', () => {
    test('should make a call to User.findOne', async () => {
      const row = dataForGetUser(1)[0];
      await callGetOnUserRoute(row, 'userId');
      expect(User.findOne.mock.calls).toHaveLength(1);
      expect(User.findOne.mock.calls[0]).toHaveLength(1);
      expect(User.findOne.mock.calls[0][0]).toHaveProperty('userId', row.userId);
    });

    test('should respond with a json object containg the user data', async () => {
      const data = dataForGetUser(10);
      for (const row of data) {
        const { body: user } = await callGetOnUserRoute(row, 'userId');
        expect(user.id).toBe(row.id);
        expect(user.email).toBe(row.email);
        expect(user.userId).toBe(row.userId);
        expect(user.enable).toBe(row.enable);
        expect(user.role).toBe(row.role);
      }
    });

    test('should specify json in the content type header', async () => {
      const data = dataForGetUser(1, 100);
      const response = await callGetOnUserRoute(data[0], 'userId');
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with a 200 status code when user exists', async () => {
      const data = dataForGetUser(1, 100);
      const response = await callGetOnUserRoute(data[0], 'userId');
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 404 status code when user does NOT exists', async () => {
      User.findOne.mockResolvedValueOnce({});
      const response = await request(app).get(`/users/user-test-someguid`);
      expect(response.statusCode).toBe(404);
    });

    test('should respond with a 500 status code when an error occurs', async () => {
      User.findOne.mockRejectedValueOnce(new Error('Some Database Error'));
      const response = await request(app).get(`/users/user-test-someguid`);
      expect(response.statusCode).toBe(500);
    });
  });

  describe('querying a group of users', () => {
    test('should make a call to User.findAll', async () => {
      const data = dataForGetUser(10);
      User.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/users`);
      expect(User.findAll.mock.calls).toHaveLength(1);
      expect(User.findAll.mock.calls[0]).toHaveLength(3);
      expect(User.findAll.mock.calls[0][0]).toBeNull();
      expect(User.findAll.mock.calls[0][1]).toBeUndefined();
      expect(User.findAll.mock.calls[0][2]).toBeUndefined();
    });

    test('should make a call to findAll - with limits', async () => {
      const data = dataForGetUser(3);
      User.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/users?limit=3`);
      expect(User.findAll.mock.calls).toHaveLength(1);
      expect(User.findAll.mock.calls[0]).toHaveLength(3);
      expect(User.findAll.mock.calls[0][0]).toBeNull();
      expect(User.findAll.mock.calls[0][1]).toBe('3');
      expect(User.findAll.mock.calls[0][2]).toBeUndefined();
    });

    test('should make a call to findAll - with offset', async () => {
      const data = dataForGetUser(3);
      User.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/users?offset=1`);
      expect(User.findAll.mock.calls).toHaveLength(1);
      expect(User.findAll.mock.calls[0]).toHaveLength(3);
      expect(User.findAll.mock.calls[0][0]).toBeNull();
      expect(User.findAll.mock.calls[0][1]).toBeUndefined();
      expect(User.findAll.mock.calls[0][2]).toBe('1');
    });

    test('should make a call to findAll- with limit and offset', async () => {
      const data = dataForGetUser(3, 1);
      User.findAll.mockResolvedValueOnce(data);
      await request(app).get(`/users?limit=3&offset=1`);
      expect(User.findAll.mock.calls).toHaveLength(1);
      expect(User.findAll.mock.calls[0]).toHaveLength(3);
      expect(User.findAll.mock.calls[0][0]).toBeNull();
      expect(User.findAll.mock.calls[0][1]).toBe('3');
      expect(User.findAll.mock.calls[0][2]).toBe('1');
    });

    test('should respond with a json array object containg the user data', async () => {
      const data = dataForGetUser(5);
      User.findAll.mockResolvedValueOnce(data);
      const { body: users } = await request(app).get(`/users`);
      expect(users).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        expect(users[i].id).toBe(data[i].id);
        expect(users[i].email).toBe(data[i].email);
        expect(users[i].userId).toBe(data[i].userId);
        expect(users[i].enable).toBe(data[i].enable);
        expect(users[i].role).toBe(data[i].role);
      }
    });

    test('should respond with a json array object containg no data', async () => {
      User.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get(`/users`);
      expect(response.body).toHaveLength(0);
    });

    test('should specify json in the content type header', async () => {
      User.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get(`/users`);
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with a 200 status code when user data returned', async () => {
      const data = dataForGetUser(5);
      User.findAll.mockResolvedValueOnce(data);
      const response = await request(app).get(`/users`);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 200 status code when user data returned (even no users)', async () => {
      User.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get(`/users`);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 500 status code when an error occurs', async () => {
      User.findAll.mockRejectedValueOnce(new Error('Some Database Failure'));
      const response = await request(app).get(`/users`);
      expect(response.statusCode).toBe(500);
      expect(response.body.error.message).toBe('Some Database Failure');
    });
  });
});

describe('POST /users', () => {
  beforeEach(() => {
    User.findOne.mockReset();
    User.findOne.mockResolvedValue(null);
    User.create.mockReset();
    User.create.mockResolvedValue(null);
  });

  describe('given a email and userId (stytch_id)', () => {
    test('should call both User.findOne and User.create', async () => {
      const data = dataForGetUser(3);
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const requestParms = {
          userId: row.userId,
          email: row.email,
        };
        User.findOne.mockResolvedValueOnce({});
        User.create.mockResolvedValueOnce(row);
        await request(app).post('/users').send(requestParms);
        expect(User.findOne.mock.calls).toHaveLength(i + 1);
        expect(User.findOne.mock.calls[i]).toHaveLength(1);
        expect(User.findOne.mock.calls[i][0]).toHaveProperty('userId', row.userId);
        expect(User.create.mock.calls).toHaveLength(i + 1);
        expect(User.create.mock.calls[i]).toHaveLength(2);
        expect(User.create.mock.calls[i][0]).toBe(row.userId);
        expect(User.create.mock.calls[i][1]).toBe(row.email);
      }
    });

    test('should respond with a json object containg the user id', async () => {
      const data = dataForGetUser(10);
      for (const row of data) {
        User.findOne.mockResolvedValueOnce({});
        User.create.mockResolvedValueOnce(row);
        const requestParms = {
          userId: row.userId,
          email: row.email,
        };
        const { body: user } = await request(app).post('/users').send(requestParms);
        expect(user.id).toBe(row.id);
        expect(user.email).toBe(row.email);
        expect(user.userId).toBe(row.userId);
        expect(user.role).toBe(row.role);
        expect(user.enable).toBe(row.enable);
      }
    });

    test('should specify json in the content type header', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      User.findOne.mockResolvedValueOnce({});
      User.create.mockResolvedValueOnce(row);
      const requestParms = {
        userId: row.userId,
        email: row.email,
      };
      const response = await request(app).post('/users').send(requestParms);
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test("should respond with a 201 status code when user doesn't exist", async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      User.findOne.mockResolvedValueOnce({});
      User.create.mockResolvedValueOnce(row);
      const requestParms = {
        userId: row.userId,
        email: row.email,
      };
      const response = await request(app).post('/users').send(requestParms);
      expect(response.statusCode).toBe(201);
    });

    test('should respond with a 200 status code when user already exists exist', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      const requestParms = {
        userId: row.userId,
        email: row.email,
      };
      User.findOne.mockResolvedValueOnce(row);
      User.create.mockResolvedValueOnce(row);
      const response = await request(app).post('/users').send(requestParms);
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 500 status code when an User.create error occurs', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      const requestParms = {
        userId: row.userId,
        email: row.email,
      };
      User.findOne.mockResolvedValueOnce({});
      User.create.mockResolvedValueOnce(null);
      const response = await request(app).post('/users').send(requestParms);
      expect(response.statusCode).toBe(500);
    });

    test('should respond with a 500 status code when an User.findOne error occurs', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      const requestParms = {
        userId: row.userId,
        email: row.email,
      };
      User.findOne.mockResolvedValueOnce(null);
      const response = await request(app).post('/users').send(requestParms);
      expect(response.statusCode).toBe(500);
    });

    test('should respond with a 500 status code when findOne database error occurs', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      const requestParms = {
        userId: row.userId,
        email: row.email,
      };
      User.findOne.mockRejectedValueOnce(new Error('some database error'));
      const response = await request(app).post('/users').send(requestParms);
      expect(response.statusCode).toBe(500);
    });

    test('should respond with a 500 status code when create database error occurs', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      const requestParms = {
        userId: row.userId,
        email: row.email,
      };
      User.findOne.mockResolvedValueOnce({});
      User.create.mockRejectedValueOnce(new Error('some database error'));
      const response = await request(app).post('/users').send(requestParms);
      expect(response.statusCode).toBe(500);
    });

    test('should respond with a 400 status code when missing required userId', async () => {
      const response = await request(app).post('/users').send({ email: 'email1@uwstout.edu' });
      expect(response.statusCode).toBe(400);
    });

    test('should respond with a 400 status code when missing required email', async () => {
      const response = await request(app).post('/users').send({ userId: 'user-test-someguid1' });
      expect(response.statusCode).toBe(400);
    });

    test('should respond with a 400 status code when passing empty dictionary', async () => {
      const response = await request(app).post('/users').send({});
      expect(response.statusCode).toBe(400);
    });

    test('should respond with a 400 status code when passing empty string', async () => {
      const response = await request(app).post('/users').send('');
      expect(response.statusCode).toBe(400);
    });
  });
});
