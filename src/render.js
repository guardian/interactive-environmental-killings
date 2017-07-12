import headerTemplate from './src/templates/header.html!text'
import moduleTemplate from './src/templates/module.html!text'
import featuredTemplate from './src/templates/featured.html!text'
import relatedTemplate from './src/templates/related.html!text'
import rp from 'request-promise'
import Mustache from 'mustache'
import fs from 'fs'
import xr from 'xr'

export async function render() {

    let data = cleanData(await rp({
        uri: "https://interactive.guim.co.uk/docsdata-test/1_uvmDf7swVvodXkwYAda7Nqw8igKjr5jyrwclrdaMpI.json",
        json: true
    }));

    let mapData = (await rp({uri: "https://interactive.guim.co.uk/docsdata/1Rd4H846JCPOKo8YB5jEEDvryryIA6lr1-9KyQwQSK8U.json", json: true})).sheets.KillingsMap;

    let cleanedMapData = await cleanMapData(mapData);
    // let count = Number(data.header.count);
    // var count = document.querySelector(".count-header__count__number");
    // console.log(JSON.stringify(cleanedMapData));
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
        // console.log(data.links)
    let relatedHTML = Mustache.render(relatedTemplate, data.links);

    return `${headerHTML}${moduleHTML}${relatedHTML}`;
}


function cleanData(data) {
    data.module.map((unit) => {
        unit[unit.type] = true;
        return unit;
    });

    return data;

}

async function cleanMapData(data) {
    let savedLocations = JSON.parse(fs.readFileSync("./src/assets/data/saved-locations.json", "utf8"));

    for (let country of data) {
        let locationData = (savedLocations.find((d) => d.country === country.country))
            ? savedLocations.find((d) => d.country === country.country).location
            : (await rp({uri: "https://maps.googleapis.com/maps/api/geocode/json?address=" + country.country + "&key=AIzaSyCISdl2EekuUvxOY7pWPUsud2mfH5kDbiI", json: true})).results[0].geometry.location;

        country.location = locationData;
    }

    // fs.writeFileSync("./src/assets/data/saved-locations.json", JSON.stringify(data));
    return data;
}
