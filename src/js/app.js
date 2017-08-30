import {
  getSpreadsheetData
} from './getSpreadsheet.js'
import featuredTemplate from '../templates/featured.html'
import allVictimsTemplate from '../templates/allvictims.html'
import tableTemplate from '../templates/tableTemplate.html'
import relatedTemplate from '../templates/related.html'
import Mustache from 'mustache'
import xr from 'xr'
import * as topojson from 'topojson-client'
import {
  scaleLinear,
  scalePoint,
  scaleSqrt
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
  curveStepAfter,
  curveStepBefore
} from 'd3-shape'
import {
  easeLinear,
  easeCubicInOut
} from 'd3-ease'
import {
  transition
} from 'd3-transition'
import {
  axisLeft
} from 'd3-axis'
import {
  geoPath
} from 'd3-geo'
import {
  axisBottom
} from 'd3-axis'
import {
  geoPatterson
} from 'd3-geo-projection'

var expandList = document.querySelector(".read-more");
var count1 = document.querySelector(".count-header__count__number");
var months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
var killingsPast = [{
  month: "Jan",
  victims2014:13,
  victims2015: 6,
  victims2016: 16
}, {
  month: "Feb",
  victims2014:22,
  victims2015: 24,
  victims2016: 33
}, {
  month: "March",
  victims2014:29,
  victims2015: 34,
  victims2016: 52
}, {
  month: "April",
  victims2014:39,
  victims2015: 54,
  victims2016: 82
}, {
  month: "May",
  victims2014:49,
  victims2015: 79,
  victims2016: 93
}, {
  month: "June",
  victims2014:55,
  victims2015: 99,
  victims2016: 110
}, {
  month: "July",
  victims2014:65,
  victims2015: 105,
  victims2016: 124
}, {
  month: "Aug",
  victims2014:78,
  victims2015: 121,
  victims2016: 141
}, {
  month: "Sep",
  victims2014:93,
  victims2015: 144,
  victims2016: 158
}, {
  month: "Oct",
  victims2014:107,
  victims2015: 163,
  victims2016: 173
}, {
  month: "Nov",
  victims2014:112,
  victims2015: 174,
  victims2016: 189
}, {
  month: "Dec",
  victims2014:117,
  victims2015: 185,
  victims2016: 201
}]
var killings2017 = [];
var killings2016 = [];
var killings2015 = [];
var killings2014 = [];



// Fill sections with spreadsheet data
getSpreadsheetData().then(function(data) {
  //return count
  var total = data.Killings2017.length;
  count1.innerHTML = [total].map((num) => {
    return ((num < 10) ? "0" + num : num) + " environmental";
  });
  count1.style.visibility = "visible";

  // let latestUpdate = data.Killings2017.filter(function(killing,i){
  //   return killing.latestUpdate !== ""
  // }).slice(0,1).map(function(latest,j){return latest.latestUpdate});
  //
  // console.log(latestUpdate);

  let mostRecentVictims = data.Killings2017.filter(function(killing, i) {
    return killing.highlight == "yes"
  }).sort(function(a, b) {
    return b.date - a.date;
  }).slice(0,5).map(function(recent, j) {
    if (recent.GuardianStoryURL !== "") {
      recent.isProfiled = true;
    } else {
      recent.isProfiled = false;
    }

    if (recent.note !== "") {
      recent.hasNote = true;
    } else {
      recent.hasNote = false;
    }

    if (recent.photo !== "") {
      recent.hasPhoto = true;
    } else {
      recent.hasPhoto = false;
    }

    if (recent.name !== "") {
      recent.hasName = true;
    } else {
      recent.hasName = false;
    }

    return recent;
  });

  let restVictims = data.Killings2017.filter(d => d.highlight !== "yes" || d.notes !=="").map(function(vct, i) {
  // let restVictims = data.Killings2017.filter(d => mostRecentVictims.indexOf(d) === -1 || d.hasNote===false).map(function(vct, i) {
    if (vct.GuardianStoryURL !== "")
      vct.isProfiled = true;
    else
      vct.isProfiled = false;
    return vct;
  });

  let profileVictims = data.Killings2017.filter(function(killing, i) {
    return killing.GuardianStoryURL !== ""
  });

  let featuredHTML = Mustache.render(featuredTemplate, {
    "people": mostRecentVictims,
  });

  let allVictimsHTML = Mustache.render(allVictimsTemplate, {
    "people": restVictims
  });

  document.querySelector("#featured-victim").innerHTML = featuredHTML;
  document.querySelector("#all-victims").innerHTML = allVictimsHTML;
  var listHeight = document.querySelector("#all-victims").offsetHeight;
  var allVictimsHeight = document.querySelector("#allVictimsPanel").offsetHeight;

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
  var stepHeight = stepWidth / 1.4 - stepMarginTop - stepMarginBottom + 50;
  var maxOffset = 250;


  // set the ranges
  var xScale = scalePoint().domain(months).range([stepMarginLeft, stepWidth]);
  var yScale = scaleLinear().domain([0, maxOffset]).range([stepHeight, stepMarginTop]);

  //sets up line
  var line2014 = line()
    .x(function(d) {
      return xScale(d.month);
    })
    .y(function(d) {
      return yScale(d.victims2014);
    })
    .curve(curveStepAfter);

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
    .attr("transform", "translate(" + stepMarginLeft + ",-20)");

  var killingsDataByYear = cumulativeKillings.slice();

  killingsPast.forEach(function(byYear) {
    killings2016.push(byYear.victims2016);
    killings2015.push(byYear.victims2015);
    killings2014.push(byYear.victims2014);
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
    .attr("text-anchor", "end")
    .attr("transform", "translate(20,-10)")
    .call(axisLeft(yScale)
      .ticks(5));

  //adds the y gridlines
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(-10,0)")
    .call(axisLeft(yScale)
      .ticks(5)
      .tickSize(-stepWidth)
      .tickFormat("")
    )

  //adds the killingsline
  svg.append("path")
    .data([killingsPast])
    .attr("class", "line2014")
    .attr("d", line2014);

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

  //add labels

  var translateWidth = document.getElementsByClassName("line2017")[0].getBBox().width;
  var labels2017 = svg.append("g")
    .attr("transform", function(line2017) {
      return "translate(" + (translateWidth) + "," + (yScale(killingsDataByYear[killingsDataByYear.length - 1].cumulative2017) - 40) + ")"
    });

  labels2017.append("rect")
    .attr("x", 0)
    .attr("y", -20)
    .attr("class", "bgLabel")
    .attr("width", 70)
    .attr("height", 70)
    .style("fill", "#e6e6e6")

  labels2017.append("text")
    .attr("x", 5)
    .attr("y", -20)
    .attr("class", "stepNumber")
    .attr("text-anchor", "start")
    .style("fill", "#66A998")
    .text(killingsDataByYear[killingsDataByYear.length - 1].cumulative2017);

  labels2017.append("text")
    .attr("x", 5)
    .attr("y", -4)
    .attr("class", "stepLabel")
    .attr("text-anchor", "start")
    .style("fill", "#66A998")
    .text("deaths");

  labels2017.append("text")
    .attr("x", 5)
    .attr("y", 12)
    .attr("class", "stepLabel")
    .attr("text-anchor", "start")
    .style("fill", "#66A998")
    .text("in 2017");

  svg.append("rect")
    .attr("class", "lineEnd")
    .attr("x", (translateWidth + 7))
    .attr("y", function(line2017) {
      return yScale(killingsDataByYear[killingsDataByYear.length - 1].cumulative2017 + 4)
    })
    .attr("width", 8)
    .attr("height", 8)
    .style("fill", "#66A998");

  //2016
  var labels2016 = svg.append("g")
    .attr("transform", function(line2016) {
      return "translate(" + (stepWidth + 10) + "," + (yScale(killings2016[killings2016.length - 1]) - 10) + ")"
    })


  labels2016.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("class", "stepNumber")
    .attr("text-anchor", "start")
    .style("fill", "#333")
    .text(killings2016[killings2016.length - 1]);

  labels2016.append("text")
    .attr("x", 0)
    .attr("y", 16)
    .attr("class", "stepLabel")
    .attr("text-anchor", "start")
    .style("fill", "#333")
    .text("in 2016");


  svg.append("rect")
    .attr("class", "lineEnd")
    .attr("x", (stepWidth - 4))
    .attr("y", function(line2015) {
      return yScale(killings2015[killings2015.length - 1])
    })
    .attr("width", 7)
    .attr("height", 7)
    .style("fill", "#9b9b9b");

  svg.append("rect")
    .attr("class", "lineEnd")
    .attr("x", (stepWidth - 4))
    .attr("y", function(line2016) {
      return yScale(killings2016[killings2016.length - 1])
    })
    .attr("width", 7)
    .attr("height", 7)
    .style("fill", "#333");

  //2015
  var labels2015 = svg.append("g")
    .attr("transform", function(line2015) {
      return "translate(" + (stepWidth + 10) + "," + (yScale(killings2015[killings2015.length - 1]) + 20) + ")"
    })


  labels2015.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("class", "stepNumber")
    .attr("text-anchor", "start")
    .style("fill", "#9b9b9b")
    .text(killings2015[killings2015.length - 1]);

  labels2015.append("text")
    .attr("x", 0)
    .attr("y", 16)
    .attr("class", "stepLabel")
    .attr("text-anchor", "start")
    .style("fill", "#9b9b9b")
    .text("in 2015");


    //2014
    var labels2014 = svg.append("g")
      .attr("transform", function(line2014) {
        return "translate(" + (stepWidth + 10) + "," + (yScale(killings2014[killings2014.length - 1])) + ")"
      })


    labels2014.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("class", "stepNumber")
      .attr("text-anchor", "start")
      .style("fill", "#c2c2c4")
      .text(killings2014[killings2014.length - 1]);

    labels2014.append("text")
      .attr("x", 0)
      .attr("y", 16)
      .attr("class", "stepLabel")
      .attr("text-anchor", "start")
      .style("fill", "#c2c2c4")
      .text("in 2014");


    svg.append("rect")
      .attr("class", "lineEnd")
      .attr("x", (stepWidth - 4))
      .attr("y", function(line2014) {
        return yScale(killings2014[killings2014.length - 1])
      })
      .attr("width", 7)
      .attr("height", 7)
      .style("fill", "#c2c2c4");

    svg.append("rect")
      .attr("class", "lineEnd")
      .attr("x", (stepWidth - 4))
      .attr("y", function(line2014) {
        return yScale(killings2014[killings2014.length - 1])
      })
      .attr("width", 7)
      .attr("height", 7)
      .style("fill", "c2c2c4");



    if ( document.body.clientWidth > 740) {
  drawMap(data);}
  else {
    drawTable(data);
  }

  expandList.addEventListener("click", function(d) {
    document.querySelector("#all-victims").style.height = "initial";
    document.querySelector(".gradient").style.display = "none";
  });

  var translateWidth = document.getElementsByClassName("line2017")[0].getBBox().width;

  svg.append("rect")
    .attr("class", "lineEnd")
    .attr("x", (stepWidth - 4))
    .attr("y", function(line2015) {
      return yScale(killings2015[killings2015.length - 1])
    })
    .attr("width", 7)
    .attr("height", 7)
    .style("fill", "#9b9b9b");

  svg.append("rect")
    .attr("class", "lineEnd")
    .attr("x", (stepWidth - 4))
    .attr("y", function(line2016) {
      return yScale(killings2016[killings2016.length - 1])
    })
    .attr("width", 7)
    .attr("height", 7)
    .style("fill", "#333");

  svg.append("rect")
    .attr("class", "lineEnd")
    .attr("x", (translateWidth + 7))
    .attr("y", function(line2017) {
      return yScale(killingsDataByYear[killingsDataByYear.length - 1].cumulative2017 + 4)
    })
    .attr("width", 8)
    .attr("height", 8)
    .style("fill", "#3faa9f");

  drawGreenSquares(total);
})

let drawTable = data => {
  let tableEl = document.querySelector("#g-map");

  let sortedData = mapData.sort((a,b) => {
    if(Number(a["all--count-per-country"]) > Number(b["all--count-per-country"])) {
      return -1;
    } else if (Number(a["all--count-per-country"]) < Number(b["all--count-per-country"])) {
      return 1
    } else {
      return 0;
    }
  });
  let tableHTML = Mustache.render(tableTemplate, {
    data: sortedData
  });

  tableEl.innerHTML = tableHTML;
}

let drawMap = (data) => {
  let mapEl = document.querySelector("#g-map")
  mapEl.classList.remove("mainCol");

  xr.get("<%= path %>/assets/world-50m.json").then((data) => {
    let world = data.data;

    var width = mapEl.clientWidth,
      height = width * (3.4 / 5);

    var countries = topojson.feature(world, world.objects.countries).features,
      neighbors = topojson.neighbors(world.objects.countries.geometries);

    var projection = geoPatterson()
      .fitSize([width, width], topojson.feature(world, world.objects.countries));
    // .scale(170)
    // .translate([width / 2, height / 2])
    // .precision(.1);

    var drawPath = geoPath()
      .projection(projection);

    var svg = select(mapEl).append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "g-world-map");

    var circleScale = scaleSqrt().domain([0, 50]).range([0, (width > 740) ? 40 : 30])


    svg.selectAll(".country")
      .data(countries)
      .enter().insert("path")
      .attr("class", "country")
      .attr("d", drawPath)
      .style("fill", "#f6f6f6")
      .style("stroke", "#dcdcdc");

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
      .attr("r", (d) => circleScale(d["all--count-per-country"]))
      .style("fill", "none")
      .style("stroke", "#66A998")
      .style("stroke-width", "2px")

    let keyCircles = svg.append("g").selectAll("circle")
      .data([40, 10])
      .enter().append("circle")
      .attr("class", "circle")
      .attr("cx", (d, i) => {
        return width - ((width > 740) ? 60 : 50);
      })
      .attr("cy", (d, i) => {
        if (i === 0) {
          return (width > 740) ? 282 : 282;
        } else {
          return (width > 740) ? 300 : 300;
        }
      })
      .attr("r", (d) => circleScale(d))
      .style("fill", "none")
      .style("stroke", "#ccc")
      .style("stroke-width", "2px")

    let keyLabels = svg.append("g").selectAll("text")
      .data([40, 10])
      .enter().append("text")
      .attr("class", "map-label")
      .attr("x", (d, i) => {
        return width - ((width > 740) ? 60 : 50);
      })
      .attr("y", (d, i) => {
        if (i === 0) {
          return (width > 740) ? 282 : 282;
        } else {
          return (width > 740) ? 300 : 300;
        }
      })
      .text((d) => d)
      .style("text-anchor", "middle")
      .attr("dy", (d) => {
        if (d === 40) {
          return -8;
        } else {
          return 4;
        }
      });

    svg.append("text")
      .attr("x", width - ((width > 740) ? 60 : 50))
      .attr("y", (width > 740) ? 240 : 240)
      .classed("map-label", true)
      .text("Deaths")
      .style("text-anchor", "middle")
      .style("font-weight", "normal");

    let topFive = mapData.sort((a, b) => b["all--count-per-country"] - a["all--count-per-country"]).slice(0, 5)

    let labels = svg.append("g").selectAll("text")
      .data(topFive)
      .enter().append("text")
      .attr("class", "map-country")
      .attr("x", (d) => {
        let xy = projection([d.location.lng, d.location.lat]);
        return xy[0];
      })
      .attr("y", (d) => {
        let xy = projection([d.location.lng, d.location.lat]);
        return xy[1];
      })
      .text((d) => d.country + " "+ d["all--count-per-country"])
      .attr("dy", "4")
      .attr("text-anchor", "middle")


    // add years

    let buttons = select(mapEl).append("div")
      .classed("map-years", true)
      .selectAll("span")
      .data(["All years", 2017, 2016, 2015])
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
      let topFive = (year !== "All years") ?

        mapData.sort((a, b) => b[year + "--count-per-country"] - a[year + "--count-per-country"]).slice(0, 5) :
        mapData.sort((a, b) => Number(b["all--count-per-country"]) - Number(a["all--count-per-country"])).slice(0, 5);

      labels.data(topFive)
        .attr("x", (d) => {
          let xy = projection([d.location.lng, d.location.lat]);
          return xy[0];
        })
        .attr("y", (d) => {
          let xy = projection([d.location.lng, d.location.lat]);
          return xy[1];
        })
        .text((d) => {if (year !== "All years") {return d.country + " "+ d[year + "--count-per-country"]} else {return d.country + " "+ d["all--count-per-country"]}});

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
          let count = (year !== "All years") ? d[year + "--count-per-country"] : d["all--count-per-country"];
          return circleScale(count);
        });
    }
    //hide victims panel on mobile
    d

  });

}

function drawGreenSquares(count) {
  if(document.body.clientWidth < 760) {
    return;
  }
  let containerEl = document.querySelector(".green-squares");
  let containerWidth = containerEl.clientWidth;
  let containerHeight = containerEl.clientHeight;

  let container = select(".green-squares")
    .append("svg")
    .attr("width", containerWidth)
    .attr("height", containerHeight);

  let area = containerHeight * containerWidth;

  let squareSideLength = Math.floor(Math.sqrt(area/count));

  let rowCount = containerHeight / squareSideLength;

  squareSideLength = containerHeight / Math.ceil(rowCount)
  let columnCount = containerWidth / squareSideLength;
  let counter = 0;

  for(let column = 0; column < columnCount; column++) {
    for(let row = 0; row < rowCount; row++) {
      if(counter < count) {
        let animationTiming = Math.random()*3000;
        if(animationTiming < 1500) {
          animationTiming = animationTiming*2;
        }
        container.append("rect")
          .attr("x", () => column*squareSideLength)
          .attr("y", () => row*squareSideLength)
          .attr("height", squareSideLength-1)
          .attr("width", squareSideLength-1)
          .style("opacity", 0)
            .transition()
            .delay(animationTiming)
            .duration(1000)
            .style("opacity", 1);

        counter++;
      }
    }

  }


}
