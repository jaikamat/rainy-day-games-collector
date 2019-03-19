const fs = require("fs");

async function updateScryfallWithRDG(models, setStr) {
    const sequelize = models.sequelize;
    let json = JSON.parse(fs.readFileSync("rdg-scraped-data.json", "utf8"));
    let failures = [];
    let set = setStr.toUpperCase(); // Card objects from RDG have allcaps set codes

    console.log("Beginning " + set + " merge into database");
    let filteredCards = json.filter(el => el.setCode === set);
    console.log("Attempting to update " + filteredCards.length + " cards");

    for (el of filteredCards) {
        let title = el.title
            .toLowerCase()
            .trim()
            .split(" ");

        // Cards in RDG data do not have punctuation - here we remove 's' from the ends of
        // all strings in an effort to force a looser fuzzy search
        let titleRemoveS = title.map(str => {
            if (str[str.length - 1] === "s") {
                return str.slice(0, -1);
            } else {
                return str;
            }
        });

        let cardTitleRegex = titleRemoveS.join("%") + "%"; // Creates regular expression for SQL query

        let setCode = el.setCode.toLowerCase().trim(); // Converting set code for search of scryfall data
        let price = el.price;
        let quantity = el.quantity;
        let isFoil = el.isFoil;

        // See https://github.com/sequelize/sequelize/issues/2077
        // and https://github.com/sequelize/sequelize/issues/4322
        // for explanations of ORM syntax here
        let updatedCard = await models.card.update(
            {
                price: price,
                quantity: quantity,
                foilQuantity: isFoil ? quantity : 0
            },
            {
                where: {
                    $and: [
                        sequelize.where(
                            sequelize.fn("lower", sequelize.col("title")), // LOWER(title) LIKE LOWER(str%)
                            { like: cardTitleRegex }
                        ),
                        sequelize.where(
                            sequelize.fn("lower", sequelize.col("setCode")), // LOWER(setCode) LIKE "setCode"
                            setCode
                        )
                    ]
                }
                // returning: true
            }
        );

        if (updatedCard[0] === 0) {
            // If no updates were logged, the card failed to properly query
            failures.push(el);
        }
    }

    console.log(failures.length + " cards failed to update");
    console.log(failures);
}

module.exports.updateScryfallWithRDG = updateScryfallWithRDG;
