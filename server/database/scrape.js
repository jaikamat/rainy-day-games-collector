const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
const ProgressBar = require('progress');
const BASE_URL = 'http://rainy-day-games.com/';

class Card {
    // TODO: implement more functions to sanitize inputs
    constructor (cardObj) {
        let priceString = cardObj.price.split("$")[1];

        this.isFlip = Card.isFLip(cardObj.price);
        this.color = cardObj.color;
        this.rarity = cardObj.rarity;
        this.title = cardObj.title;
        this.setCode = cardObj.setCode;
        this.isFoil = cardObj.isFoil;
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
        return 0; // 'not found' or missing info defaults to 0
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
 * Fetches HTML for Cheerio.js to parse. 
 * @param {String} url
 * @returns Returns the cheerio object
 */
async function retrieveHTML(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    await browser.close();

    const $ = cheerio.load(bodyHTML);
    return $;
}

/**
 * Iterates over setCode URIs and fetches HTML for Cheerio.js to parse
 * @param {Array} setHrefs An array of mtg set URIs
 * @returns Returns an array of Cheerio.js objects
 */
async function collectSetPages(setHrefs) {
    let setPages = [];
    const browser = await puppeteer.launch();
    let puppetBar = new ProgressBar('Puppeteer working [:bar] :elapsed sec elapsed', { total: 50 });

    for (let i = 0; i < setHrefs.length; i++) { // Loop over all setcode URI's
        let href = setHrefs[i];
        const page = await browser.newPage();
        await page.goto(BASE_URL + href);
        const bodyHTML = await page.evaluate(() => document.body.innerHTML);        
        setPages.push(cheerio.load(bodyHTML));
        await page.close();

        puppetBar.tick(50/setHrefs.length);
    }
    
    console.log('\nPuppeteer requests complete');
    await browser.close();

    return setPages;
}

/**
 * Scrapes the main singles set-selection page for links, then iterates over 
 * those links, collecting table data for each card.
 * @returns Returns an array of card objects.
 */
async function getCards() {
    console.log('Initiating scrape')

    let setHrefs = [];
    let cardData = [];
    
    // Get the initial html for parsing
    let $ = await retrieveHTML(BASE_URL + 'magic.php');

    $('td > a').each((index, element) => {
        setHrefs.push($(element).attr('href'));
    });

    let setCodes = setHrefs.map((href) => {
        return Card.getSetCode(href);
    });

    let setPages = await collectSetPages(setHrefs);

    let collectBar = new ProgressBar('Collecting cards [:bar] :elapsed sec elapsed', { total: 50 });
    
    for (let i = 0; i < setPages.length; i++) {
        let $ = setPages[i]; // The array is already a Cheerio object, but this improves readability
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
            card.isFoil = card.title.includes('(FOIL)') ? true : false;

            cardData.push(new Card(card));
        }
        collectBar.tick(50/setPages.length);
    }
    console.log('\nScrape complete');

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

getCards()
.then(cards => {
    fs.writeFileSync('./rdg-scraped-data.json', JSON.stringify(cards));
}).catch(error => {
    console.log(error);
});

module.exports.getCards = getCards;