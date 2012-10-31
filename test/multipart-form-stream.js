var should = require('should')
  , server = require('./helper/form-event-server')
  , pipette = require('pipette')
  ;

console.log('port', server.port);
server.on('listening', function() {
  console.log('listening');
});

describe('MultipartFormStream', function() {
  it('should say hi', function(done) {
    var blip1 = new pipette.Blip('blip1')
      , blip2 = new pipette.Blip('blip2')
      , blip3 = new pipette.Blip('blip3')
      , cat12 = new pipette.Cat([blip1, blip2])
      , cat123 = new pipette.Cat([cat12, blip3])
      ;

  cat123.pipe(process.stdout);

    blip1.resume();

    blip1.on('test', function test() {});
    blip1.on('test', function test2() {});
    console.log('listeners', blip1.listeners('test'));
    console.log('remove', blip1.removeAllListeners());
    

  });
});