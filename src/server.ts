import App from './app';

const app = new App();
const server = app.httpServer;
app.connections().catch((e) => {
  throw e;
});

export default server;
