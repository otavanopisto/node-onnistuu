var assert = require('chai').assert;
var OnnistuuClient = require('../index');
var encrypted_request;

var test_config = {
  /*
   * Taken from onnistuu.fi api documentation, wont work on the actual api.
   */ 
  customer_id: '3e700411-4574-4c48-90de-fde5dbba5e9e',
  encryption_key: 'Dw0coe6YCFdFZkHuALwsZjMd2PQuOCm2qfazKHC6QLc=',
  success_url: 'http://localhost:3000/success',
  failure_url: 'http://localhost:3000/fail'
};

var test_requirements = [
  {type: "person", identifier: '010101-123N'}  
];

describe('OnnistuuClient', function() {
  describe('#createRequestBody()', function() {
    it('Creating encrypted request', function() {
      var onnistuuClient = new OnnistuuClient(test_config);
      encrypted_request = onnistuuClient.createRequestBody(test_requirements, 'http://example.com/doc.pdf');
      assert.isNotNull(encrypted_request, 'Encrypted data is not null');
      assert.equal(encrypted_request.customer, test_config.customer_id, 'Customer matches clientId');
      assert.equal(encrypted_request.return_failure, test_config.failure_url, 'Failure url matches configured one');
      assert.equal(encrypted_request.cipher, 'rijndael-128', 'Cipher is rijndael-128');
      assert.equal(encrypted_request.padding, 'pkcs5', 'Padding is pkcs5');
    });
  });
  describe('#decryptResponse()', function() {
    it('Decrypting request', function(done) {
      var onnistuuClient = new OnnistuuClient(test_config);
      encrypted_request = onnistuuClient.decryptResponse(encrypted_request.data, encrypted_request.iv, function(err, response){
        assert.isNull(err, 'No errors');
        assert.equal(response.requirements[0].type, test_requirements[0].type, 'Decrypted request has correct requirement type');
        assert.equal(response.requirements[0].identifier, test_requirements[0].identifier, 'Decrypted request has correct requirement identifier');
        done();
      });
    });
  });
});
