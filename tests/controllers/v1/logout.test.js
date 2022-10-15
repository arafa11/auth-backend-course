import request from "supertest";
import TestsHelpers from '../../test-helpers';
import models from '../../../src/models';

describe('logout', () => {
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

  describe('requiresAuth middleware', () => {
    it('should fail if the access token is invalid', async () => {
      const response = await request(app)
        .post('/v1/logout')
        .set('Authorization', 'Bearer invalid.token')
        .send()
        .expect(401);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('Invalid Token');
    });
    
  });

  it('should logout a user successfully',async () => {
    const accessToken = newUserResponse.body.data.accessToken;
    const response = await request(app)
      .post('/v1/tojen')
      .set('Authorization', 'Bearer '+ accessToken)
      .send()
      .expect(200);
    expect(response.body.success).toEqual(true);
    expect(response.body.message).toEqual('successfully logged out');
    const { User, RefreshToken } = models;
    const user = await User.findOne({ where: { email: 'test@example.com' }, include: RefreshToken });
    expect(user.RefreshToken.token).toEqual(null);
  });
});

