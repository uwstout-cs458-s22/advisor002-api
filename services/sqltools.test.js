const { whereParams, insertValues } = require('./sqltools');

describe('sql utility tests', () => {
  describe('whereParams tests', () => {
    test('whereParams with parameters', async () => {
      const { text, params } = whereParams({ column1: 1, column2: '2' });
      expect(text).toBe('WHERE "column1"=$1 AND "column2"=$2');
      expect(params).toHaveLength(2);
      expect(params[0]).toBe(1);
      expect(params[1]).toBe('2');
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
