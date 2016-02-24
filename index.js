var crypto = require('crypto');
var shortid = require('shortid');

var decrypt = function (key, iv, encryptdata) {
  var data = new Buffer(encryptdata, 'base64').toString('binary');
  var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  var decoded = decipher.update(data, 'binary', 'utf8');
  decoded += decipher.final('utf8');
  return decoded;
};

var encrypt = function (key, iv, cleardata) {
  var encipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  var encryptdata = encipher.update(cleardata, 'utf8', 'binary');
  encryptdata += encipher.final('binary');
  return new Buffer(encryptdata, 'binary').toString('base64');
};

var defaultStampGenerator = function () {
  return shortid.generate();
};

var OnnistuuClient = function (options) {
  this.customer_id = options.customer_id;
  this.encryption_key = new Buffer(options.encryption_key, 'base64');
  this.success_url = options.success_url;
  this.iv = options.iv || '0123467912345678',
  this.failure_url = options.failure_url || '/';
  this.onnistuu_url = options.onnistuu_url || 'https://www.onnistuu.fi/external/entry/';
  this.stamp_generator = options.stamp_generator || defaultStampGenerator;
};

OnnistuuClient.prototype.createRequestBody = function (requirements, document) {
  var encryptData = {
    stamp: this.stamp_generator(),
    customer: this.customer_id,
    return_success: this.success_url,
    document: document,
    requirements: requirements
  };
  var formdata = {
    customer: this.customer_id,
    return_failure: this.failure_url,
    data: encrypt(this.encryption_key, this.iv, JSON.stringify(encryptData)),
    iv: new Buffer(this.iv).toString('base64'),
    cipher: 'rijndael-128',
    padding: 'pkcs5'
  }
  return formdata;
};

OnnistuuClient.prototype.decryptResponse = function(data, iv, callback){
  var a_iv = new Buffer(iv, 'base64').toString('ascii');
  var decryptedData = decrypt(this.encryption_key, a_iv, data);
  try {
    var response = JSON.parse(decryptedData);
    callback(null, response);
  } catch(err){
    callback(err);
  }
};

module.exports = OnnistuuClient;