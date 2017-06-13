import {
  getSpreadsheetData
} from './getSpreadsheet.js'
import featuredTemplate from '../templates/featured.html'
import allVictimsTemplate from '../templates/allvictims.html'
import Mustache from 'mustache'
import xr from 'xr'
import * as topojson from 'topojson-client'
import {scaleLinear, scalePoint, scaleSqrt} from 'd3-scale'
import {max} from 'd3-array'
import {select,selectAll} from 'd3-selection'
import {line, curveStepAfter, curveStepBefore} from 'd3-shape'
import {easeLinear, easeCubicInOut} from 'd3-ease'
import {transition} from 'd3-transition'
import {axisLeft} from 'd3-axis'
import {geoPath} from 'd3-geo'
import {axisBottom} from 'd3-axis'
import {geoKavrayskiy7} from 'd3-geo-projection'
import { geoMercator } from 'd3-geo'

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

          // was erroring?
          // svg.append("text")
          //     .attr ("x", (stepWidth+5))
          //     .attr ("y", 150)
          //     .attr("class","stepLabel")
          // 		.attr("text-anchor", "start")
          // 		.style("fill", "##3faa9f")
          // 		.text(killingsDataByYear[killingsDataByYear.length].cumulative2017 + " murdered in 2015");



  //adds dots at the end of the linesvg.selectAll(".dot")
  // .data(data.filter(function(d) { return d; }))
  // .enter().append("circle")
  //   .attr("class", "dot")
  //   .attr("cx", line.x())
  //   .attr("cy", line.y())
  //   .attr("r", 3.5);

  drawMap(data);

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

let drawMap = (data) => {
    let mapEl = document.querySelector("#g-map")
    mapEl.classList.remove("mainCol");

    xr.get("<%= path %>/assets/world-50m.json").then((data) => {
        let world = data.data;

        var width = mapEl.clientWidth,
            height = width * (3.5 / 5);

        var countries = topojson.feature(world, world.objects.countries).features,
            neighbors = topojson.neighbors(world.objects.countries.geometries);

        var projection = geoMercator()
            .fitSize([width, width], topojson.feature(world, world.objects.countries));
        // .scale(170)
        // .translate([width / 2, height / 2])
        // .precision(.1);

        var drawPath = geoPath()
            .projection(projection);

        var svg = select(mapEl).append("svg")
            .attr("width", width)
            .attr("height", height);

        var circleScale = scaleSqrt().domain([0, 50]).range([0, (width > 740) ? 40 : 30])


        svg.selectAll(".country")
            .data(countries)
            .enter().insert("path")
            .attr("class", "country")
            .attr("d", drawPath)
            .style("fill", "#cccccc")
            .style("stroke", "#dcdcdc");

        // svg.insert("path")
        //     .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
        //     .attr("class", "boundary")
        //     .attr("d", path);

        let t = transition()
          .duration(1000)
          .ease(easeCubicInOut);

        let circles = svg.selectAll("circle")
            .data(mapData)
            .enter().append("circle")
            .attr("class", "circle")
            .attr("cx", (d) => {
                let xy = projection([d.location.lng, d.location.lat]);
                return xy[0];
            })
            .attr("cy", (d) => {
                let xy = projection([d.location.lng, d.location.lat]);
                return xy[1];
            })
            .attr("r", (d) => circleScale(d["2015--count-per-country"]))
            .style("fill", "none")
            .style("stroke", "#3faa9f")
            .style("stroke-width", "2px")

        let keyCircles = svg.append("g").selectAll("circle")
            .data([40, 10])
            .enter().append("circle")
            .attr("class", "circle")
            .attr("cx", (d, i) => {
                return width - ((width > 740) ? 60 : 50);
            })
            .attr("cy", (d, i) => {
                if(i === 0) {
                  return (width > 740) ? 54 : 42;
                } else {
                  return (width > 740) ? 70 : 54;
                }
            })
            .attr("r", (d) => circleScale(d))
            .style("fill", "none")
            .style("stroke", "#3faa9f")
            .style("stroke-width", "2px")

        let keyLabels = svg.append("g").selectAll("text")
            .data([40, 10])
            .enter().append("text")
            .attr("class", "map-label")
            .attr("x", (d, i) => {
                return width - ((width > 740) ? 60 : 50);
            })
            .attr("y", (d, i) => {
                if(i === 0) {
                  return (width > 740) ? 50 : 42;
                } else {
                  return (width > 740) ? 72 : 56;
                }
            })
            .text((d) => d)
            .style("text-anchor", "middle")
            .attr("dy", (d) => {
              if(d === 40) {
                return -8;
              } else {
                return 4;
              }
            });

        svg.append("text")
          .attr("x", width - ((width > 740) ? 60 : 50)) 
          .attr("y", (width > 740) ? 12 : 12)
          .classed("map-label", true)
          .text("Activist deaths")
          .style("text-anchor", "middle")
          .style("font-weight", "bold");

        let topFive = mapData.sort((a, b) => b["2015--count-per-country"]-a["2015--count-per-country"]).slice(0, 5)

        let labels = svg.selectAll("text")
            .data(topFive)
            .enter().append("text")
            .attr("class", "map-label")
            .attr("x", (d) => {
                let xy = projection([d.location.lng, d.location.lat]);
                return xy[0];
            })
            .attr("y", (d) => {
                let xy = projection([d.location.lng, d.location.lat]);
                return xy[1];
            })
            .text((d) => d.country)
            .attr("dy", "4")
            .attr("text-anchor", "middle")


        // add years

        let buttons = select(mapEl).append("div")
          .classed("map-years", true)
          .selectAll("span")
          .data([2015, 2016, "All years"])
          .enter()
          .append("span")
          .html((d) => d)
          .classed("active", (d) => {
            return d === "All years";
          });

          buttons.on("click", function(d) {
            buttons.classed("active", false);

            select(this).classed("active", true);

            animateCircles(circles, d);
          });


        function animateCircles(circles, year) {
          // this is the worst line of code I've ever written, but it works
          let topFive = (year !== "All years") ? mapData.sort((a, b) => b[year + "--count-per-country"]-a[year + "--count-per-country"]).slice(0, 5) : mapData.sort((a, b) => ((Number(b["2016--count-per-country"]) + Number(b["2015--count-per-country"])))-((Number(a["2016--count-per-country"]) + Number(a["2015--count-per-country"])))).slice(0, 5);

          labels.data(topFive)
              .attr("x", (d) => {
                  let xy = projection([d.location.lng, d.location.lat]);
                  return xy[0];
              })
              .attr("y", (d) => {
                  let xy = projection([d.location.lng, d.location.lat]);
                  return xy[1];
              })
              .text((d) => d.country);

          circles
            .transition(t)
            .attr("cx", (d) => {
                let xy = projection([d.location.lng, d.location.lat]);
                return xy[0];
            })
            .attr("cy", (d) => {
                let xy = projection([d.location.lng, d.location.lat]);
                return xy[1];
            })
            .attr("r", (d) => {
              let count = (year !== "All years") ? d[year + "--count-per-country"] : (Number(d["2016--count-per-country"]) + Number(d["2015--count-per-country"]));
              return circleScale(count);
            });
        }

    });

}
