multipart-form-stream
=====================

transform files and parameters into a multipart/form-data encoded stream

## Example
```javascript
var MultipartStream = require('multipart-form-stream')
  , request = require('request')
  , stream
  ;

stream = new MultipartStream({
  boundary: 'customMultipartBoundary' // optional
});

// add a normal field parameter
stream.addField('param1', 'value');

// add a file 
// addFile(field, path, [filename - defaults to filename in path])
stream.addFile('file1', '/path/to/file.png', 'thefile.png');

// add a stream
// addStream(field, filename, mimeType, stream)
stream.addStream('stream1', 'thefilename.png', 'image/png', imagestream);

// do something useful with this stream
// let's pipe it to transloadit!
// make sure you set the Content-Type header
stream.pipe(request.post({
  uri: 'http://api2.transloadit.com/assemblies',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=' + stream.getBoundary()
  }
}));

// enjoy streaming
