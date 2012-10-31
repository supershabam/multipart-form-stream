function FormItemStream(name, stream, options) {
  this._headerStream = this._createHeaderStream(name, options.boundary, options);
  this._contentStream = new pipette.Valve(stream);
  this._footerStream = this._createFooterStream(options.boundary);

  this._stream = new pipette.Cat(this._headerStream, this._contentStream, this._footerStream);
  this._stream.on('data', this.emit.bind(this, 'data'));
  this._stream.on('end', this.emit.bind(this, 'end'));
  this._stream.on('error', this.emit.bind(this, 'error'));
  this._stream.on('close', this.emit.bind(this, 'close'));

  this._stream.on('error', this._onErrorOrClose.bind(this));
  this._stream.on('close', this._onErrorOrClose.bind(this));
}

FormStream.prototype._onErrorOrClose = function() {
  this.readable = false;
};

FormStream.prototype.readable = true;

FormStream.prototype.setEncoding = function(encoding) {
  this._stream.setEncoding(encoding);
};

FormStream.prototype.pause = function() {
  this._headerStream.pause();
  this._contentStream.pause();
  this._footerStream.pause();
  this._stream.pause();
};

FormStream.prototype.resume = function() {
  this._headerStream.resume();
  this._contentStream.resume();
  this._footerStream.resume();
  this._stream.resume();
};

FormStream.prototype.destroy = function() {
  this._headerStream.destroy();
  this._contentStream.destroy();
  this._footerStream.destroy();
  this._stream.destroy();
};