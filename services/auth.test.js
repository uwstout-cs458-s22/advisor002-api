const log = require('loglevel');
const stytchwrapper = require('./stytchwrapper');
const auth = require('./auth');
const { getMockReq, getMockRes } = require('@jest-mock/express');

beforeAll(() => {
  log.disableAll();
});

jest.mock('./environment', () => {
  return {
    stytchProjectId: 'project-test-11111111-1111-1111-1111-111111111111',
    stytchSecret: 'secret-test-111111111111',
    stytchEnv: 'test',
  };
});

jest.mock('./stytchwrapper', () => {
  return {
    authenticateStytchSession: jest.fn(),
  };
});

const { res, next, clearMockRes } = getMockRes({});

describe('auth tests', () => {
  beforeEach(() => {
    clearMockRes();
    stytchwrapper.authenticateStytchSession.mockReset();
  });

  test('authorizeSession - no authorization header', async () => {
    const req = getMockReq();
    await auth.authorizeSession(req, res, next);
    expect(next.mock.calls).toHaveLength(1);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
    expect(next.mock.calls[0][0].message).toBe('Authorization of User Failed: No Token');
  });

  test('authorizeSession - no bearer token', async () => {
    const req = getMockReq({
      headers: {
        authorization: 'foo',
      },
    });
    await auth.authorizeSession(req, res, next);
    expect(next.mock.calls).toHaveLength(1);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
    expect(next.mock.calls[0][0].message).toBe('Authorization of User Failed: No Token');
  });

  test('authorizeSession - Bearer with no token', async () => {
    const req = getMockReq({
      headers: {
        authorization: 'Bearer ',
      },
    });
    await auth.authorizeSession(req, res, next);
    expect(next.mock.calls).toHaveLength(1);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
    expect(next.mock.calls[0][0].message).toBe('Authorization of User Failed: No Token');
  });

  test('authorizeSession - Bearer expired/bad token', async () => {
    const req = getMockReq({
      headers: {
        authorization: 'Bearer mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q',
      },
    });
    stytchwrapper.authenticateStytchSession.mockRejectedValueOnce({
      status_code: 404,
      error_message: 'Session expired.',
    });
    await auth.authorizeSession(req, res, next);
    expect(stytchwrapper.authenticateStytchSession.mock.calls).toHaveLength(1);
    expect(next.mock.calls).toHaveLength(1);
    expect(next.mock.calls[0][0].statusCode).toBe(404);
    expect(next.mock.calls[0][0].message).toBe('Authorization Failed: Session expired.');
  });

  test('authorizeSession - Good Bearer token', async () => {
    const req = getMockReq({
      headers: {
        authorization: 'Bearer mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q',
      },
    });
    stytchwrapper.authenticateStytchSession.mockResolvedValue({
      status_code: 200,
    });
    await auth.authorizeSession(req, res, next);
    expect(stytchwrapper.authenticateStytchSession.mock.calls).toHaveLength(1);
    expect(next).toBeCalled();
    expect(next.mock.calls[0]).toHaveLength(0); // no parameters means its a non-error call to the next middleware
  });
});
