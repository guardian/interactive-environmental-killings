import {getSpreadsheetData} from './getSpreadsheet.js'
import featuredTemplate from '../templates/featured.html'
import allVictimsTemplate from '../templates/allvictims.html'
import Mustache from 'mustache'
import xr from 'xr'

var count = document.querySelector(".count-header__count__number");

// Fill sections with spreadsheet data
getSpreadsheetData().then(function(data){
  console.log(data);
  //return count
  var total = data.Killings2017.length;
  console.log(total);
  count.innerHTML = total;

  let mostRecentVictims = data.Killings2017.filter(function(killing, i){
  return killing.highlight == "yes" }).slice(-4).sort(function(a, b) {
    return b.date - a.date;
  });



  let restVictims = data.Killings2017.filter(d => mostRecentVictims.indexOf(d) === -1);
  console.log(restVictims);

  let featuredHTML = Mustache.render(featuredTemplate, {
                            "people": mostRecentVictims,
                          });

  let allVictimsHTML = Mustache.render(allVictimsTemplate, {
                            "people": restVictims
  });

  document.querySelector("#featured-victim").innerHTML=featuredHTML;
  document.querySelector("#all-victims").innerHTML=allVictimsHTML;

});
