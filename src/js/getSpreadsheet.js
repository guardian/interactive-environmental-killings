import xr from 'xr'

var spreadsheetUrl = 'https://interactive.guim.co.uk/docsdata-test/1r0XEHvbz08gz1_762VnDjayXm7n8ICTI_Ja8fwenric.json';

export function getSpreadsheetData() {

    return xr.get(spreadsheetUrl).then(function(d) {
        return new Promise((resolve, reject) => {
            d.data.sheets.Killings2017 = d.data.sheets.Killings2017.filter(function(k, i) {
                return k.id !== ""
            }).map(function(killing, i) {
                killing.isFeatured = killing.highlight === "yes" ? true : false;
                killing.id = i;
                var day = new Date(killing.date.split('/')[2] + "/" +  killing.date.split('/')[1] + '/' + killing.date.split('/')[0]);
                var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
            	  killing.date = day.getDate() + " " + months[day.getMonth()] + " " + day.getFullYear();
                return killing;
            }).sort(function(a, b) {
                return a.date - b.date;
            });

            //return most recent



            //return all data
            resolve(d.data.sheets);
        });
    })
}
