const log = require('loglevel');
const { db } = require('../services/database');
const Category = require('./Category');

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

// // a helper that creates an array structure for getCategoryById
function dataForGetCategory(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    data.push({
      id: `${value}`,
      name: `Category${value}`,
      prefix: `CategoryPrefix${value}`,
    });
  }
  return data;
}

describe('Category Model', () => {
  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue(null);
  });

  describe('querying a single category by id', () => {
    beforeEach(() => {
      db.query.mockReset();
      db.query.mockResolvedValue(null);
    });

    test('confirm calls to query', async () => {
      const row = dataForGetCategory(1)[0];
      db.query.mockResolvedValue({
        rows: [row],
      });
      await Category.findOne({
        id: row.id,
      });
      expect(db.query.mock.calls).toHaveLength(1);
      expect(db.query.mock.calls[0][1][0]).toBe(row.id);
    });

    test('should return a single Category', async () => {
      const row = dataForGetCategory(1)[0];
      db.query.mockResolvedValue({
        rows: [row],
      });
      const category = await Category.findOne({
        id: row.id,
      });
      for (const key in Object.keys(row)) {
        expect(category).toHaveProperty(key, row[key]);
      }
    });

    test('should return empty for unfound category', async () => {
      db.query.mockResolvedValue({
        rows: [],
      });
      const category = await Category.findOne({
        id: 123,
      });
      expect(Object.keys(category)).toHaveLength(0);
    });

    test('should return null for database error', async () => {
      db.query.mockRejectedValueOnce(new Error('a testing database error'));
      await expect(
        Category.findOne({
          id: 123,
        })
      ).rejects.toThrowError('a testing database error');
    });
  });
});

describe('Edit a Category', () => {
  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue(null);
  });

  test('Edit a category to have new name and prefix', async () => {
    const data = dataForGetCategory(1);
    const row = data[0];
    row.name = 'OldCourse';
    row.prefix = 'OC';
    const putDoc = {
      name: 'NewCourse',
      prefix: 'NC',
    };

    db.query.mockResolvedValue({
      rows: data,
    });

    await Category.editCategory(row.id, putDoc);
    expect(db.query.mock.calls).toHaveLength(1);
    expect(db.query.mock.calls[0]).toHaveLength(2);
    expect(db.query.mock.calls[0][0]).toBe(
      `UPDATE "category" SET name = $1, prefix = $2 WHERE id = $3 RETURNING *;`
    );
  });

  test('Edit a category to have new name only', async () => {
    const data = dataForGetCategory(1);
    const row = data[0];
    row.name = 'OldCourse';
    row.prefix = 'OC';
    const putDoc = {
      name: 'NewCourse',
    };

    db.query.mockResolvedValue({
      rows: data,
    });

    await Category.editCategory(row.id, putDoc);
    expect(db.query.mock.calls).toHaveLength(1);
    expect(db.query.mock.calls[0]).toHaveLength(2);
    expect(db.query.mock.calls[0][0]).toBe(
      `UPDATE "category" SET name = $1 WHERE id = $2 RETURNING *;`
    );
  });

  test('Edit a category to have new prefix only', async () => {
    const data = dataForGetCategory(1);
    const row = data[0];
    row.name = 'OldCourse';
    row.prefix = 'OC';
    const putDoc = {
      prefix: 'NC',
    };

    db.query.mockResolvedValue({
      rows: data,
    });

    await Category.editCategory(row.id, putDoc);
    expect(db.query.mock.calls).toHaveLength(1);
    expect(db.query.mock.calls[0]).toHaveLength(2);
    expect(db.query.mock.calls[0][0]).toBe(
      `UPDATE "category" SET prefix = $1 WHERE id = $2 RETURNING *;`
    );
  });

  test('Throw 400 error for no input', async () => {
    const data = dataForGetCategory(1);
    const row = data[0];
    db.query.mockResolvedValue({
      // empty
      rows: [],
    });
    await expect(Category.editCategory(row.id)).rejects.toThrowError(
      'Id and category attributes are required'
    );
  });

  test('Throw 500 error for other errors', async () => {
    const data = dataForGetCategory(1);
    const row = data[0];
    row.name = 'OldCourse';
    row.prefix = 'OC';
    const putDoc = {
      name: 'NewCourse',
      prefix: 'NC',
    };

    db.query.mockResolvedValue({
      rows: [],
    });
    await expect(Category.editCategory(row.id, putDoc)).rejects.toThrowError(
      'Unexpected DB condition, update successful with no returned record'
    );
  });

  test('Throw 400 for no attributes provided', async () => {
    const data = dataForGetCategory(1);
    const row = data[0];
    const putDoc = {};
    db.query.mockResolvedValue({
      rows: data,
    });
    await expect(Category.editCategory(row.id, putDoc)).rejects.toThrowError(
      'Category attributes are required'
    );
  });
});

describe('Create a Category', () => {
  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue(null);
  });

  test('Should call Category.create', async () => {
    const data = dataForGetCategory(1);
    const row = data[0];
    row.enable = false;
    db.query.mockResolvedValue({ rows: data });
    const category = await Category.createCategory(row.name, row.prefix);
    expect(db.query.mock.calls).toHaveLength(1);
    expect(db.query.mock.calls[0]).toHaveLength(2);
    expect(db.query.mock.calls[0][0]).toBe(
      'INSERT INTO "category" ("name","prefix") VALUES ($1,$2) RETURNING *;'
    );
    expect(db.query.mock.calls[0][1]).toHaveLength(2);
    expect(db.query.mock.calls[0][1][0]).toBe(row.name);
    expect(db.query.mock.calls[0][1][1]).toBe(row.prefix);
    for (const key in Object.keys(row)) {
      expect(category).toHaveProperty(key, row[key]);
    }
  });

  test('Should throw 500 if no response', async () => {
    const data = dataForGetCategory(1);
    const row = data[0];
    db.query.mockResolvedValue({
      // empty
      rows: [],
    });
    await expect(Category.createCategory(row.name, row.prefix)).rejects.toThrowError(
      'Inserted successfully, without response'
    );
  });

  test('Should throw 400 if no parameters', async () => {
    await expect(Category.createCategory()).rejects.toThrowError(
      'Category name, and prefix are required'
    );
  });
});

describe('DELETE Category', () => {
  beforeEach(() => {
    db.query.mockReset();
    db.query.mockResolvedValue(null);
  });

  test('Category id not found', async () => {
    await expect(Category.deleteCategory()).rejects.toThrowError('id is required');
  });

  test('Should call category.delete and delete successfully', async () => {
    const data = dataForGetCategory(1);
    const row = data[0];
    row.enable = false;
    db.query.mockResolvedValue({ rows: data });
    const response = await Category.deleteCategory(row.id);
    expect(db.query.mock.calls[0][0]).toBe(`DELETE FROM "category" WHERE "id"=$1 RETURNING *;`);
    expect(response).toBe('Successfully deleted category from db');
  });

  test('Should throw 500 for unexpected db error', async () => {
    const data = dataForGetCategory(1);
    const row = data[0];
    row.enable = false;
    db.query.mockResolvedValue({ rows: [] });
    await expect(Category.deleteCategory(row.id)).rejects.toThrowError(
      'Unexpected db condition, delete successful with no returned record'
    );
  });
});
