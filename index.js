const axios = require('axios');
const fs = require('fs');

let rawdata = fs.readFileSync('ah.json');
let ah = JSON.parse(rawdata);
rawdata = fs.readFileSync('vendedorSell.json');
let vendedor = JSON.parse(rawdata);
ah = ah.auctions;

// console.log(ah.filter((auction) => auction.item.id === 154898).sort((a, b) => { return a.unit_price - b.unit_price }).map((e) => e.unit_price / 10000));


let cookingBfa;

axios.get('https://us.api.blizzard.com/data/wow/profession/185/skill-tier/2541?namespace=static-us&locale=en_US&access_token=US200xe7C4vWpnXZWks3Jym72iY4UR3QVo')
    .then(response => {
        cookingBfa = response.data
        const recipe = cookingBfa.categories.filter((e) => e.name === "Large Meals");
        // craftcostPerUnit((recipe[0].recipes.filter((e) => e.id === 40590))[0].id);
        recipe[0].recipes.map((e) => {
            // console.log(e. name + " profit: " + craftcostPerUnit(e.id));
            craftcostPerUnit(e.id);
        })
    })
    .catch(error => {
        console.log(error);
    });


function craftcostPerUnit(id) {
    let cost = 0;
    axios.get('https://us.api.blizzard.com/data/wow/recipe/' + id + '?namespace=static-us&locale=pt_BR&access_token=US200xe7C4vWpnXZWks3Jym72iY4UR3QVo')
        .then((response) => {
            const reagents = response.data.reagents;
            reagents.map((e) => {
                vendedorPrice = vendedor.items.find((itemsSelled) => itemsSelled.id === e.reagent.id);
                if (vendedorPrice) {
                    cost += vendedorPrice.price * e.quantity;
                } else {
                    const auctionPrice = ah.filter((auction) => auction.item.id === e.reagent.id)
                        .sort((a, b) => {
                            return a.unit_price - b.unit_price;
                        })
                        .map((t) => t.unit_price)[0];
                    cost += auctionPrice * e.quantity;
                }
            });
            console.log(response.data.crafted_item.name + " Rank " + response.data.rank + " \nlucro: " + (profitPerUnit(response.data.crafted_item.id) - (cost / (100 * 100) / response.data.crafted_quantity.value)));
            // profitPerUnit(response.data.crafted_item.id);
        })
        .catch((error) => {
            console.log(error);
        })
}

function profitPerUnit(id) {
    const minBuyout = auctionPrice = ah.filter((auction) => auction.item.id === id)
        .sort((a, b) => {
            return a.unit_price - b.unit_price;
        })
        .map((t) => t.unit_price)[0];
    return minBuyout / (100 * 100);
}