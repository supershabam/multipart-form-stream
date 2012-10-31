/**
 * Starts server that we can hit with a post which will then
 * emit fields and files received with their data contents
 * for your verification
 */

var express = require('express')
  , http = require('http')
  , request = require('request')
  , ready = require('ready')
  , app = express()
  , server = http.createServer(app)
  , port = false
  ;

app.use(express.bodyParser());
app.post('/', function(req, res) {
  var body = req.body || {}
    , files = req.files || {}
    ;

  console.log('body', body);
  console.log('files', files);
});

server.post = function(multipartFormStream) {
  if (!port) throw new Error('server must be ready when calling post');

  if (port) return server._post(multipartFormStream);
  postQueue.push(multipartFormStream);
};

server._post = function(multipartFormStream) {

};

// bind to a random available port
ready.mixin(server);
server.listen(0);
server.on('listening', function() {
  console.log(server.address());
  port = server.address().port;
  console.log('port', port);
  server.ready(true);
});

module.exports = server;
