// import * as dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '../.env') });

import Database from "./database";
import environment from "./config/environment";
import dbConfig from "./config/database";

// IIFE : immediately invoked function express
(async () => {
    try {
        const db = new Database(environment.nodeEnv, dbConfig);
        await db.connect();

        const App = require('./app').default;
        const app = new App();
        app.listen();
    } catch (err) {
        console.log('error while connecting to db', err.stack)
    }
})();