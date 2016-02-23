var crypto = require('crypto');
var shortid = require('shortid');

var decrypt = function(key, iv, encryptdata) {
  encryptdata = new Buffer(encryptdata, 'base64').toString('binary');
  
  var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv),
      decoded  = decipher.update(encryptdata);
  
  decoded += decipher.final();
  return decoded;
};

var encrypt = function(key, iv, cleardata) {
    var encipher = crypto.createCipheriv('aes-256-cbc', key, iv),
        encryptdata  = encipher.update(cleardata);

    encryptdata += encipher.final();
     return new Buffer(encryptdata, 'binary').toString('base64');
};

var defaultStampGenerator = function(){
  return shortid.generate();
};

var OnnistuuClient = function(options){
  this.customer_id = options.customer_id;
  this.encryption_key = options.encryption_key;
  this.success_url = options.success_url;
  this.iv = options.iv || 'a2xhcgAAAAAAAAAA',
  this.failure_url = options.failure_url || '/';
  this.onnistuu_url = options.onnistuu_url || 'https://www.onnistuu.fi/external/entry/';
  this.stamp_generator = options.stamp_generator || defaultStampGenerator;
}

OnnistuuClient.prototype.createRequestBody = function(requirements, document, return_success){
  var encryptData = {
    stamp: this.stamp_generator(),
    customer: this.customer_id,
    return_success: return_success || this.success_url,
    document: document,
    requirements: requirements
  };
  var body = {
    customer: this.customer_id,
    return_failure: this.failure_url,
    data: encrypt(this.this.encryption_key, this.iv, JSON.stringify(encryptData)),
    iv: this.iv,
    cipher: 'rijndael-128',
    padding: 'pkcs5'
  }
  return body;
};

module.exports = OnnistuuClient;