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

function dataForDeleteUser(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    data.push({
      id: `${value}`,
      email: `email${value}@uwstout.edu`,
      userId: `user-test-someguid${value}`,
      enable: 'true',
      role: 'admin',
    });
  }
  return data;
}

function dataForGetSemesterSchedule(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    data.push({
      id: value,
      section: value,
      name: `test course ${value}`,
      credits: value,
      semesterid: value,
      courseid: value,
      year: 2022,
      type: 'fall',
      userid: value,
      taken: false,
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
      const users = await User.findAll({ role: 'user', enable: true }, null, 3);
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
      const users = await User.findAll({ role: 'user', enable: true }, null, 3, 1);
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

  describe('find a schedule for each semester', () => {
    test('should make a call to User.getSemesterSchedule', async () => {
      const row = dataForGetSemesterSchedule(1)[0];
      db.query.mockResolvedValue({ rows: [row] });
      const courses = await User.getSemesterSchedule(
        row.userid,
        row.semesterid,
        row.year,
        row.type
      );
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0][1][0]).toBe(1);
      expect(db.query.mock.calls[0][1][1]).toBe(1);
      expect(db.query.mock.calls[0][1][2]).toBe(2022);
      expect(db.query.mock.calls[0][1][3]).toBe('fall');
      expect(db.query.mock.calls[0][0]).toBe(
        `SELECT * FROM "course" as c JOIN "courseSemester" as cs on cs.courseid = c.id JOIN "semester" as s ON s.id = cs.semesterid JOIN "userCourse" as uc ON uc.courseid = c.id WHERE userid=$1 AND s.id=$2 AND year=$3 AND type=$4;`
      );
      for (const key in Object.keys(row)) {
        expect(courses).toHaveProperty(key, row[key]);
      }
    });

    test('Throw 500 error for other errors', async () => {
      const data = dataForGetSemesterSchedule(1);
      const row = data[0];
      row.userid = 1;
      row.semesterid = 2;
      row.year = 2022;
      row.type = 'fall';
      const putDoc = {
        name: 'NewSchedule',
        userid: 1,
        semesterid: 2,
        year: 2023,
        type: 'spring',
      };

      db.query.mockResolvedValue({
        rows: [],
      });
      await expect(
        User.getSemesterSchedule(putDoc.userid, putDoc.semesterid, putDoc.year, putDoc.type)
      ).rejects.toThrowError('Unexpected DB condition,  select successful with no returned record');
    });

    test('should return null for database error', async () => {
      db.query.mockRejectedValueOnce(new Error('a testing database error'));
      await expect(User.getSemesterSchedule()).rejects.toThrowError(
        'userid, semester, year, and type required'
      );
    });
  });

  describe('updating a user', () => {
    test('User.update with role as admin and enabled', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      row.enable = false;
      row.role = 'user';
      const putDoc = {
        role: 'admin',
        enable: false,
      };

      db.query.mockResolvedValue({ rows: data });
      await User.update(row.id, putDoc);
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'UPDATE "user" SET role = $1, enable = $2 WHERE id = $3 RETURNING *;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(3);
      expect(db.query.mock.calls[0][1][0]).toBe(putDoc.role);
      expect(db.query.mock.calls[0][1][1]).toBe(putDoc.enable);
    });

    test('User.update with 500 unexpected condition', async () => {
      const data = dataForGetUser(1);
      const row = data[0];
      row.enable = false;
      row.role = 'user';
      const putDoc = {
        role: 'admin',
        enable: false,
      };

      db.query.mockResolvedValue({ rows: [] });
      await expect(User.update(row.id, putDoc)).rejects.toThrowError(
        'Unexpected DB condition, update successful with no returned record'
      );
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'UPDATE "user" SET role = $1, enable = $2 WHERE id = $3 RETURNING *;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(3);
      expect(db.query.mock.calls[0][1][0]).toBe(putDoc.role);
      expect(db.query.mock.calls[0][1][1]).toBe(putDoc.enable);
    });

    test('User.update with no input into update function', async () => {
      await expect(User.update()).rejects.toThrowError('Id and a put document are required');
      expect(db.query.mock.calls).toHaveLength(0);
    });

    test('User.update with bad input', async () => {
      await expect(User.update('bad input')).rejects.toThrowError(
        'Id and a put document are required'
      );
      expect(db.query.mock.calls).toHaveLength(0);
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
        'Unexpected DB Condition, insert successful with no returned record'
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

  describe('test deleteUser', () => {
    test('user deletes themself', async () => {
      const data = dataForDeleteUser(1);
      const row = data[0];
      db.query.mockResolvedValue({ rows: data });
      expect(await User.deleteUser(row.id)).toBe(`Successfully deleted user from db`);
    });

    test('user id or email not found', async () => {
      await expect(User.deleteUser()).rejects.toThrowError('UserId is required.');
    });

    test('user deletes themself but no response returned', async () => {
      const data = dataForDeleteUser(1);
      const row = data[0];
      db.query.mockResolvedValue({ rows: [] });
      await expect(User.deleteUser(row.id, row.email)).rejects.toThrowError(
        'Unexpected db condition, delete successful with no returned record'
      );
    });
  });

  describe('test findUsersCourses', () => {
    test('successful query for a users planned courses', async () => {
      const data = dataForGetUser(1);
      db.query.mockResolvedValue({ rows: data });
      expect(await User.findUsersCourses(1, 1, 1)).toBe(data);
    });

    test('successful query with no response', async () => {
      const data = dataForGetUser(1);
      db.query.mockResolvedValueOnce({rows: data})
      .mockResolvedValueOnce({rows: data})
      .mockResolvedValueOnce({rows: data})
      .mockResolvedValue({rows: []});
      await expect(await User.findUsersCourses(1, 1, 1)).rejects.toThrow(`an unknown error occured while attempting to find courses for user, ${1}`);
    });

    test('semester could not be found', async () => {
      const data = dataForGetUser(1);
      db.query.mockResolvedValueOnce({rows: data})
      .mockResolvedValueOnce({rows: data})
      .mockResolvedValue({rows: []});
      await expect(await User.findUsersCourses(1, 1, 1)).rejects.toThrow(`Semester with id ${1} could not be found`);
    });

    test('course could not be found', async () => {
      const data = dataForGetUser(1);
      db.query.mockResolvedValueOnce({rows: data})
      .mockResolvedValue({rows: []});
      await expect(await User.findUsersCourses(1, 1, 1)).rejects.toThrow(`Course with id ${1} could not be found`);
    });

    test('user could not be found', async () => {
      db.query.mockResolvedValue();
      await expect(await User.findUsersCourses(1, 1, 1)).rejects.toThrow(`User with id ${1} could not be found`);
    });

    test('missing parameters', async () => {
      await expect(await User.findUsersCourses()).rejects.toThrow(`all parameters are required`);
    });
  });
});
