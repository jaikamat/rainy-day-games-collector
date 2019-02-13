let assert = require('chai').assert;
let supertest = require('supertest');
// Note: See https://stackoverflow.com/questions/14001183/how-to-authenticate-supertest-requests-with-passport, answer 2 for specifics
let api = supertest.agent('http://localhost:1337'); // Calling agent() here to support sessions between tests

// TODO: Seed database before each test, and clear after


/**
 * Returns a function that logs an admin in and manages sessions thanks to supertest.agent()
 */
function loginAdmin() {
    return function(done) {
        api.post('/auth/login')
        .send({
            username: 'Jai',
            password: 'testing123'
        })
        .expect(302)
        .then(() => {
            done()
        }, done);
    }
}

// Note: We do not use arrow functions here because it is difficult to aquire the Mocha context
// due to lexically bound `this` --- is this true here for all cases?
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

describe('User Login', function() {
    it('should redirect once a user logs in', function(done) {
        api.post('/auth/login')
        .send({
            username: 'Julie',
            password: 'testing123'
        })
        .set('Accept', 'application/json')
        .expect(302, done) // 302 is status for redirect
    });
});

describe('Admin Access', function() {
    
    before(loginAdmin());
    
    it('should show all users when an admin accesses /users', function(done) {
        api.get('/users')
        .set('Accept', 'application/json')
        .expect(200)
        .then(response => {
            assert.equal(response.body.length, 2);
            assert.equal(response.body[0].username, 'Jai');
            assert.equal(response.body[1].username, 'Julie');
        }).then(() => {
            done();
        }, done);
    });

    // TODO: Implement this route to return something sane on logout
    // after(function(done) {
    //     api.get('/auth.logout')
    //     .then(response => {
    //         console.log(response);
    //         done();
    //     })
    // });
});