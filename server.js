const Hapi = require('hapi');
const Inert = require('inert');

const server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: __dirname
      }
    }
  }
});

server.connection({
  host: '0.0.0.0',
  port: 4000
});

server.register(Inert, () => {});

server.route([
  {
    method: '*',
    path: '/{param*}',
    handler: {
      directory: {
        path: '.',
        redirectToSlash: true,
        index: true
      }
    }
  }
]);

server.start((err) => {
  if (err) {
    throw (err);
  }

  console.log('Server started at ', server.info.uri);
  console.log('Goto ' + server.info.uri + '/index.html in your browser to see the problem.');
});
