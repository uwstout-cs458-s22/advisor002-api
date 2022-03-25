const log = require('loglevel');
const {
  db
} = require('../services/database');
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

jest.mock('../services/environment.js', () => {
  return {
    masterAdminEmail: 'master@gmail.com',
  };
});

// // a helper that creates an array structure for getCourseById
function dataForGetCourse(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    data.push({
      id: `${value}`,
      name: `course${value}`,
      courseId: `${value}`,
      credits: `${value}`,
    });
  }
  return data;
}


describe('Course Model', () => {

  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue(null);
  });

  describe('Edit a Course', () => {
    test('Edit a course to have new name, credits, courseId', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];
      row.name = "OldCourse"
      row.credits = 4
      const putDoc = {
        name: 'NewCourse',
        credits: 4,
        courseId: 5
      };

      db.query.mockResolvedValue({
        rows: data
      });

      await Course.editCourse(row.id, putDoc);
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0]).toHaveLength(1);
      expect(db.query.mock.calls[0][0]).toBe(
        `Update "course" SET name = 'NewCourse' , "courseId" = 5 , credits = '4' WHERE id = 1 RETURNING *;`
      );
    });

    test('Throw 400 error for no input', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];
      db.query.mockResolvedValue({ // empty
        rows: []
      });
      await expect(Course.editCourse(row.id, data)).rejects.toThrowError('Id and a course attribute required');
    });


    test('Throw 500 error for other errors', async () => {
      const data = dataForGetCourse(1);
      const row = data[0];
      row.name = "OldCourse"
      row.credits = 4
      const putDoc = {
        name: 'NewCourse',
        credits: 4,
        courseId: 5
      };

      db.query.mockResolvedValue({
        rows: []
      });
      await expect(Course.editCourse(row.id, putDoc)).rejects.toThrowError('Unexpected DB condition, update successful with no returned record');
    });
  });
});