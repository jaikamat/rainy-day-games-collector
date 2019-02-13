let should = require('chai').should;
let expect = require('chai').expect;
let assert = require('chai').assert;
let supertest = require('supertest');
let api = supertest('http://localhost:1337');

// TODO: Seed database before each test, and clear after

// Note: We do not use arrow functions here because it is difficult to aquire the Mocha context
// due to lexically bound `this`
describe('Card', function() {
    it('should return a 200 response', function(done) {
        api.get('/cards')
        .set('Accept', 'application/json')
        .expect(200, done)
    });
    
    it('should retrieve the correct number of objects', function(done) {
        api.get('/cards')
        .set('Accept', 'application/json')
        .expect(200)
        .then(response => {
            assert.equal(response.body.length, 28);
        }).then(() => {
            done();
        }, done); // Pass done here as failure callback to catch errors
    });
});