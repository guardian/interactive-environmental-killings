import headerTemplate from './src/templates/header.html!text'
import moduleTemplate from './src/templates/module.html!text'
import featuredTemplate from './src/templates/featured.html!text'
import rp from 'request-promise'
import Mustache from 'mustache'
import fs from 'fs'
import xr from 'xr'
var throttle = require('promise-ratelimit')(2000);

export async function render() {
    let data = cleanData(await rp({
        uri: "https://interactive.guim.co.uk/docsdata-test/1_uvmDf7swVvodXkwYAda7Nqw8igKjr5jyrwclrdaMpI.json",
        json: true
    }));

    let mapData = (await rp({uri: "https://interactive.guim.co.uk/docsdata-test/1r0XEHvbz08gz1_762VnDjayXm7n8ICTI_Ja8fwenric.json", json: true})).sheets.KillingsMap;
    
    let cleanedMapData = await cleanMapData(mapData);
    // let count = Number(data.header.count);
    // var count = document.querySelector(".count-header__count__number");
    console.log(JSON.stringify(cleanedMapData));
    // data.header.counterNumbers = [count - 3, count - 2, count - 1, count].map((num) => {
    //         return (num < 10) ? "0" + num : num;
    //     });

    let headerHTML = Mustache.render(headerTemplate, data.header);
    let moduleHTML = Mustache.render(moduleTemplate, {
        module: data.module,
        byline: data.byline,
        embedURL:data.embedURL,
        sources:data.sources,
        mapData: JSON.stringify(cleanedMapData),
        moduleFormatted: function(){
            let text = this.copy.replace(/\t\r/g,"").replace(/\n\s*\n/g, '</p><p>');
            return `<p>${text}</p>`
        }});

    return `${headerHTML}${moduleHTML}`;
}


function cleanData(data) {
    data.module.map((unit) => {
        unit[unit.type] = true;
        return unit;
    });

    return data;

}

async function cleanMapData(data) {
    for (let country of data) {
        let locationData = await rp({uri: "https://maps.googleapis.com/maps/api/geocode/json?address=" + country.country + "&key=AIzaSyAThvvv9XgNyie_NegLeNcd8FeGbf985d8", json: true});

        country.location = locationData.results[0].geometry.location;
    }

    return data;
}
