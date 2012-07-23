var stream = require('stream')
  , util = require('util')
  , fs = require('fs')
  , mime = require('mime')
  ;

var NEWLINE = '\r\n';
var FIELD_CONTENT_DISPOSITION = 'Content-Disposition: form-data; name="%s"';
var FIELD_CONTENT_DISPOSITION_LENGTH = FIELD_CONTENT_DISPOSITION.length - 2;
var FILE_CONTENT_DISPOSITION = 'Content-Disposition: form-data; name="%s"; filename="%s"';
var FILE_CONTENT_DISPOSITION_LENGTH = FILE_CONTENT_DISPOSITION.length - 4;
var CONTENT_TYPE = 'Content-Type: %s';
var CONTENT_TYPE_LENGTH = CONTENT_TYPE.length - 2;

function MultipartStream(options) {
  options = options || {};
  this._boundary = options.boundary || 'SuperSweetSpecialBoundaryShabam';
  this._streams = {};
  this._fields = {};

  this.readable = true;
  this.writable = true;
  this.paused = true;
  this.busy = false;
  this.eof = false;
}
util.inherits(MultipartStream, stream.Stream);

MultipartStream.prototype.addStream = function(field, filename, mimeType, stream) {
  stream.pause();
  this._streams[field] = {
    filename: filename,
    mimeType: mimeType,
    stream: stream
  };
  process.nextTick(this.resume.bind(this));
};

MultipartStream.prototype.addFile = function(field, path, filename) {
  var mimeType
    , stream
    ;

  mimeType = mime.lookup(path);
  if (!filename) filename = /.*\/(.*?)$/.exec('/' + path)[1];
  stream = fs.createReadStream(path);

  this.addStream(field, filename, mimeType, stream);
};

MultipartStream.prototype.addField = function(field, value) {
  this._fields[field] = value;
  process.nextTick(this.resume.bind(this));
};

MultipartStream.prototype.resume = function() {
  var wasPaused = this.paused;
  this.paused = false;
  if (wasPaused) this._read();
};

MultipartStream.prototype.pause = function() {
  this.paused = true;
};

MultipartStream.prototype.getBoundary = function() {
  return this._boundary;
};

MultipartStream.prototype.write = function(data) {
  this.emit('data', data);
  return true;
};

MultipartStream.prototype.end = function() {
  var lines = [];
  lines.push('--' + this._boundary + '--');
  lines.push('');
  this.emit('data', lines.join(NEWLINE));
  this.eof = true;
  this.readable = false;
  this.emit('end');  
};

MultipartStream.prototype._read = function() {
  if (!this.readable || this.paused) return;

  if (Object.keys(this._fields).length) {
    this._emitField(this._read.bind(this));
  } else if (Object.keys(this._streams).length) {
    this._emitStream(this._read.bind(this));
  } else {
    this.end();    
  }
};

MultipartStream.prototype._emitField = function(cb) {
  var field = Object.keys(this._fields)[0]
    , value = this._fields[field]
    , lines = []
    ;

  delete this._fields[field];

  lines.push('--' + this._boundary);
  lines.push(FIELD_CONTENT_DISPOSITION.replace('%s', field));
  lines.push('');
  lines.push(value);
  lines.push('');

  this.emit('data', lines.join(NEWLINE));
  cb();
};

MultipartStream.prototype._emitStream = function(cb) {
  var field = Object.keys(this._streams)[0]
    , item = this._streams[field]
    , filename = item.filename
    , mimeType = item.mimeType
    , stream = item.stream
    , lines = []
    ;

  delete this._streams[field];

  lines.push('--' + this._boundary);
  lines.push(FILE_CONTENT_DISPOSITION.replace('%s', field).replace('%s', filename));
  lines.push(CONTENT_TYPE.replace('%s', mimeType));
  lines.push('')
  lines.push('')

  this.emit('data', lines.join(NEWLINE));

  stream.pipe(this, {end: false});
  stream.on('end', (function handleFileEnd() {
    this.emit('data', NEWLINE);
    cb();
  }).bind(this));
  stream.resume();
};

module.exports = MultipartStream;
