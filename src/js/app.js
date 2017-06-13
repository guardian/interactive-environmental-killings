import {
  getSpreadsheetData
} from './getSpreadsheet.js'
import featuredTemplate from '../templates/featured.html'
import allVictimsTemplate from '../templates/allvictims.html'
import Mustache from 'mustache'
import xr from 'xr'
import {
  scaleLinear,
  scalePoint
} from 'd3-scale'
import {
  max
} from 'd3-array'
import {
  select,
  selectAll
} from 'd3-selection'
import {
  line,
  curveStepAfter
} from 'd3-shape'
import {
  easeLinear
} from 'd3-ease'
import {
  transition
} from 'd3-transition'
import {
  axisLeft
} from 'd3-axis'
import {
  axisBottom
} from 'd3-axis'

var count = document.querySelector(".count-header__count__number");
var months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
var killingsPast = [{
  month: "Jan",
  victims2015: 6,
  victims2016: 16
}, {
  month: "Feb",
  victims2015: 24,
  victims2016: 33
}, {
  month: "March",
  victims2015: 34,
  victims2016: 52
}, {
  month: "April",
  victims2015: 54,
  victims2016: 82
}, {
  month: "May",
  victims2015: 79,
  victims2016: 93
}, {
  month: "June",
  victims2015: 99,
  victims2016: 110
}, {
  month: "July",
  victims2015: 105,
  victims2016: 124
}, {
  month: "Aug",
  victims2015: 121,
  victims2016: 140
}, {
  month: "Sep",
  victims2015: 144,
  victims2016: 157
}, {
  month: "Oct",
  victims2015: 163,
  victims2016: 172
}, {
  month: "Nov",
  victims2015: 174,
  victims2016: 188
}, {
  month: "Dec",
  victims2015: 185,
  victims2016: 200
}]
var killings2017 = [];
var killings2016 = [];
var killings2015 = [];

// Fill sections with spreadsheet data
getSpreadsheetData().then(function(data) {

  //return count
  var total = data.Killings2017.length;
  // console.log(total);
  count.innerHTML = total;

  let mostRecentVictims = data.Killings2017.filter(function(killing, i) {
    return killing.highlight == "yes"
  }).slice(-4).sort(function(a, b) {
    return b.date - a.date;
  }).map(function(recent, j) {
    if (recent.GuardianStoryURL !== "") {
      recent.isProfiled = true;
    } else {
      recent.isProfiled = false;
    }

    if (recent.photo !== "") {
      recent.hasPhoto = true;
    } else {
      recent.hasPhoto = false;
    }
    return recent;
  });


  // let restVictims = data.Killings2017.filter(d => mostRecentVictims.indexOf(d) === -1);
  // console.log(restVictims);

  let restVictims = data.Killings2017.filter(d => mostRecentVictims.indexOf(d) === -1).map(function(vct, i) {
    if (vct.GuardianStoryURL !== "")
      vct.isProfiled = true;
    else
      vct.isProfiled = false;
    return vct;
  });

  let profileVictims = data.Killings2017.filter(function(killing, i) {
    return killing.GuardianStoryURL !== ""
  });
  // console.log(profileVictims);

  let featuredHTML = Mustache.render(featuredTemplate, {
    "people": mostRecentVictims,
  });

  let allVictimsHTML = Mustache.render(allVictimsTemplate, {
    "people": restVictims
  });

  document.querySelector("#featured-victim").innerHTML = featuredHTML;
  document.querySelector("#all-victims").innerHTML = allVictimsHTML;

  // populate step-graphic with cumulative monthly killings

  let cumulativeKillings = data.KillingsRecentYears.filter(function(k, i) {
    return k.cumulative2017 !== ""
  }).map(function(killings, i) {
    killings.hasNumber = killings.cumulative2017 !== ""
    return killings;
  });

  // set the dimensions of the canvas
  var stepMarginLeft = 10;
  var stepMarginRight = 50;
  var stepMarginTop = 10;
  var stepMarginBottom = 50;
  var stepWidth = document.querySelector('#g-step').offsetWidth - stepMarginLeft - stepMarginRight - 50;
  var stepTotalWidth = document.querySelector('#g-step').offsetWidth;
  var stepHeight = stepWidth/1.4 - stepMarginTop - stepMarginBottom + 50;
  var maxOffset = 250;


  // set the ranges
  var xScale = scalePoint().domain(months).range([stepMarginLeft, stepWidth]);
  var yScale = scaleLinear().domain([0, maxOffset]).range([stepHeight, stepMarginTop]);

  //sets up line
  var line2015 = line()
    .x(function(d) {
      return xScale(d.month);
    })
    .y(function(d) {
      return yScale(d.victims2015);
    })
    .curve(curveStepAfter);

  var line2016 = line()
    .x(function(d) {
      return xScale(d.month);
    })
    .y(function(d) {
      return yScale(d.victims2016);
    })
    .curve(curveStepAfter);

  var line2017 = line()
    .x(function(d) {
      return xScale(d.month);
    })
    .y(function(d) {
      return yScale(d.cumulative2017);
    })
    .curve(curveStepAfter);

  var targetEl = document.querySelector("#g-step");
  var svg = select(targetEl).append("svg")
    .attr('width', stepWidth)
    .attr("class", "stepchart")
    .attr('height', stepHeight)
    .append("g")
    .attr("transform", "translate(" + stepMarginLeft * 1.5 + ",-20)");
  // .attr("transform", "translate(" + stepMarginLeft*1.5 + "," + "-" + stepMarginTop*1.5 + ")");
  //get the data
  //format the data

  var killingsDataByYear = cumulativeKillings.slice();

  killingsPast.forEach(function(byYear) {
    killings2016.push(byYear.victims2016);
    killings2015.push(byYear.victims2015);
  })


  killingsDataByYear.forEach(function(byYear) {
    return byYear.cumulative2017 = +byYear.cumulative2017
    return byYear.month = +byYear.month;
  })


  //adds the x axis
  svg.append("g")
    .attr("class", "step-axisX")
    .attr("transform", "translate(0," + stepHeight + ")")
    .call(axisBottom(xScale)
      .ticks(12));

  //adds the y axis
  svg.append("g")
    .attr("class", "step-axisY")
    .attr("transform", "translate(20,0)")
    .call(axisLeft(yScale)
      .ticks(5));

  //adds the y gridlines
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(20,0)")
    .call(axisLeft(yScale)
      .ticks(5)
      .tickSize(-stepWidth)
      .tickFormat("")
    )

  //adds the killingsline
  svg.append("path")
    .data([killingsPast])
    .attr("class", "line2015")
    .attr("d", line2015);

  svg.append("path")
    .data([killingsPast])
    .attr("class", "line2016")
    .attr("d", line2016);

  svg.append("path")
    .data([killingsDataByYear])
    .attr("class", "line2017")
    .attr("d", line2017);

  svg.append("text")
      .attr("transform", function(line2016) {
          return "translate(" + (stepWidth+10) + "," + (yScale(killings2016[killings2016.length-1]) - 2) + ")"
})
      .attr("class","stepLabel")
  		.attr("text-anchor", "start")
  		.style("fill", "#333333")
  		.text(killingsPast[11].victims2016 + " murdered in 2016");

      svg.append("text")
          .attr("transform", function(line2015) {
              return "translate(" + (stepWidth+10) + "," + (yScale(killings2015[killings2015.length-1]) + 10) + ")"
    })
          .attr("class","stepLabel")
      		.attr("text-anchor", "start")
      		.style("fill", "#bdbdbd")
      		.text(killingsPast[11].victims2015 + " murdered in 2015");

var translateWidth = document.getElementsByClassName("line2017")[0].getBBox().width;

          svg.append("text")
              .attr("transform", function(line2017) {
                  return "translate(" + (translateWidth+20) + "," + (yScale(killingsDataByYear[killingsDataByYear.length-1].cumulative2017 )) + ")"
        })
              .attr("class","stepLabel")
          		.attr("text-anchor", "start")
          		.style("fill", "#3faa9f")
          		.text(killingsDataByYear[killingsDataByYear.length-1].cumulative2017 + " murdered in 2017");

          svg.append("rect")
            .attr("class","lineEnd")
            .attr("x", (stepWidth-4))
            .attr("y", function(line2015){return yScale(killings2015[killings2015.length-1])})
            .attr("width", 7)
            .attr("height", 7)
            .style("fill","#bdbdbd");

            svg.append("rect")
              .attr("class","lineEnd")
              .attr("x", (stepWidth-4))
              .attr("y", function(line2016){return yScale(killings2016[killings2016.length-1])})
              .attr("width", 7)
              .attr("height", 7)
              .style("fill","#333");

            svg.append("rect")
              .attr("class","lineEnd")
              .attr("x", (translateWidth+7))
              .attr("y", function(line2017){return yScale(killingsDataByYear[killingsDataByYear.length-1].cumulative2017 + 4)})
              .attr("width", 8)
              .attr("height", 8)
              .style("fill","#3faa9f");



})
