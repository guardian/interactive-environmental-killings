import {getSpreadsheetData} from './getSpreadsheet.js'
import featuredTemplate from '../templates/featured.html'
import allVictimsTemplate from '../templates/allvictims.html'
import Mustache from 'mustache'
import xr from 'xr'
import * as topojson from 'topojson-client'
import {scaleLinear, scalePoint, scaleSqrt} from 'd3-scale'
import {max} from 'd3-array'
import {select,selectAll} from 'd3-selection'
import {line, curveStepAfter} from 'd3-shape'
import {easeLinear, easeCubicInOut} from 'd3-ease'
import {transition} from 'd3-transition'
import {axisLeft} from 'd3-axis'
import {geoPath} from 'd3-geo'
import {axisBottom} from 'd3-axis'
import {geoKavrayskiy7} from 'd3-geo-projection'
import { geoMercator } from 'd3-geo'

var count = document.querySelector(".count-header__count__number");
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var killingsPast = [{month:"January", victims2015:6, victims2016:16},{month:"February", victims2015:24, victims2016:33},{month:"March", victims2015:34, victims2016:52},{month:"April", victims2015:54, victims2016:82},{month:"May", victims2015:79, victims2016:93},{month:"June", victims2015:99, victims2016:110},{month:"July", victims2015:105, victims2016:124},{month:"August", victims2015:121, victims2016:140},{month:"September", victims2015:144, victims2016:157},{month:"October", victims2015:163, victims2016:172},{month:"November", victims2015:174, victims2016:188},{month:"December",victims2015:185, victims2016:200}]
var killings2017 = [];

// Fill sections with spreadsheet data
getSpreadsheetData().then(function(data){

  //return count
  var total = data.Killings2017.length;
  // console.log(total);
  count.innerHTML = total;

  let mostRecentVictims = data.Killings2017.filter(function(killing, i){
  return killing.highlight == "yes" }).slice(-4).sort(function(a, b) {
    return b.date - a.date;
  }).map(function(recent, j) {
    if(recent.GuardianStoryURL !== "")
    {recent.isProfiled = true;}
else
    {recent.isProfiled = false;}

    if (recent.photo !=="")
    {recent.hasPhoto=true;}
else
    {recent.hasPhoto = false;}
    return recent;
  });


  // let restVictims = data.Killings2017.filter(d => mostRecentVictims.indexOf(d) === -1);
  // console.log(restVictims);

  let restVictims = data.Killings2017.filter(d => mostRecentVictims.indexOf(d) === -1).map(function(vct,i){
    if(vct.GuardianStoryURL !== "")
    vct.isProfiled = true;
else
    vct.isProfiled = false;
    return vct;
  });

  let profileVictims = data.Killings2017.filter(function(killing, i) {return killing.GuardianStoryURL !==""});
  // console.log(profileVictims);

  let featuredHTML = Mustache.render(featuredTemplate, {
                            "people": mostRecentVictims,
                          });

  let allVictimsHTML = Mustache.render(allVictimsTemplate, {
                            "people": restVictims
  });

  document.querySelector("#featured-victim").innerHTML=featuredHTML;
  document.querySelector("#all-victims").innerHTML=allVictimsHTML;

  // populate step-graphic with cumulative monthly killings

  let cumulativeKillings = data.KillingsRecentYears.filter(function(k, i){return k.cumulative2017 !==""}).map(function(killings, i){
    killings.hasNumber = killings.cumulative2017 !==""
    return killings;
  });

  // set the dimensions of the canvas
  var stepMarginLeft = 10;
  var stepMarginRight = 10;
  var stepMarginTop = 10;
  var stepMarginBottom = 10;
  var stepWidth = document.querySelector('#g-step').offsetWidth - stepMarginLeft - stepMarginRight;
  var stepHeight = stepWidth/2 - stepMarginTop - stepMarginBottom;
  var maxOffset = 250;

// set the ranges
  var xScale = scalePoint().domain(months).range([stepMarginLeft, stepWidth]);
  var yScale = scaleLinear().domain([0,maxOffset]).range([stepHeight, stepMarginTop]);

//sets up line
  var line2015 = line()
    .x(function(d) {return xScale(d.month);})
    .y(function(d) {return yScale(d.victims2015);})
    .curve(curveStepAfter);

  var line2016 = line()
    .x(function(d) {return xScale(d.month);})
    .y(function(d) {return yScale(d.victims2016);})
    .curve(curveStepAfter);

  var line2017 = line()
    .x(function(d) {return xScale(d.month);})
    .y(function(d) {return yScale(d.cumulative2017);})
    .curve(curveStepAfter);

  var targetEl = document.querySelector("#g-step");
  var svg = select(targetEl).append("svg")
    .attr('width',stepWidth)
    .attr("class", "stepchart")
    .attr('height',stepHeight)
    .append("g")
    .attr("transform", "translate(" + stepMarginLeft*1.5 + "," + "-" + stepMarginTop*1.5 + ")");
//get the data
//format the data

    var killingsDataByYear = cumulativeKillings.slice();
    // console.log(killingsDataByYear);

    killingsDataByYear.forEach(function(byYear){
      // killingsPast.push(byYear.cumulative2015);
      // killings2016.push(byYear.cumulative2016);
      return byYear.cumulative2017 = +byYear.cumulative2017
      // killings2017.push(byYear.cumulative2017);
      // console.log(killings2017);
      return byYear.month = +byYear.month;
      // return d.cumulative2015 = +d.cumulative2015;
      // return d.cumulative2016 = +d.cumulative2016;
      // return d.cumulative2017 = +d.cumulative2017;
    })

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

//adds the x axis
    svg.append("g")
    .attr("class", "step-axis")
    .attr("transform", "translate(0," + stepHeight + ")")
    .call(axisBottom(xScale));

//adds the y axis
    svg.append("g")
    .attr("transform", "translate(10,10)")
    .call(axisLeft(yScale));


//adds dots at the end of the linesvg.selectAll(".dot")
  // .data(data.filter(function(d) { return d; }))
  // .enter().append("circle")
  //   .attr("class", "dot")
  //   .attr("cx", line.x())
  //   .attr("cy", line.y())
  //   .attr("r", 3.5);

  drawMap(data);
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

        var svg = select("#g-map").append("svg")
            .attr("width", width)
            .attr("height", height);

        var circleScale = scaleSqrt().domain([0, 50]).range([0, 40])

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

        circles
            .transition(t)
            .delay(2000)
            .attr("cx", (d) => {
                let xy = projection([d.location.lng, d.location.lat]);
                return xy[0];
            })
            .attr("cy", (d) => {
                let xy = projection([d.location.lng, d.location.lat]);
                return xy[1];
            })
            .attr("r", (d) => circleScale(d["2016--count-per-country"]));

    });

}
