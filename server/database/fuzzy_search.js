const fs = require('fs');
const fuse = require('fuse.js');
const scrape = require('./scrape');

// This file to only be used once, as a helper to seed the database with more modern data for cards.
// Takes the scryfall json and fuzzy searches RDG's titles, writing the info to a new JSON file to be persisted to db

let scryfallJSON = JSON.parse(fs.readFileSync('../scryfall-default-cards.json'), 'utf8');

async function init() {
    let rdgCards = await scrape.getCards();

    // must fuse search only on cards from specific setcode, then perform title search
    // for each card
        // if no setcode specified, set setcode
        // filter scryfall JSON on setcode
        // if setcode !== current setcode, filter JSON
    let setCode = null;

    rdgCards.forEach(card => {
        let searchableCards = scryfallJSON;

        if(!setCode || card.setCode !== setCode) {
            setCode = card.setCode
            searchableCards = scryfallJSON.filter(card => card.setCode === setCode); // filter the data
            console.log(setCode);
        };

        // perform fuzzy search here

        // write data to json file:
        // {
        //     name
        //     color_identity
        //     id
        //     tcgplayer_id
        //     image_uri
        //     storePrice
        //     storeQuantity
        // }
    });
}

init();