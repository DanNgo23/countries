/*
*    main.js
*    Mastering Data Visualization with D3.js
*    6.7 - Adding a jQuery UI slider
*/

var margin = { left:80, right:20, top:17, bottom:90 };
var height = 500 - margin.top - margin.bottom, 
    width = 990 - margin.left - margin.right;

var g = d3.select("#chart-area")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("class", "graph-svg-component")
    .append("g")
        .attr("transform", "translate(" + margin.left + 
            ", " + margin.top + ")");

var time = 0;
var interval;
var formattedData;
var color2 = '#FFF';

// Tooltip
var tip = d3.tip().attr('class', 'd3-tip')
    .html(function(d) {
        var text = "<strong>Country:</strong> <span style='color:yellow'>" + d.country + "</span><br>";
        text += "<strong>Continent:</strong> <span style='color:yellow;text-transform:capitalize'>" + d.continent + "</span><br>";
        text += "<strong>Life Expectancy:</strong> <span style='color:yellow'>" + d3.format(".2f")(d.life_exp) + "</span><br>";
        text += "<strong>GDP Per Capita:</strong> <span style='color:yellow'>" + d3.format("$,.0f")(d.income) + "</span><br>";
        text += "<strong>Population:</strong> <span style='color:yellow'>" + d3.format(",.0f")(d.population) + "</span><br>";
        return text;
    });
g.call(tip);

// Scales
var x = d3.scaleLog()
    .base(10)
    .range([0, width])
    .domain([142, 190000]);
var y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, 105]);
var area = d3.scaleLinear()
    .range([25*Math.PI, 1500*Math.PI])
    .domain([2000, 1400000000]);
var continentColor = d3.scaleOrdinal(d3.schemeCategory10);

// Labels
var xLabel = g.append("text")
    .attr("y", height + 70)
    .attr("x", width / 2)
    .attr("font-size", "30px")
    .attr("text-anchor", "middle")
    /* changed color */
    .attr("fill", color2)
    .text("GDP Per Capita ($)");
var yLabel = g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -58)
    .attr("x", -200)
    .attr("font-size", "30px")
    .attr("text-anchor", "middle")
    /*changed color */
    .attr("fill", color2)
    .text("Life Expectancy (Years)");
var timeLabel = g.append("text")
    //.attr("y", height -10)
    //.attr("x", width - 40)
    .attr("y", 350)
    .attr("x", 400)
    //.attr("font-size", "40px")
    .attr("font-size", "350px")
    .attr("opacity", "0.9")
    .attr("text-anchor", "middle")
    /* changed color */
    .attr("stroke", color2)
    .text("1800");

// X Axis
var xAxisCall = d3.axisBottom(x)
    //.tickValues([400, 4000, 40000])
    .tickValues([200, 500, 1000, 2000, 5000, 10000, 25000, 50000, 100000])
    .tickFormat(d3.format("$"));
g.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height +")")
    /* changed color */
    .attr("stroke", color2)
    .call(xAxisCall);

// Y Axis
var yAxisCall = d3.axisLeft(y)
    .tickFormat(function(d){ return +d; });
g.append("g")
    .attr("class", "y-axis")
    /* changed color */
    .attr("stroke", color2)
    .call(yAxisCall);

var continents = ["europe", "asia", "americas", "africa"];

var legend = g.append("g")
    .attr("transform", "translate(" + (width - 10) + 
        "," + (height - 125) + ")");

continents.forEach(function(continent, i){
    var legendRow = legend.append("g")
        .attr("transform", "translate(0, " + (i * 20) + ")");
    
    legendRow.append("rect")
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", continentColor(continent));
    
    legendRow.append("text")
        .attr("x", -10)
        .attr("y", 13)
        .attr("font-size", "18px")
        .attr("text-anchor", "end")
        .style("text-transform", "capitalize")
        /* changed color */
        .attr("fill", color2)
        .text(continent);
});

d3.json("data/data2.json").then(function(data){
    console.log(data);

    // Clean data
    formattedData = data.map(function(year){
        return year["countries"].filter(function(country){
            var dataExists = (country.income && country.life_exp);
            return dataExists;
        }).map(function(country){
            country.income = +country.income;
            country.life_exp = +country.life_exp;
            return country;            
        });
    });

    // First run of the visualization
    update(formattedData[0]);

});

$("#play-button")
    .on("click", function(){
        var button = $(this);
        if (button.text() == "Play"){
            button.text("Stop");
            interval = setInterval(step, 100);            
        }
        else {
            button.text("Play");
            clearInterval(interval);
        }
    });

$("#reset-button")
    .on("click", function(){
        time = 0;
        update(formattedData[0]);
    });

$("#continent-select")
    .on("change", function(){
        update(formattedData[time]);
    });

$("#date-slider").slider({
    /*max: 2014,*/
    max: 2040,
    min: 1800,
    step: 1,
    slide: function(event, ui){
        time = ui.value - 1800;
        update(formattedData[time]);
    }
});

function step(){
    // At the end of our data, loop back
    //time = (time < 214) ? time+1 : 0;
    time = (time < 240) ? time+1 : 0;
    update(formattedData[time]);
}

function update(data) {
    // Standard transition time for the visualization
    var t = d3.transition()
        .duration(100);

    var continent = $("#continent-select").val();

    var data = data.filter(function(d){
        if (continent == "all") { return true; }
        else {
            return d.continent == continent;
        }
    });

    // JOIN new data with old elements.
    var circles = g.selectAll("circle").data(data, function(d){
        return d.country;
    });

    // EXIT old elements not present in new data.
    circles.exit()
        .attr("class", "exit")
        .remove();

    // ENTER new elements present in new data.
    circles.enter()
        .append("circle")
        .attr("class", "enter")
        .attr("fill", function(d) { return continentColor(d.continent); })
        .attr("stroke", "black")
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .merge(circles)
        .transition(t)
            .attr("cy", function(d){ return y(d.life_exp); })
            .attr("cx", function(d){ return x(d.income) })
            //.attr("r", function(d){ return Math.sqrt(area(d.population) / Math.PI) });
            .attr("r", function(d){ return Math.pow(area(d.population) / (Math.PI), 0.62) });

    // Update the time label
    timeLabel.text(+(time + 1800));
    $("#year")[0].innerHTML = +(time + 1800);

    $("#date-slider").slider("value", +(time + 1800));
}