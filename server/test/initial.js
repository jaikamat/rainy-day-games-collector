let assert = require('chai').assert;
let supertest = require('supertest');
// Note: See https://stackoverflow.com/questions/14001183/how-to-authenticate-supertest-requests-with-passport, answer 2 for specifics
let api = supertest.agent('http://localhost:1337'); // Calling agent() here to support sessions between tests

// TODO: Seed database before each test, and clear after


// Returns a function that logs in an admin or regular user and manages sessions thanks to supertest.agent()
function loginUser(permission) {
    let userInfo = {};

    if (!permission) { throw new Error('User permission is required') }

    if (permission === 'admin') {
        userInfo.username = 'Jai';
        userInfo.password = 'testing123';
    }
    else if (permission === 'user') {
        userInfo.username = 'Julie';
        userInfo.password = 'testing123'
    }

    return function(done) {
        api.post('/auth/login')
        .send(userInfo)
        .expect(302)
        .then(() => {
            done()
        }, done);
    }
}

function logoutUser() {
    return function(done) {
        api.get('/auth/logout')
        .expect(302, done);
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

describe('Admin Access', function() {
    before(loginUser('admin'));
    
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
});

describe('User walkthrough', function() {
    before(loginUser('user'));
    after(logoutUser());
    
    it('shold be able to view all cards', function(done) {
        api.get('/cards')
        .set('Accept', 'application/json')
        .expect(200)
        .then(response => {
            assert.equal(response.body.length, 28);
        }).then(() => {
            done();
        }, done);
    });

    it('should add a card to their wishlist', function(done) {
        api.post('/cards/wishlist')
        .send({
            card_id: 7
        })
        .set('Accept', 'application/json')
        .expect(200)
        .then(response => {
            assert.equal(response.body.card_id, 7)
        }).then(() => {
            done();
        }, done)
    });

    it('should show the added card in their wishlist', function(done) {
        api.get('/cards/wishlist')
        .set('Accept', 'application/json')
        .expect(200)
        .then(response => {
            assert.equal(response.body.length, 2);
            assert.equal(response.body[0].card_id, 8);
            assert.equal(response.body[1].card_id, 7);
        }).then(() => {
            done();
        }, done);
    });

    it('should delete a card in their wishlist', function(done) {
        api.delete('/cards/wishlist')
        .send({
            card_id: 8
        })
        .expect(204, done);
    });

    it('should show the card was deleted from their wishlist', function(done) {
        api.get('/cards/wishlist')
        .set('Accept', 'application/json')
        .expect(200)
        .then(response => {
            assert.equal(response.body.length, 1);
            assert.equal(response.body[0].card_id, 7);
        }).then(() => {
            done();
        }, done);
    });
});

/** 
 * TODO:
 *     Test admin walkthrough
 *     - log in
 *     - view users
 *     - delete user
 *     - confirm deletion
 *     - change user username
 *     - confirm change
 *     - view cards
 *     - change card qty
 *     - confirm card change qty
 */