const assert = require("chai").assert;
const supertest = require("supertest");
// Note: See https://stackoverflow.com/questions/14001183/how-to-authenticate-supertest-requests-with-passport, answer #2 for specifics
const api = supertest.agent("http://localhost:1337"); // Calling agent() here to support sessions between tests

// Returns a function that logs in an admin or regular user and manages sessions thanks to supertest.agent()
function loginUser(permission) {
    let userInfo = {};

    if (!permission) {
        throw new Error("User permission is required");
    }

    if (permission === "admin") {
        userInfo.username = "Jai";
        userInfo.password = "testing123";
    } else if (permission === "user") {
        userInfo.username = "Julie";
        userInfo.password = "testing123";
    }

    return function(done) {
        api.post("/auth/login")
            .send(userInfo)
            .expect(302)
            .then(() => {
                done();
            }, done);
    };
}

function logoutUser() {
    return function(done) {
        api.get("/auth/logout").expect(302, done);
    };
}

// Note: We do not use arrow functions here because it is difficult to aquire the Mocha context
// due to lexically bound `this` --- is this true here for all cases?
describe("Card", function() {
    it("should return a 200 response", function(done) {
        api.get("/cards").expect(200, done);
    });

    it("should retrieve the correct number of objects", function(done) {
        api.get("/cards")
            .expect(200)
            .then(response => {
                assert.equal(response.body.length, 30);
            })
            .then(() => {
                done();
            }, done); // Pass done here as failure callback to catch errors in the mocha context
    });
});

describe("User walkthrough", function() {
    before(loginUser("user"));
    after(logoutUser());

    it("shold be able to view all cards", function(done) {
        api.get("/cards")
            .expect(200)
            .then(response => {
                assert.equal(response.body.length, 30);
            })
            .then(() => {
                done();
            }, done);
    });

    it("should add a card to their wishlist", function(done) {
        api.post("/cards/wishlist")
            .send({ card_id: 7 })
            .expect(200)
            .then(response => {
                assert.equal(response.body.card_id, 7);
            })
            .then(() => {
                done();
            }, done);
    });

    it("should show the added card in their wishlist", function(done) {
        api.get("/cards/wishlist")
            .expect(200)
            .then(response => {
                assert.equal(response.body.length, 2);
                assert.equal(response.body[0].card_id, 8);
                assert.equal(response.body[1].card_id, 7);
            })
            .then(() => {
                done();
            }, done);
    });

    it("should delete a card in their wishlist", function(done) {
        api.delete("/cards/wishlist")
            .send({ card_id: 8 })
            .expect(204, done);
    });

    it("should show the card was deleted from their wishlist", function(done) {
        api.get("/cards/wishlist")
            .expect(200)
            .then(response => {
                assert.equal(response.body.length, 1);
                assert.equal(response.body[0].card_id, 7);
            })
            .then(() => {
                done();
            }, done);
    });
});

describe("Admin walkthrough", function() {
    before(loginUser("admin"));
    after(logoutUser());

    it("should be able to view all users", function(done) {
        api.get("/users")
            .expect(200)
            .then(response => {
                assert.equal(response.body.length, 2);
                assert.equal(response.body[0].username, "Jai");
                assert.equal(response.body[1].username, "Julie");
            })
            .then(() => {
                done();
            }, done);
    });

    it("should be able to edit a username", function(done) {
        api.post("/users")
            .send({
                userId: 2,
                username: "Jules"
            })
            .expect(200)
            .then(response => {
                assert.equal(response.body.username, "Jules");
            })
            .then(() => {
                done();
            }, done);
    });

    it("shouldn't be able to delete themselves", function(done) {
        api.delete("/users")
            .send({ userId: 1 })
            .expect(500)
            .then(response => {
                assert.equal(response.error.text, "You can't delete yourself!");
            })
            .then(() => {
                done();
            }, done);
    });

    it("should be able to delete another user", function(done) {
        api.delete("/users")
            .send({ userId: 2 })
            .expect(204)
            .then(() => {
                return api.get("/users").expect(200);
            })
            .then(response => {
                assert.equal(response.body.length, 1);
                assert.equal(response.body[0].username, "Jai");
            })
            .then(() => {
                done();
            }, done);
    });

    it("should be able to view all cards", function(done) {
        api.get("/cards")
            .expect(200)
            .then(response => {
                assert.equal(response.body.length, 30);
            })
            .then(() => {
                done();
            }, done);
    });

    it("should be able to change a card's quantity", function(done) {
        let param = 14;

        api.post("/cards/update/" + param)
            .send({
                quantity: 17,
                foilQuantity: 1,
                price: 21.25
            })
            .expect(200)
            .then(response => {
                assert.equal(response.body.quantity, 17);
                assert.equal(response.body.foilQuantity, 1);
                assert.equal(response.body.price, 21.25);
            })
            .then(() => {
                done();
            }, done);
    });

    it("should confirm that card quantity change was persisted", function(done) {
        api.get("/cards")
            .expect(200)
            .then(response => {
                let card = response.body.find(el => el.card_id === 14);

                assert.equal(card.quantity, 17);
                assert.equal(card.foilQuantity, 1);
                assert.equal(card.price, 21.25);
            })
            .then(() => {
                done();
            }, done);
    });
});
