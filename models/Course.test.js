const log = require('loglevel');
const {
  db
} = require('../services/database');
// const env = require('../services/environment');
const Course = require('./Course');

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

// jest.mock('../services/environment.js', () => {
//   return {
//     masterAdminEmail: 'master@gmail.com',
//   };
// });

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

describe('Course Model', () => {
  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue(null);
  });


  // Skipping testing for creating, findAll, etc



  describe('Edit a Course', () => {
    test('Edit a course to have name NewCourse and major NewMajor', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];
      row.id = 123;
      row.name = "OldCourse"
      const putDoc = {
        name: 'NewCourse',
        major: 'NewMajor'
      };

      db.query.mockResolvedValue({
        rows: data
      });
      await Course.editCourse(row.id, putDoc);
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'UPDATE "course" SET name = $1, major =$2 WHERE id = $3 RETURNING *;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(3);
      expect(db.query.mock.calls[0][1][0]).toBe(putDoc.name);
      expect(db.query.mock.calls[0][1][1]).toBe(putDoc.major);
    });

    test('Throw 500 error', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];
      row.id = 123;
      row.name = "OldCourse"
      const putDoc = {
        name: 'NewCourse',
        major: 'NewMajor'
      };

      db.query.mockResolvedValue({ // empty
        rows: []
      });
      await expect(Course.editCourse(row.id, putDoc)).rejects.toThrowError('Unexpected DB condition, update successful with no returned record');
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(2);
      expect(db.query.mock.calls[0][0]).toBe(
        'UPDATE "course" SET name = $1, major = $2 WHERE id = $3 RETURNING *;'
      );
      expect(db.query.mock.calls[0][1]).toHaveLength(3);
      expect(db.query.mock.calls[0][1][0]).toBe(putDoc.name);
      expect(db.query.mock.calls[0][1][1]).toBe(putDoc.major);
    });

    test('editCourse with no input', async () => {
      await expect(Course.editCourse()).rejects.toThrowError('Id and a put document are required');
      expect(db.query.mock.calls).toHaveLength(0);
    });

    test('editCourse with invalid input', async () => {
      await expect(Course.editCourse('invalid')).rejects.toThrowError('Id and a put document are required');
      expect(db.query.mock.calls).toHaveLength(0);
    });
  });
});