import {getSpreadsheetData} from './getSpreadsheet.js'
import xr from 'xr'

var count = document.querySelector(".count-header__count__number");
if (document.querySelector('.count-header__count__number') == null) {
    alert("we've got class");
}

// Fill sections with spreadsheet data
getSpreadsheetData().then(function(data){
  // console.log(data);
  //return count
  var total = data.Killings2017.length;
  console.log(total);
  count.innerHTML = total;

  //return most recent victims
  let mostRecentVictims = data.Killings2017.filter(function(murder, i){
    return murder.highlight == "yes" }).slice(-4).sort(function(a, b) {
        return b.date - a.date;});
  console.log(mostRecentVictims);

  //return all victims from 2017 minus the highlighted ones

});
