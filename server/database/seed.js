const models = require('../database/models');

const cardData = [
    {
       "id":1,
       "isFlip":false,
       "color":"A",
       "rarity":"C",
       "title":"Azorius Locket",
       "setCode":"RNA",
       "price":0.25,
       "quantity":20
    },
    {
       "id":2,
       "isFlip":false,
       "color":"A",
       "rarity":"U",
       "title":"Dovins Automaton",
       "setCode":"RNA",
       "price":1,
       "quantity":3
    },
    {
       "id":3,
       "isFlip":false,
       "color":"A",
       "rarity":"U",
       "title":"Gate Colossus",
       "setCode":"RNA",
       "price":0.5,
       "quantity":8
    },
    {
       "id":4,
       "isFlip":false,
       "color":"A",
       "rarity":"R",
       "title":"Glass of the Guildpact",
       "setCode":"RNA",
       "price":2,
       "quantity":4
    },
    {
       "id":5,
       "isFlip":false,
       "color":"A",
       "rarity":"C",
       "title":"Gruul Locket",
       "setCode":"RNA",
       "price":0.25,
       "quantity":20
    },
    {
       "id":6,
       "isFlip":false,
       "color":"A",
       "rarity":"U",
       "title":"Junktroller",
       "setCode":"RNA",
       "price":0.5,
       "quantity":14
    },
    {
       "id":7,
       "isFlip":false,
       "color":"A",
       "rarity":"C",
       "title":"Orzhov Locket",
       "setCode":"RNA",
       "price":0.25,
       "quantity":20
    },
    {
       "id":8,
       "isFlip":false,
       "color":"A",
       "rarity":"C",
       "title":"Rakdos Locket",
       "setCode":"RNA",
       "price":0.25,
       "quantity":20
    },
    {
       "id":9,
       "isFlip":false,
       "color":"A",
       "rarity":"U",
       "title":"Scrabbling Claws",
       "setCode":"RNA",
       "price":0.5,
       "quantity":10
    },
    {
       "id":10,
       "isFlip":false,
       "color":"A",
       "rarity":"U",
       "title":"Screaming Shield",
       "setCode":"RNA",
       "price":0.5,
       "quantity":11
    },
    {
       "id":11,
       "isFlip":false,
       "color":"A",
       "rarity":"C",
       "title":"Simic Locket",
       "setCode":"RNA",
       "price":0.25,
       "quantity":20
    },
    {
       "id":12,
       "isFlip":false,
       "color":"A",
       "rarity":"U",
       "title":"Sphinx of the Guildpact",
       "setCode":"RNA",
       "price":0.5,
       "quantity":9
    },
    {
       "id":13,
       "isFlip":false,
       "color":"A",
       "rarity":"R",
       "title":"Tome of the Guildpact",
       "setCode":"RNA",
       "price":2,
       "quantity":4
    },
    {
       "id":14,
       "isFlip":false,
       "color":"B",
       "rarity":"R",
       "title":"Awaken the Erstwhile",
       "setCode":"RNA",
       "price":2,
       "quantity":4
    },
    {
       "id":15,
       "isFlip":false,
       "color":"B",
       "rarity":"U",
       "title":"Bankrupt in Blood",
       "setCode":"RNA",
       "price":0.5,
       "quantity":8
    },
    {
       "id":16,
       "isFlip":false,
       "color":"B",
       "rarity":"C",
       "title":"Blade Juggler",
       "setCode":"RNA",
       "price":0.25,
       "quantity":18
    },
    {
       "id":17,
       "isFlip":false,
       "color":"B",
       "rarity":"C",
       "title":"Bladebrand",
       "setCode":"RNA",
       "price":0.25,
       "quantity":19
    },
    {
       "id":18,
       "isFlip":false,
       "color":"B",
       "rarity":"U",
       "title":"Bloodmist Infiltrator",
       "setCode":"RNA",
       "price":0.5,
       "quantity":6
    },
    {
       "id":19,
       "isFlip":false,
       "color":"B",
       "rarity":"C",
       "title":"Carrion Imp",
       "setCode":"RNA",
       "price":0.25,
       "quantity":20
    },
    {
       "id":20,
       "isFlip":false,
       "color":"B",
       "rarity":"C",
       "title":"Catacomb Crocodile",
       "setCode":"RNA",
       "price":0.25,
       "quantity":20
    },
    {
       "id":21,
       "isFlip":false,
       "color":"B",
       "rarity":"U",
       "title":"Clear the Stage",
       "setCode":"RNA",
       "price":0.5,
       "quantity":8
    },
    {
       "id":22,
       "isFlip":false,
       "color":"B",
       "rarity":"C",
       "title":"Consign to the Pit",
       "setCode":"RNA",
       "price":0.25,
       "quantity":19
    },
    {
       "id":23,
       "isFlip":false,
       "color":"B",
       "rarity":"U",
       "title":"Cry of the Carnarium",
       "setCode":"RNA",
       "price":0.5,
       "quantity":3
    },
    {
       "id":24,
       "isFlip":false,
       "color":"B",
       "rarity":"C",
       "title":"Dead Revels",
       "setCode":"RNA",
       "price":0.25,
       "quantity":20
    },
    {
       "id":25,
       "isFlip":false,
       "color":"B",
       "rarity":"C",
       "title":"Debtors Transport",
       "setCode":"RNA",
       "price":0.25,
       "quantity":20
    },
    {
       "id":26,
       "isFlip":false,
       "color":"B",
       "rarity":"U",
       "title":"Drill Bit",
       "setCode":"RNA",
       "price":0.5,
       "quantity":10
    },
    {
       "id":27,
       "isFlip":false,
       "color":"B",
       "rarity":"R",
       "title":"Font of Agonies",
       "setCode":"RNA",
       "price":2,
       "quantity":4
    },
    {
       "id":28,
       "isFlip":false,
       "color":"B",
       "rarity":"C",
       "title":"Grotesque Demise",
       "setCode":"RNA",
       "price":0.25,
       "quantity":20
    }
];

const userData = [{
   username: 'Jai',
   password: 'testing123',
   isAdmin: true
}, {
   username: 'Julie',
   password: 'testing123',
   isAdmin: false
}];

const userCardData = [{
   user_id: 1,
   card_id: 6
}, {
   user_id: 2,
   card_id: 8
}, {
   user_id: 1,
   card_id: 12
}];

// Seeds the database with test data
const seedTest = () => {
   return models.sequelize.sync({ force: true })
   .then(() => {
      console.log('Database models are fine');
   }).then(() => {
      return Promise.all(userData.map(data => models.user.create(data))); // Seed user data
   }).then(() => {
      return Promise.all(cardData.map((data) => models.card.create(data))); // Seed card data
   }).then(() => {
      return Promise.all(userCardData.map(data => models.userCard.create(data))); // Seed wishlist data
   }).catch((error) => {
      console.log(error);
   });
}

module.exports.cardData = cardData;
module.exports.userData = userData;
module.exports.userCardData = userCardData;
module.exports.seedTest = seedTest;