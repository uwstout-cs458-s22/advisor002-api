const log = require('loglevel');
const {
  db
} = require('../services/database');
const Semester = require('./Semester');


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

// // a helper that creates an array structure for getSemesterById
function dataForGetSemester(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    data.push({
      id: `${value}`,
      year: `${value}`,
      type: `winter`
    });
  }
  return data;
}


describe('Semester Model', () => {
  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue(null);
  });



  describe('querying a single semester by id', () => {

    beforeEach(() => {
      db.query.mockReset();
      db.query.mockResolvedValue(null);
    });

    test('confirm calls to query', async () => {
      const row = dataForGetSemester(1)[0];
      db.query.mockResolvedValue({
        rows: [row]
      });
      await Semester.findOne({
        id: row.id
      });
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0][1][0]).toBe(row.id);
    });

    test('should return a single semester', async () => {
      const row = dataForGetSemester(1)[0];
      db.query.mockResolvedValue({
        rows: [row]
      });
      const semester = await Semester.findOne({
        id: row.id
      });
      for (const key in Object.keys(row)) {
        expect(semester).toHaveProperty(key, row[key]);
      }
    });

    test('should return empty for unfound semester', async () => {
      db.query.mockResolvedValue({
        rows: []
      });
      const semester = await Semester.findOne({
        id: 123
      });
      expect(Object.keys(semester)).toHaveLength(0);
    });

    test('should return null for database error', async () => {
      db.query.mockRejectedValueOnce(new Error('a testing database error'));
      await expect(Semester.findOne({
        id: 123
      })).rejects.toThrowError('a testing database error');
    });
  });
});

describe('Creating a Semester', () => {

  test('Create semester with no input parameters', async () => {
    await expect(Semester.createSemester()).rejects.toThrowError('id and year and type are required');
    
  });


  test('Create  semester successfully', async () => {
    const semester = {id: 1, type: 'spring', year: 2019};
    await Semester.createSemester(semester.id, semester.year, semester.type);
    expect(db.query.mock.calls).toHaveLength(2);
  });
});


describe('Edit a Semester', () => {

  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue(null);
  });

  test('Edit a semester to have new year and type', async () => {
    const data = dataForGetSemester(1);
    const row = data[0];
    row.year = 2000
    row.type = "OC"
    const putDoc = {
      year: 2001,
      type: "spring"
    };

    db.query.mockResolvedValue({
      rows: data
    });

    await Semester.editSemester(row.id, putDoc);
    expect(db.query.mock.calls).toHaveLength(1);
    expect(db.query.mock.calls[0]).toHaveLength(2);
    expect(db.query.mock.calls[0][0]).toBe(
      `UPDATE "semester" SET year = $1, type = $2 WHERE id = $3 RETURNING *;`
    );
  });

  test('Edit a semester to have new year only', async () => {
    const data = dataForGetSemester(1);
    const row = data[0];
    row.year = 2000
    row.type = "OC"
    const putDoc = {
      year: 2001
    };

    db.query.mockResolvedValue({
      rows: data
    });

    await Semester.editSemester(row.id, putDoc);
    expect(db.query.mock.calls).toHaveLength(1);
    expect(db.query.mock.calls[0]).toHaveLength(2);
    expect(db.query.mock.calls[0][0]).toBe(
      `UPDATE "semester" SET year = $1 WHERE id = $2 RETURNING *;`
    );
  });

  test('Edit a semester to have new type only', async () => {
    const data = dataForGetSemester(1);
    const row = data[0];
    row.year = 2000
    row.type = 'winter'
    const putDoc = {
      type: 'spring'
    };

    db.query.mockResolvedValue({
      rows: data
    });

    await Semester.editSemester(row.id, putDoc);
    expect(db.query.mock.calls).toHaveLength(1);
    expect(db.query.mock.calls[0]).toHaveLength(2);
    expect(db.query.mock.calls[0][0]).toBe(
      `UPDATE "semester" SET type = $1 WHERE id = $2 RETURNING *;`
    );
  });

  test('Throw 500, other db error', async () => {
    const data = dataForGetSemester(1);
    const row = data[0];
    row.year = 2000
    row.type = "OC"
    const putDoc = {
      year: 2001,
      type: "spring"
    };

    db.query.mockResolvedValue({
      rows: []
    });

    await Semester.editSemester(row.id, putDoc);
    expect(db.query.mock.calls).toHaveLength(1);
    expect(db.query.mock.calls[0]).toHaveLength(2);
    expect(db.query.mock.calls[0][0]).toBe(
      `UPDATE "semester" SET year = $1, type = $2 WHERE id = $3 RETURNING *;`
    );
  });

  test('Throw 400 for invalid type', async () => {
    const data = dataForGetSemester(1);
    const row = data[0];
    row.year = 2000
    row.type = 'winter'
    const putDoc = {
      type: 'invalid'
    };

    db.query.mockResolvedValue({
      rows: data
    });

    await expect(Semester.editSemester(row.id, putDoc)).rejects.toThrowError(`Invalid type, must be 'spring', 'summer', 'fall', or 'winter'`);
  });

  test('Throw 400 error for no input', async () => {
    const data = dataForGetSemester(1);
    const row = data[0];
    db.query.mockResolvedValue({ // empty
      rows: []
    });
    await expect(Semester.editSemester(row.id)).rejects.toThrowError('Id and semester attributes are required');
  });

  test('Throw 500 error for other errors', async () => {
    const data = dataForGetSemester(1);
    const row = data[0];
    const putDoc = {};
    db.query.mockResolvedValue({
      rows: data
    });
    await expect(Semester.editSemester(row.id, putDoc)).rejects.toThrowError('Unexpected DB condition, update successful with no returned record');
  });
});