const cheerio = require('cheerio');
const axios = require('axios');

/**
 * Fetches HTML for Cheerio.js to parse. 
 * @param {String} url
 * @returns Returns the cheerio object
 */
async function retrieveHTML(url) {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    return $;
}

class Card {
    // TODO: implement more functions to sanitize inputs
    constructor (cardObj) {
        let priceString = cardObj.price.split("$")[1];

        this.isFlip = Card.isFLip(cardObj.rarity);
        this.color = cardObj.color;
        this.rarity = cardObj.rarity;
        this.title = cardObj.title;
        this.setCode = cardObj.setCode;
        if (!this.isFlip) {
            this.price = Card.convertNum(priceString);
        }
        if (!this.isFlip) {
            this.quantity = Card.convertNum(cardObj.quantity);
        }
    }

    /**
     * Certain elements of input data are not sane, this performs a 
     * sanity check to add an 'isFlip' property to the card object.
     * @param {String} string
     */
    static isFLip(string) {
        const FLIP = 'Flip';
        const FLIP_F = 'F';
        return string === FLIP || string === FLIP_F;
    }

    /**
     * Error handling for strange non-number string values in source data table.
     * @param {String} string
     */
    static convertNum(string) {
        if (string !== undefined && !isNaN(Number(string))) {
            return Number(string);
        }
        return 'not found';
    }

    /**
     * Removes unneeded card object values from scraped data.
     * @param {Object} card 
     * @param {Object} filters - object with string values in array to filter on
     * @returns {Boolean}
     */
    static removeCards(card, filters) {
        for (let prop in filters) {
            if (filters.hasOwnProperty(prop)) {
                if (filters[prop].indexOf(card[prop]) !== -1) { // See if the card prop is in the filter props
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Splits a pre-formatted URL and returns a 3-letter MtG Set Code.
     * @param {String} url 
     * @returns {String} Returns the 3-letter set code (ex. 'RNA')
     */
    static getSetCode(url) {
        let myArray = url.split('/');
        return myArray[myArray.length - 1].split('.')[0];
    }
}

/**
 * Scrapes the main singles set-selection page for links, then iterates over 
 * those links, collecting table data for each card.
 * @returns Returns an array of card objects.
 */
async function getCards() {
    console.log('Initiating scrape')

    const BASE_URL = 'http://rainy-day-games.com/';
    let setHrefs = [];
    let cardData = [];
    
    // get the initial html for parsing
    let $ = await retrieveHTML(BASE_URL + 'magic.php');

    $('td > a').each((index, element) => {
        setHrefs.push($(element).attr('href'));
    });

    // TODO: remove this after RNA is added to the scraped data - their site is a WIP
    setHrefs.shift();

    let setCodes = setHrefs.map((href) => {
        return Card.getSetCode(href);
    });

    let asyncToResolve = setHrefs.map((href) => {
        return retrieveHTML(BASE_URL + href);
    });

    // using Promise.all to make get requests 
    // concurrently rather than one at a time in 
    // the `for` loop significantly speeds up scraping
    setHrefs = await Promise.all(asyncToResolve);

    console.log('Async requests complete')
    
    for (let i = 0; i < setHrefs.length; i++) {
        console.log('Collecting cards' + '.'.repeat(i));
        let $ = setHrefs[i];
        let rows = $('tr');

        for (let j = 0; j < rows.length; j++) {
            let card = {};
            let current = $(rows[j]);
            let color = current.children('td:nth-child(1)').text();
            let rarity = current.children('td:nth-child(2)').text();
            let title = current.children('td:nth-child(3)').text();
            let price = current.children('td:nth-child(4)').text();
            let quantity = current.children('td:nth-child(5)').text();
            let setCode = setCodes[i];

            card.color = color;
            card.rarity = rarity;
            card.title = title;
            card.price = price;
            card.quantity = quantity;
            card.setCode = setCode;

            cardData.push(new Card(card));
        }
    }
    console.log('Scrape complete')
    return cardData.filter((card) => {
        // Filtering on 'ZZT' and 'UST' because un-sets and tokens are ignored,
        // and source data produces errors
        let filters = {
            quantity: ['not found'],
            title: ['Card Name'],
            setCode: ['ZZT', 'UST', 'UGL', 'UNH']
        };
        return Card.removeCards(card, filters);
    });
}

module.exports.getCards = getCards;