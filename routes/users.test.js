const log = require('loglevel');
const request = require('supertest');
const app = require('../app')();
const User = require('../models/User');
const Auth = require('../services/auth');

beforeAll(() => {
  log.disableAll();
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
    checkPermissions: jest.fn().mockImplementation(role => {
      if(role === 'user'){
        return 0;
      } else if (role === 'director') {
        return 1;
      } else if (role === 'admin') {
        return 2;
      }
    })
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
      role: 'user'
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
      const response = await request(app).get('/users/100');
      expect(response.statusCode).toBe(404);
    });

    test('should respond with a 500 status code when an error occurs', async () => {
      User.findOne.mockRejectedValueOnce(new Error('Some Database Error'));
      const response = await request(app).get('/users/100');
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
      const response = await request(app).get('/users/user-test-someguid');
      expect(response.statusCode).toBe(404);
    });

    test('should respond with a 500 status code when an error occurs', async () => {
      User.findOne.mockRejectedValueOnce(new Error('Some Database Error'));
      const response = await request(app).get('/users/user-test-someguid');
      expect(response.statusCode).toBe(500);
    });
  });

  describe('querying a group of users', () => {
    test('should make a call to User.findAll', async () => {
      const data = dataForGetUser(10);
      User.findAll.mockResolvedValueOnce(data);
      await request(app).get('/users');
      expect(User.findAll.mock.calls).toHaveLength(1);
      expect(User.findAll.mock.calls[0]).toHaveLength(4);
      expect(User.findAll.mock.calls[0][0]).toStrictEqual({});
      expect(User.findAll.mock.calls[0][1]).toBeNull();
      expect(User.findAll.mock.calls[0][2]).toBeUndefined();
      expect(User.findAll.mock.calls[0][3]).toBeUndefined();
    });

    test('should make a call to findAll - with limits', async () => {
      const data = dataForGetUser(3);
      User.findAll.mockResolvedValueOnce(data);
      await request(app).get('/users?limit=3');
      expect(User.findAll.mock.calls).toHaveLength(1);
      expect(User.findAll.mock.calls[0]).toHaveLength(4);
      expect(User.findAll.mock.calls[0][0]).toStrictEqual({});
      expect(User.findAll.mock.calls[0][1]).toBeNull();
      expect(User.findAll.mock.calls[0][2]).toBe('3');
      expect(User.findAll.mock.calls[0][3]).toBeUndefined();
    });

    test('should make a call to findAll - with offset', async () => {
      const data = dataForGetUser(3);
      User.findAll.mockResolvedValueOnce(data);
      await request(app).get('/users?offset=1');
      expect(User.findAll.mock.calls).toHaveLength(1);
      expect(User.findAll.mock.calls[0]).toHaveLength(4);
      expect(User.findAll.mock.calls[0][0]).toStrictEqual({});
      expect(User.findAll.mock.calls[0][1]).toBeNull();
      expect(User.findAll.mock.calls[0][2]).toBeUndefined();
      expect(User.findAll.mock.calls[0][3]).toBe('1');
    });

    test('should make a call to findAll- with limit and offset', async () => {
      const data = dataForGetUser(3, 1);
      User.findAll.mockResolvedValueOnce(data);
      await request(app).get('/users?limit=3&offset=1');
      expect(User.findAll.mock.calls).toHaveLength(1);
      expect(User.findAll.mock.calls[0]).toHaveLength(4);
      expect(User.findAll.mock.calls[0][0]).toStrictEqual({});
      expect(User.findAll.mock.calls[0][1]).toBeNull();
      expect(User.findAll.mock.calls[0][2]).toBe('3');
      expect(User.findAll.mock.calls[0][3]).toBe('1');
    });

    test('should make a call to findAll- with query and no limit or offset', async () => {
      const data = dataForGetUser(3, 1);
      User.findAll.mockResolvedValueOnce(data);
      await request(app).get('/users?query=jacob');
      expect(User.findAll.mock.calls).toHaveLength(1);
      expect(User.findAll.mock.calls[0]).toHaveLength(4);
      expect(User.findAll.mock.calls[0][0]).toStrictEqual({});
      expect(User.findAll.mock.calls[0][1]).toBe('jacob');
      expect(User.findAll.mock.calls[0][2]).toBeUndefined();
      expect(User.findAll.mock.calls[0][3]).toBeUndefined();
    });

    test('should make a call to findAll- with query and limit and no offset', async () => {
      const data = dataForGetUser(3, 1);
      User.findAll.mockResolvedValueOnce(data);
      await request(app).get('/users?query=jacob&limit=100');
      expect(User.findAll.mock.calls).toHaveLength(1);
      expect(User.findAll.mock.calls[0]).toHaveLength(4);
      expect(User.findAll.mock.calls[0][0]).toStrictEqual({});
      expect(User.findAll.mock.calls[0][1]).toBe('jacob');
      expect(User.findAll.mock.calls[0][2]).toBe('100');
      expect(User.findAll.mock.calls[0][3]).toBeUndefined();
    });

    test('should make a call to findAll- with query and limit and offset', async () => {
      const data = dataForGetUser(3, 1);
      User.findAll.mockResolvedValueOnce(data);
      await request(app).get('/users?query=jacob&limit=100&offset=10');
      expect(User.findAll.mock.calls).toHaveLength(1);
      expect(User.findAll.mock.calls[0]).toHaveLength(4);
      expect(User.findAll.mock.calls[0][0]).toStrictEqual({});
      expect(User.findAll.mock.calls[0][1]).toBe('jacob');
      expect(User.findAll.mock.calls[0][2]).toBe('100');
      expect(User.findAll.mock.calls[0][3]).toBe('10');
    });

    test('should make a call to findAll- with query and criteria and limit and offset', async () => {
      const data = dataForGetUser(3, 1);
      User.findAll.mockResolvedValueOnce(data);
      await request(app).get('/users?role=admin&enable=true&query=jacob&limit=100&offset=10');
      expect(User.findAll.mock.calls).toHaveLength(1);
      expect(User.findAll.mock.calls[0]).toHaveLength(4);
      expect(User.findAll.mock.calls[0][0]).toStrictEqual({role: 'admin', enable: true});
      expect(User.findAll.mock.calls[0][1]).toBe('jacob');
      expect(User.findAll.mock.calls[0][2]).toBe('100');
      expect(User.findAll.mock.calls[0][3]).toBe('10');
    });

    test('should respond with a json array object containg the user data', async () => {
      const data = dataForGetUser(5);
      User.findAll.mockResolvedValueOnce(data);
      const { body: users } = await request(app).get('/users');
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
      const response = await request(app).get('/users');
      expect(response.body).toHaveLength(0);
    });

    test('should specify json in the content type header', async () => {
      User.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get('/users');
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with a 200 status code when user data returned', async () => {
      const data = dataForGetUser(5);
      User.findAll.mockResolvedValueOnce(data);
      const response = await request(app).get('/users');
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 200 status code when user data returned (even no users)', async () => {
      User.findAll.mockResolvedValueOnce([]);
      const response = await request(app).get('/users');
      expect(response.statusCode).toBe(200);
    });

    test('should respond with a 500 status code when an error occurs', async () => {
      User.findAll.mockRejectedValueOnce(new Error('Some Database Failure'));
      const response = await request(app).get('/users');
      expect(response.statusCode).toBe(500);
      expect(response.body.error.message).toBe('Some Database Failure');
    });
  });
});

describe('PUT /users', () => {
  beforeEach(() => {
    User.findOne.mockReset();
    User.findOne.mockResolvedValue(null);
    User.update.mockReset();
    User.update.mockResolvedValue(null);
  });

  describe('given an id', () => {
    test('should call both User.findOne and User.update', async () => {
      const data = dataForGetUser(3);
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const requestor = {
          id: 75,
          email: 'fake@email.com',
          role: 'admin',
          enable: true,
          userId: 'user-test-thingy'
        };
        const requestParams = {
          userId: row.userId,
          email: row.email
        };
        const updatedUser = {
          userId: row.userId,
          email: row.email,
          enable: requestParams.enable,
          role: requestParams.role,
          id: row.id
        };

        User.findOne.mockResolvedValueOnce(row).mockResolvedValueOnce(requestor);
        User.update.mockResolvedValueOnce(updatedUser);
        await request(app).put(`/users/${row.id}`).send(requestParams);
        expect(User.findOne.mock.calls).toHaveLength((i + 1) * 2);
        expect(User.findOne.mock.calls[i]).toHaveLength(1);
        expect([User.findOne.mock.calls[i+1][0].userId, User.findOne.mock.calls[i][0].userId]).toContain(requestor.userId);
        expect(User.update.mock.calls).toHaveLength(i + 1);
        expect(User.update.mock.calls[i]).toHaveLength(2);
        expect(User.update.mock.calls[i][0]).toBe(row.id);
        expect(User.update.mock.calls[i][1]).toStrictEqual(requestParams);
      }
    });
    test('should respond with a json object containing the user id', async () => {
      const data = dataForGetUser(10);
      for (const row of data) {
        const requestor = {
          id: 75,
          email: 'fake@email.com',
          role: 'admin',
          enable: true,
          userId: 'user-test-thingy'
        };
        const requestParams = {
          senderId: requestor.id,
          role: 'admin',
          enable: true
        };
        const updatedUser = {
          userId: row.userId,
          email: row.email,
          enable: requestParams.enable,
          role: requestParams.role,
          id: row.id
        };

        User.findOne.mockResolvedValueOnce(row).mockResolvedValueOnce(requestor);
        User.update.mockResolvedValueOnce(updatedUser);

        const { body: user } = await request(app).put(`/users/${row.id}`).send(requestParams);
        expect(user.id).toBe(row.id);
        expect(user.email).toBe(row.email);
        expect(user.userId).toBe(row.userId);
        expect(user.role).toBe(requestParams.role);
        expect(user.enable).toBe(requestParams.enable);
      }
    });
    test('should respond with a 500 internal server error', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      const requestParams = {
        senderId: 1,
        enable: true,
        role: 'admin'
      };
      const requestor = {
        id: 75,
        email: 'fake@email.com',
        role: 'admin',
        enable: true,
        userId: 'user-test-thingy'
      };
      User.findOne.mockResolvedValueOnce({ row: row }).mockResolvedValueOnce({ row: requestor});
      User.update.mockRejectedValueOnce(new Error('some database error'));
      const response = await request(app).put('/users/1').send(requestParams);
      expect(response.statusCode).toBe(500);
    });
    test('should respond with a 404 not found', async () => {
      const requestParams = {
        enable: true,
        role: 'admin'
      };
      User.findOne.mockResolvedValueOnce({}).mockResolvedValueOnce({});
      const response = await request(app).put('/users/1').send(requestParams);
      expect(response.statusCode).toBe(404);
    });
    test('should respond with a 400 bad request', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      User.findOne.mockResolvedValueOnce({ row: row });
      User.update.mockRejectedValueOnce(new Error('some database error'));
      const response = await request(app).put('/users/1').send();
      expect(response.statusCode).toBe(400);
    });
    test('should respond with a 403 bad request', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      const requestor = {
        id: 75,
        email: 'fake@email.com',
        role: 'user',
        enable: true,
        userId: 'user-test-thingy'
      };
      const requestParams = {
        senderId: requestor.id,
        enable: true,
        role: 'admin'
      };
      User.findOne.mockResolvedValueOnce(row).mockResolvedValueOnce(requestor);
      const response = await request(app).put(`/users/${row.id}`).send(requestParams);
      expect(response.statusCode).toBe(403);
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
        const requestParams = {
          userId: row.userId,
          email: row.email
        };
        User.findOne.mockResolvedValueOnce({});
        User.create.mockResolvedValueOnce(row);
        await request(app).post('/users').send(requestParams);
        expect(User.findOne.mock.calls).toHaveLength(i + 1);
        expect(User.findOne.mock.calls[i]).toHaveLength(1);
        expect(User.findOne.mock.calls[i][0]).toHaveProperty('userId', row.userId);
        expect(User.create.mock.calls).toHaveLength(i + 1);
        expect(User.create.mock.calls[i]).toHaveLength(2);
        expect(User.create.mock.calls[i][0]).toBe(row.userId);
        expect(User.create.mock.calls[i][1]).toBe(row.email);
      }
    });

    test('should respond with a json object containing the user id', async () => {
      const data = dataForGetUser(10);
      for (const row of data) {
        User.findOne.mockResolvedValueOnce({});
        User.create.mockResolvedValueOnce(row);
        const requestParams = {
          userId: row.userId,
          email: row.email
        };
        const { body: user } = await request(app).post('/users').send(requestParams);
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
        email: row.email
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
        email: row.email
      };
      const response = await request(app).post('/users').send(requestParms);
      expect(response.statusCode).toBe(201);
    });

    test('should respond with a 200 status code when user already exists exist', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      const requestParms = {
        userId: row.userId,
        email: row.email
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
        email: row.email
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
        email: row.email
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
        email: row.email
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
        email: row.email
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

describe('DELETE /users', () => {
  beforeEach(() => {
    User.create.mockReset();
    User.create.mockResolvedValue(null);
    User.findOne.mockReset();
    User.findOne.mockResolvedValue(null);
    User.findAll.mockReset();
    User.findAll.mockResolvedValue(null);
  });

  test('Program should respond with code 404 if user is empty', async () =>  {
    User.findOne.mockResolvedValueOnce({}).mockResolvedValueOnce({})
    const response = await request(app).delete(`/users/1234`).send();
    expect(response.statusCode).toBe(404);
  });

test('Program should respond with code 403 if user is not admin or themself', async () =>  {
  User.findOne.mockResolvedValueOnce({id: `12345`,
  email: `emailmine@uwstout.edu`,
  userId: `user-test-someguid`,
  enable: 'false',
  role: 'user'}).mockResolvedValueOnce({id: `5457846`,
  email: `emailanotheremail@uwstout.edu`,
  userId: `user-test-someguid14237`,
  enable: 'false',
  role: 'user'})

  const response = await request(app).delete(`/users/12345`).send();
  expect(response.statusCode).toBe(403);
});

test('Program should respond with code 200 if user is not admin or themself', async () =>  {
  User.findOne.mockResolvedValueOnce({id: 12345,
  email: `emailmine@uwstout.edu`,
  userId: `user-test-someguid`,
  enable: 'false',
  role: 'user'}).mockResolvedValueOnce({id: 5457846,
  email: `emailanotheremail@uwstout.edu`,
  userId: `user-test-someguid14237`,
  enable: 'false',
  role: 'admin'})

  User.deleteUser.mockResolvedValueOnce(`Successfully deleted user from db`);

  const response = await request(app).delete('/users/12345').send();
  expect(response.statusCode).toBe(200);
});



});