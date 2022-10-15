import request from "supertest";
import TestsHelpers from '../../test-helpers';
import models from '../../../src/models';

describe('login', () => {
  let app;
  let newUserResponse;

  beforeAll(async() => {
    await TestsHelpers.startDb();
    app = TestsHelpers.getApp;
  });

  afterAll(async() => {
    await TestsHelpers.stopDb();
  });

  beforeEach(async() => {
    // jest.setTimeout(60000);
    await TestsHelpers.syncDb();
    newUserResponse = await TestsHelpers.registerNewUser({ email: 'test@example.com', password: '1234567' });
  });

  it('should login the user successfully and store the refresh token in the database',async () => {
    const response = await request(app).post('/v1/login').send({ email: 'test@example.com', password: '1234567' }).expect(200);
    const refreshToken = response.body.data.refreshToken;
    const { RefreshToken } = models;
    const savedRefreshToken = await RefreshToken.findOne({ where: { token: refreshToken } });
    expect(savedRefreshToken).toBeDefined();
    expect(savedRefreshToken.token).toEqual(refreshToken);
  });

  it('should return 401 if the user is not found',async () => {
    const response = await request(app).post('/v1/login').send({ email: 'test1@example.com', password: '1234567' }).expect(401);
    expect(response.body.message).toEqual('invalid credentials');
    expect(response.body.success).toEqual(false);
  });

  it('should return 401 if the password is not correct',async () => {
    const response = await request(app).post('/v1/login').send({ email: 'test@example.com', password: '12345672' }).expect(401);
    expect(response.body.message).toEqual('invalid credentials');
    expect(response.body.success).toEqual(false);
  });

  it('should return the same refresh token if the user already logged in',async () => {
    const response = await request(app).post('/v1/login').send({ email: 'test1@example.com', password: '1234567' }).expect(200);
    const refreshToken = response.body.data.refreshToken;
    expect(refreshToken).toEqual(newUserResponse.body.data.refreshToken);
  });

  it('should return create a new refresh token if there is not one associated with the user',async () => {
    const { RefreshToken } = models;
    await RefreshToken.destroy({ where: {} });
    let refreshTokens = await RefreshToken.findAll();
    expect(refreshTokens.length).toEqual(0);
    const response = await request(app)
      .post('/v1/login')
      .send({ email: 'test1@example.com', password: '1234567' })
      .expect(200);
    refreshTokens = await RefreshToken.findAll();
    expect(refreshTokens.length).toEqual(1);
    expect(refreshTokens[0].token).not.toBeNull();
  });

  it('should set the token field to a JWT if this field is empty',async () => {
    const { RefreshToken } = models;
    const refreshToken = newUserResponse.body.data.refreshToken;
    const savedRefreshToken = await RefreshToken.findOne({ where: { token: refreshToken } });
    savedRefreshToken.token = null;
    await savedRefreshToken.save();
    const response = await request(app)
    .post('/v1/login')
    .send({ email: 'test1@example.com', password: '1234567' })
    .expect(200);
    await savedRefreshToken.reload();
    expect(savedRefreshToken.token).not.toBeNull();
  });
});

