const { isEmpty, isArray, isObject } = require('./utils');

describe('utils Tests', () => {
  test('isArray tests', async () => {
    expect(isArray()).toBeFalsy(); // false
    expect(isArray(null)).toBeFalsy(); // false
    expect(isArray(true)).toBeFalsy(); // false
    expect(isArray(1)).toBeFalsy(); // false
    expect(isArray('str')).toBeFalsy(); // false
    expect(isArray({})).toBeFalsy(); // false
    expect(isArray(new Date())).toBeFalsy(); // false
    expect(isArray([])).toBeTruthy(); // true
  });
  test('isObject tests', async () => {
    expect(isObject()).toBeFalsy(); // false
    expect(isObject(null)).toBeFalsy(); // false
    expect(isObject(true)).toBeFalsy(); // false
    expect(isObject(1)).toBeFalsy(); // false
    expect(isObject('str')).toBeFalsy(); // false
    expect(isObject([])).toBeFalsy(); // false
    expect(isObject(new Date())).toBeFalsy(); // false
    expect(isObject({})).toBeTruthy(); // true
  });
  test('isEmpty tests', async () => {
    expect(isEmpty()).toBeFalsy(); // false
    expect(isEmpty(null)).toBeFalsy(); // false
    expect(isEmpty(true)).toBeFalsy(); // false
    expect(isEmpty(1)).toBeFalsy(); // false
    expect(isEmpty('str')).toBeFalsy(); // false
    expect(isEmpty([])).toBeFalsy(); // false
    expect(isEmpty(new Date())).toBeFalsy(); // false
    expect(isEmpty({ a: 1 })).toBeFalsy(); // false
    expect(isEmpty({})).toBeTruthy(); // true
  });
});
