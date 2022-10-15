import request from "supertest";
import Database from "../src/database";
import dbConfig from "../src/config/database"

let db;

class TestsHelpers {
  static async startDb() {
    db = new Database('test', dbConfig);
    await db.connect();
    return db;
  }

  static async stopDb() {
    db.disconnect();
  }

  static async syncDb() {
    await db.sync();
  }

  static getApp() {
    const App = require('../src/app').default;
    // const appI = new App();
    // return appI.getApp();
    return new App().getApp();
  }

  static async registerNewUser(options={}){
    const { email = 'test@mail.com', password = '1234567', endpoint = '/v1/register' } = options;
    return await request(TestsHelpers.getApp()).post(endpoint).send({ email, password });
  }
}

export default TestsHelpers;