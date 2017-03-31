import headerTemplate from './src/templates/header.html!text'
import moduleTemplate from './src/templates/module.html!text'
import rp from 'request-promise'
import Mustache from 'mustache'

import fs from 'fs';

export async function render() {
    let data = cleanData(await rp({
        uri: "https://interactive.guim.co.uk/docsdata-test/1_uvmDf7swVvodXkwYAda7Nqw8igKjr5jyrwclrdaMpI.json",
        json: true
    }));

let count = Number(data.header.count);

data.header.counterNumbers = [count - 3, count - 2, count - 1, count].map((num) => {
        return (num < 10) ? "0" + num : num;
    });

let headerHTML = Mustache.render(headerTemplate, data.header);
let moduleHTML = Mustache.render(moduleTemplate, {
    module: data.module,
    // byline: data.byline,
    sources:data.sources,
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
