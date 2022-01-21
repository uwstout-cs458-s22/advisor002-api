const log = require('loglevel');
const request = require('supertest');
const app = require('../app')();

beforeAll(() => {
  log.disableAll();
});

describe('Index Route Tests', () => {
  test('check the default error handler', async () => {
    const response = await request(app).get('/doesnotexists');
    expect(response.statusCode).toBe(404);
  });
});
