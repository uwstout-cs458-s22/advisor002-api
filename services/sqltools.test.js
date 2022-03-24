const { whereParams, insertValues, updateValues } = require('./sqltools');

describe('sql utility tests', () => {
  describe('whereParams tests', () => {
    test('whereParams with parameters', async () => {
      const { text, params } = whereParams({ column1: 1, column2: '2' });
      expect(text).toBe('WHERE "column1"=$1 AND "column2"=$2');
      expect(params).toHaveLength(2);
      expect(params[0]).toBe(1);
      expect(params[1]).toBe('2');
    });
    test('whereParams with parameters (query and criteria)', async () => {
      const { text, params } = whereParams({ column1: 1, column2: '2' }, 'jacob');
      expect(text).toBe('WHERE email LIKE \'%\' || $1 || \'%\' AND "column1"=$2 AND "column2"=$3');
      expect(params).toHaveLength(3);
      expect(params[0]).toBe('jacob');
      expect(params[1]).toBe(1);
      expect(params[2]).toBe('2');
    });
    test('whereParams with parameters (just query)', async () => {
      const { text, params } = whereParams({}, 'jacob');
      expect(text).toBe('WHERE email LIKE \'%\' || $1 || \'%\'');
      expect(params).toHaveLength(1);
      expect(params[0]).toBe('jacob');
    });
    test('whereParams with empty dictionary', async () => {
      const { text, params } = whereParams({});
      expect(text).toBe('');
      expect(params).toHaveLength(0);
    });
    test('whereParams with array parameter', async () => {
      const { text, params } = whereParams([]);
      expect(text).toBe('');
      expect(params).toHaveLength(0);
    });
    test('whereParams with bad parameter', async () => {
      const { text, params } = whereParams(1234);
      expect(text).toBe('');
      expect(params).toHaveLength(0);
    });
    test('whereParams with no parameters', async () => {
      const { text, params } = whereParams();
      expect(text).toBe('');
      expect(params).toHaveLength(0);
    });

    describe('updateValues tests', () => {
      test('updateValues with parameters', async () => {
        const { text, params } = updateValues({ column1: 1, column2: '2' });
        expect(text).toBe('SET column1 = $1, column2 = $2');
        expect(params).toHaveLength(2);
        expect(params[0]).toBe(1);
        expect(params[1]).toBe('2');
      });
      test('updateValues with empty dictionary', async () => {
        const { text, params } = updateValues({});
        expect(text).toBe('');
        expect(params).toHaveLength(0);
      });
      test('updateValues with array parameter', async () => {
        const { text, params } = updateValues([]);
        expect(text).toBe('');
        expect(params).toHaveLength(0);
      });
      test('updateValues with bad parameter', async () => {
        const { text, params } = updateValues(1234);
        expect(text).toBe('');
        expect(params).toHaveLength(0);
      });
      test('updateValues with no parameters', async () => {
        const { text, params } = updateValues();
        expect(text).toBe('');
        expect(params).toHaveLength(0);
      });
    });

    describe('insertValues tests', () => {
      test('insertValues with parameters', async () => {
        const { text, params } = insertValues({ column1: 1, column2: '2' });
        expect(text).toBe('("column1","column2") VALUES ($1,$2)');
        expect(params).toHaveLength(2);
        expect(params[0]).toBe(1);
        expect(params[1]).toBe('2');
      });
      test('insertValues with empty dictionary', async () => {
        const { text, params } = insertValues({});
        expect(text).toBe('');
        expect(params).toHaveLength(0);
      });
      test('insertValues with array parameter', async () => {
        const { text, params } = insertValues([]);
        expect(text).toBe('');
        expect(params).toHaveLength(0);
      });
      test('insertValues with bad parameter', async () => {
        const { text, params } = insertValues(1234);
        expect(text).toBe('');
        expect(params).toHaveLength(0);
      });
      test('insertValues with no parameters', async () => {
        const { text, params } = insertValues();
        expect(text).toBe('');
        expect(params).toHaveLength(0);
      });
    });
  });
});
