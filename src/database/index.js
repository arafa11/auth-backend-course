import { Sequelize } from 'sequelize';
import { registerModels } from '../models';
import cls from 'cls-hooked';

export default class Database {
  constructor(environment, dbConfig) {
    this.environment = environment;
    this.dbConfig = dbConfig;
    this.isTestEnvironment = this.environment === 'test';
  }

  // getConnectionString() {
  //   const { username, password, host, port, database } = this.dbConfig(this.environment);
  //   return `postgres://${username}:${password}@${host}:${port}/${database}`;
  // }

  async connect() {
    // const uri = this.getConnectionString();
    // this.connection = new Sequelize(uri, {
    //   logging: this.isTestEnvironment ? false : console.log
    // });

    // Set up the namespace for transactions
    const namespace = cls.createNamespace('transactions-namespace');
    Sequelize.useCLS(namespace);

    // Create the connection
    const { username, password, host, port, database, dialect } =
      this.dbConfig[this.environment];
    this.connection = new Sequelize({
      username,
      password,
      host,
      port,
      database,
      dialect,
      logging: this.isTestEnvironment ? false : console.log,
    });

    // Check if we connected successfully
    await this.connection.authenticate({ logging: false });

    if (!this.isTestEnvironment) {
      console.log(
        'Connection to the database has been established successfully'
      );
    }

    // Register the models
    registerModels(this.connection);

    // Sync the models
    await this.sync();
  }

  async disconnect() {
    await this.connection.close();
  }

  async sync() {
    await this.connection.sync({
      logging: false,
      force: this.isTestEnvironment,
    });

    if (!this.isTestEnvironment) {
      console.log('Models synced successfully');
    }
  }
}