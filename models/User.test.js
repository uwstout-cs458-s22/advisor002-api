const log = require('loglevel');
const { db } = require('../services/database');
const env = require('../services/environment');
const User = require('./User');

beforeAll(() => {
  log.disableAll();
});

jest.mock('../services/database.js', () => {
  return {
    db: {
      query: jest.fn(),
    },
  };
});

jest.mock('../services/environment.js', () => {
  return {
    masterAdminEmail: 'master@gmail.com',
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
      enable: 'true',
      role: 'user',
    });
  }
  return data;
}

describe('User Model', () => {
  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue(null);
  });

  describe('querying a single user by id', () => {
    test('confirm calls to query', async () => {
      const row = dataForGetUser(1)[0];
      db.query.mockResolvedValue({ rows: [row] });
      await User.findOne({ id: row.id });
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0][1][0]).toBe(row.id);
    });

    test('should return a single User', async () => {
      const row = dataForGetUser(1)[0];
      db.query.mockResolvedValue({ rows: [row] });
      const user = await User.findOne({ id: row.id });
      for (const key in Object.keys(row)) {
        expect(user).toHaveProperty(key, row[key]);
      }
    });

    test('should return empty for unfound user', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const user = await User.findOne({ id: 123 });
      expect(Object.keys(user)).toHaveLength(0);
    });

    test('should return null for database error', async () => {
      db.query.mockRejectedValueOnce(new Error('a testing database error'));
      await expect(User.findOne({ id: 123 })).rejects.toThrowError('a testing database error');
    });
  });

  describe('querying groups of users', () => {
    test('should make a call to User.findAll - no criteria, no limits, no offsets', async () => {
      const data = dataForGetUser(5);
      db.query.mockResolvedValue({ rows: data });
      const users = await User.findAll();
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe('SELECT * from "user"  LIMIT $1 OFFSET $2;');
      expect(db.query.mock.calls[0][1]).toHaveLength(2);
      expect(db.query.mock.calls[0][1][0]).toBe(100);
      expect(db.query.mock.calls[0][1][1]).toBe(0);
      expect(users).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        for (const key in Object.keys(data[i])) {
          expect(users[i]).toHaveProperty(key, data[i][key]);
        }
      }
    });

    test('should make a call to User.findAll - with criteria, no limits, no offsets', async () => {
      const data = dataForGetUser(5);
      db.query.mockResolvedValue({ rows: data });
      const users = await User.findAll({ role: 'user', enable: true }, undefined);
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'SELECT * from "user" WHERE "role"=$1 AND "enable"=$2 LIMIT $3 OFFSET $4;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(4);
      expect(db.query.mock.calls[0][1][0]).toBe('user');
      expect(db.query.mock.calls[0][1][1]).toBe(true);
      expect(db.query.mock.calls[0][1][2]).toBe(100);
      expect(db.query.mock.calls[0][1][3]).toBe(0);
      expect(users).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        for (const key in Object.keys(data[i])) {
          expect(users[i]).toHaveProperty(key, data[i][key]);
        }
      }
    });

    test('should make a call to User.findAll - with criteria, with limits, no offsets', async () => {
      const data = dataForGetUser(3);
      db.query.mockResolvedValue({ rows: data });
      const users = await User.findAll({ role: 'user', enable: true }, 3);
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'SELECT * from "user" WHERE "role"=$1 AND "enable"=$2 LIMIT $3 OFFSET $4;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(4);
      expect(db.query.mock.calls[0][1][0]).toBe('user');
      expect(db.query.mock.calls[0][1][1]).toBe(true);
      expect(db.query.mock.calls[0][1][2]).toBe(3);
      expect(db.query.mock.calls[0][1][3]).toBe(0);
      expect(users).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        for (const key in Object.keys(data[i])) {
          expect(users[i]).toHaveProperty(key, data[i][key]);
        }
      }
    });

    test('should make a call to User.findAll - with criteria, with limits, with offsets', async () => {
      const data = dataForGetUser(3, 1);
      db.query.mockResolvedValue({ rows: data });
      const users = await User.findAll({ role: 'user', enable: true }, 3, 1);
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'SELECT * from "user" WHERE "role"=$1 AND "enable"=$2 LIMIT $3 OFFSET $4;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(4);
      expect(db.query.mock.calls[0][1][0]).toBe('user');
      expect(db.query.mock.calls[0][1][1]).toBe(true);
      expect(db.query.mock.calls[0][1][2]).toBe(3);
      expect(db.query.mock.calls[0][1][3]).toBe(1);
      expect(users).toHaveLength(data.length);
      for (let i = 0; i < data.length; i++) {
        for (const key in Object.keys(data[i])) {
          expect(users[i]).toHaveProperty(key, data[i][key]);
        }
      }
    });

    test('should return null for database error', async () => {
      db.query.mockRejectedValueOnce(new Error('a testing database error'));
      await expect(User.findAll()).rejects.toThrowError('a testing database error');
    });
  });

  describe('creating a user', () => {
    test('User.create with "user" role, disabled by default', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      row.enable = false;
      db.query.mockResolvedValue({ rows: data });
      const user = await User.create(row.userId, row.email);
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'INSERT INTO "user" ("userId","email","enable","role") VALUES ($1,$2,$3,$4) RETURNING *;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(4);
      expect(db.query.mock.calls[0][1][0]).toBe(row.userId);
      expect(db.query.mock.calls[0][1][1]).toBe(row.email);
      expect(db.query.mock.calls[0][1][2]).toBe(row.enable);
      expect(db.query.mock.calls[0][1][3]).toBe(row.role);
      for (const key in Object.keys(row)) {
        expect(user).toHaveProperty(key, row[key]);
      }
    });

    test('User.create with masterAdmin role', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      row.enable = true;
      row.role = 'admin';
      row.email = env.masterAdminEmail;
      db.query.mockResolvedValue({ rows: data });
      const user = await User.create(row.userId, row.email);
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'INSERT INTO "user" ("userId","email","enable","role") VALUES ($1,$2,$3,$4) RETURNING *;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(4);
      expect(db.query.mock.calls[0][1][0]).toBe(row.userId);
      expect(db.query.mock.calls[0][1][1]).toBe(row.email);
      expect(db.query.mock.calls[0][1][2]).toBe(row.enable);
      expect(db.query.mock.calls[0][1][3]).toBe(row.role);
      for (const key in Object.keys(row)) {
        expect(user).toHaveProperty(key, row[key]);
      }
    });

    test('User.create with unexpected database response', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      row.role = 'user';
      row.enable = false;

      // unexpected response from db
      db.query.mockResolvedValue({ rows: [] });

      await expect(User.create(row.userId, row.email)).rejects.toThrowError(
        'Unexpected DB Condition, insert sucessful with no returned record'
      );

      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'INSERT INTO "user" ("userId","email","enable","role") VALUES ($1,$2,$3,$4) RETURNING *;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(4);
      expect(db.query.mock.calls[0][1][0]).toBe(row.userId);
      expect(db.query.mock.calls[0][1][1]).toBe(row.email);
      expect(db.query.mock.calls[0][1][2]).toBe(row.enable);
      expect(db.query.mock.calls[0][1][3]).toBe(row.role);
    });

    test('User.create with database error', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      row.role = 'user';
      row.enable = false;

      // error thrown during call to db query
      db.query.mockRejectedValueOnce(new Error('a testing database error'));
      await expect(User.create(row.userId, row.email)).rejects.toThrowError(
        'a testing database error'
      );
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'INSERT INTO "user" ("userId","email","enable","role") VALUES ($1,$2,$3,$4) RETURNING *;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(4);
      expect(db.query.mock.calls[0][1][0]).toBe(row.userId);
      expect(db.query.mock.calls[0][1][1]).toBe(row.email);
      expect(db.query.mock.calls[0][1][2]).toBe(row.enable);
      expect(db.query.mock.calls[0][1][3]).toBe(row.role);
    });

    test('User.create with bad input', async () => {
      await expect(User.create('bad input')).rejects.toThrowError('UserId and Email are required.');
      expect(db.query.mock.calls).toHaveLength(0);
    });

    test('User.create with no input', async () => {
      await expect(User.create()).rejects.toThrowError('UserId and Email are required.');
      expect(db.query.mock.calls).toHaveLength(0);
    });
  });
});
