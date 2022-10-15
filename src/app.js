import express from "express";
import logger from "morgan";
import bodyParser from 'body-parser';
import environment from "./config/environment";
import v1Routes from "./controllers";
import errorsMiddleware from "./middleware/errors";

class App {
  constructor() {
    this.app = express();
    this.app.use(logger('dev', { skip: (req, res) => environment.nodeEnv === 'test' }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
    this.setRoutes();
  }

  setRoutes() {
    this.app.use('/v1',v1Routes);
    this.app.use(errorsMiddleware);
  }

  getApp() {
    return this.app;
  }

  listen() {
    const { port } = environment;
    this.app.listen(port, () => {
      console.log('Listening at port '+ port);
    });
  }
}

export default App;