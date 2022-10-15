import request from "supertest";
import TestsHelpers from '../../test-helpers';
import models from '../../../src/models';
import App from '../../../src/app'

describe('register', () => {
  let app;

  beforeAll(async() => {
    await TestsHelpers.startDb();
    // app = TestsHelpers.getApp;
    app = new App().getApp();
  });

  afterAll(async() => {
    await TestsHelpers.stopDb();
  });

  beforeEach(async() => {
    // jest.setTimeout(60000);
    await TestsHelpers.syncDb();
  });

  it('should register a new user successfully',async () => {
    const res = await request(app).post('/v1/register').send({ email: 'test@example.com', password: 'Test1234' });
    console.log(res.text);
    console.log(res.status);
    res.expect(201);
    const { User } = models;
    const users = await User.findAll();
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('test@example.com');
  }
  // ,60_000
  );

  it('should register a new user successfully with roles',async () => {
    await request(app).post('/v1/register').send({ email: 'test@example.com', password: 'Test1234', roles: ['admin', 'customer'] }).expect(201);
    const { User, Role } = models;
    const users = await User.findAll({ include: Role });
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('test@example.com');
    const roles = users[0].roles;
    expect(roles.length).toEqual(2);
    expect(roles[0].role).toEqual('admin');
    expect(roles[1].role).toEqual('customer');
  });

  it("shouldn't create a user if it already exists",async() => {
    const res1 = await request(app).post('/v1/register').send({ email: 'test@example.com', password: 'Test1234' }).expect(201);
    const res2 = await request(app).post('/v1/register').send({ email: 'test@example.com', password: 'Test1234' }).expect(201);
    expect(res2.status).toEqual(500);
    expect(res2.body).toEqual({
      success: false,
      message: 'user already exists'
    });
  });
});

