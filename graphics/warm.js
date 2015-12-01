// Set the dimensions of the canvas / graph
var margin = {top: 10, right: 40, bottom: 30, left: 20},
   width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// Set the ranges
var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define the axes
var monthNames = [ "J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D" ];	

var xAxis = d3.svg.axis().scale(x)
    .orient("bottom")
	.ticks(12)
	.tickFormat(function(d) {return monthNames[d - 1]});

var yAxis = d3.svg.axis().scale(y)
    .orient("right")
	.ticks(5)
	.tickFormat(function(d) {return d + "°"});

// Define the line
var templine = d3.svg.line()
	.interpolate("cardinal")
    .x(function(d) { return x(d.Maand); })
    .y(function(d) { return y(d.T); });
    
// Adds the svg canvas
var svg = d3.select("#graph")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.csv("temperature2.csv", function(error, data) {
    data.forEach(function(d) {
		d.T = +d.T;
    });

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return +d.Maand; }));
	y.domain(d3.extent(data, function(d) { return +d.T; }));

    // Nest the data by year
    var dataNest = d3.nest()
        .key(function(d) {return d.Jaar;})
        .entries(data);
	
	// Loop through each symbol / key
    dataNest.forEach(function(d) {

        svg.append("path")
            .attr("class", "line")
            .attr("d", templine(d.values))
			.attr("id", "jaar" + d.key);

    });
	
	//Invisible thicker lines for hover and legend
	dataNest.forEach(function(d) {
        svg.append("path")
            .attr("class", "hoverline")
            .attr("d", templine(d.values))
			.attr("id", "hover" + d.key)
			.style("stroke-width", 2)
			.style("stroke", "#7c7c7C")
			.style("opacity", 0)
			.on("mouseover", function() { 
				d3.select(this).style("opacity", 1);
				var jaar  = d3.select(this).attr("id").substr(5,7);
				d3.select("#legend").text(jaar);
				})
			.on("mouseout", function() { 
				d3.select(this).style("opacity", 0);
				d3.select("#legend").text("");
			});
    });

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
		.attr("transform", "translate(" + width + ")")
        .call(yAxis);
	
	//Add stepbuttons
	for (i = 0; i < 9; i++) {
	var stepbutton = svg.append("g")
		.attr("class", "button")
		.attr("cursor", "pointer")
		.attr("id", "step" + (i + 1))
		.attr("onmouseup", "update" + i + "()");
	stepbutton.append("rect")
		.attr("x", i*22)
		.attr("y", 60)
		.attr("width", 20)
		.attr("height", 24)
		.style("fill", "#2c3b78");
	stepbutton.append("text")
		.attr("x", 7 + i*22)
		.attr("y", 76)
		.style("stroke", "#eeeeee")
		.style("stroke-width", 1)
		.text(i + 1);
	
	d3.select("#step9 text").text(">");
	d3.select("#step9").attr("onmouseup", "nextstep()");
		
	//First step is active
		d3.select('#step1').attr("class", "button active");
	}
	
	//Title
	var heading = svg.append("text")
		.attr("x", 0)
		.attr("y", 40)
		.attr("id", "heading");
	if (lang == "nl") {
		heading.text("Hoe België opwarmt");
	}
	else {
		heading.text("How Belgium's heating up");
	};
	
	//Updateable subtitle
	svg.append("text")
		.attr("x", 0)
		.attr("y", 120)
		.attr("id", "title")
		.text("");
	
	//Legend
	svg.append("text")
		.attr("x", 740)
		.attr("y", 100)
		.attr("id", "legend")
		.text("");
});
	
	
	//Updatefunctions
		var nextstep = function () {
			curstep = d3.select(".button.active").attr("id").substr(4,4);
			var updatefunction = "update" + curstep;
			
			//on last step, go back to begin
			if (curstep == 8) {
				window["update0"]();
			}
			else {
			window[updatefunction]();
			}
		}
	
		var xanim = d3.scale.linear().domain([0, 11]).range([0, width]);
		var yanim = d3.scale.linear().domain([-6.3, 23]).range([height,0]);
		var line = d3.svg.line()
		  .interpolate("cardinal")
		  .x(function(d,i) {return xanim(i);})
		  .y(function(d) {return yanim(d);})
	
	
	//Update function for 1-button
	update0 = function () {
		clear();
		d3.select("#avg").remove();
		
		d3.select(".button.active").attr("class", "button");
		d3.select("#step1").attr("class", "button active");
		d3.select("#title").text(anot[0].subtitle);
		d3.select("#text").html(anot[0].explanation);
		
	}
	
	//Update function for 2-button
	update1 = function () {
		
		//remove everything
		clear();
		d3.select("#avg").remove();
		
		var avgdata = [2.17,2.93,5.38,8.58,12.43,15.32,16.91,16.74,14.12,9.98,5.68,2.94];

		var path = svg.append("path")
		  .attr("d", line(avgdata))
		  .attr("id", "avg")
		  .style("stroke", "#000000")
		  .style("opacity", 0.8)
		  .style("stroke-width", 2)
		  .style("fill", "none");

		var totalLength = path.node().getTotalLength();

		path
		  .attr("stroke-dasharray", totalLength + " " + totalLength)
		  .attr("stroke-dashoffset", totalLength)
		  .transition()
			.duration(5000)
			.ease("linear")
			.attr("stroke-dashoffset", 0);
		
		d3.select(".button.active").attr("class", "button");
		d3.select("#step2").attr("class", "button active");
		d3.select("#title").text(anot[1].subtitle);
		d3.select("#text").html(anot[1].explanation);
		
		updatelegend("1833-2014", "#000000");
	}
	
	//Update function for 3-button
	update2 = function () {
		
		//remove everything
		clear();
		//set the stage
		d3.select("#avg").style({"stroke": "#000000", "stroke-width": 2});
		
		var data14 = [6.1,6.6,9.3,12.4,13.5,16.5,19.3,16.2,16.5,13.6,8.8,4.9];

		var path = svg.append("path")
		  .attr("d", line(data14))
		  .style("stroke", "#be1e1e")
		  .style("opacity", 0.8)
		  .style("stroke-width", 2)
		  .style("fill", "none")
		  .attr("id", "anim14");

		var totalLength = path.node().getTotalLength();

		path
		  .attr("stroke-dasharray", totalLength + " " + totalLength)
		  .attr("stroke-dashoffset", totalLength)
		  .transition()
			.duration(5000)
			.ease("linear")
			.attr("stroke-dashoffset", 0);
		d3.select(".button.active").attr("class", "button");
		d3.select("#step3").attr("class", "button active");
		d3.select("#title").text(anot[2].subtitle);
		d3.select("#text").html(anot[2].explanation);
		
		updatelegend("2014", "#be1e1e");
	}
	
	//Update function for 4-button
	update3 = function () {
		
		//remove everything
		clear();
		//set the stage
		d3.select("#avg").style({"stroke": "#000000", "stroke-width": 2});
		d3.select("#jaar2014").style("stroke", "#be1e1e")
								.style("stroke-width", 2)
								.style("opacity", 1);
		
		d3.selectAll("#jaar2013,#jaar2012,#jaar2011,#jaar2010,#jaar2009,#jaar2008,#jaar2007,#jaar2006,#jaar2005")
			.transition()
			.duration(2000)
			.style("stroke", "#be1e1e")
			.style("opacity", 0.8)
			.style("stroke-width", 1);
		
		updatelegend("2005-2014", "#be1e1e");
		
		d3.select(".button.active").attr("class", "button");
		d3.select("#step4").attr("class", "button active");
		d3.select("#title").text(anot[3].subtitle);
		d3.select("#text").html(anot[3].explanation);
	}
	
	//Update function for 5-button
		update4 = function() {
			
		//remove everything
		clear();
		//set the stage
		d3.select("#avg").style({"stroke": "#000000", "stroke-width": 2});
			
		var eighty = [2.93,3.06,5.96,8.31,12.37,15.57,17.54,17.41,14.61,10.62,6.52,3.42];
		var ninety = [2.91,2.70,6.67,9.25,13.76,15.61,18.19,17.52,14.31,10.87,6.13,4.82];
		var twok =   [3.32,4.96,7.06,9.84,13.91,16.47,18.05,18.99,14.95,11.11,6.70,3.61];
		var ten =    [3.82,3.78,6.83,11.03,13.79,16.78,18.85,17.57,15.54,12.07,7.56,4.07];

		var path = svg.append("path")
		  .attr("d", line(eighty))
		  .attr("id", "eighty")
		  .style("stroke", "#d32626")
		  .style("opacity", 0.8)
		  .style("stroke-width", 2)
		  .style("fill", "none")
		  .style("opacity", 0);
			
		var path = svg.append("path")
		  .attr("d", line(ninety))
		  .attr("id", "ninety")
		  .style("stroke", "#d32626")
		  .style("opacity", 0.8)
		  .style("stroke-width", 2)
		  .style("fill", "none")
		  .style("opacity", 0);
		
		var path = svg.append("path")
		  .attr("d", line(twok))
		  .attr("id", "twok")
		  .style("stroke", "#d32626")
		  .style("opacity", 0.8)
		  .style("stroke-width", 2)
		  .style("fill", "none")
		  .style("opacity", 0);
		
		var path = svg.append("path")
		  .attr("d", line(ten))
		  .attr("id", "ten")
		  .style("stroke", "#d32626")
		  .style("opacity", 0.8)
		  .style("stroke-width", 2)
		  .style("fill", "none")
		  .style("opacity", 0);
			
		var path = svg.append("path")
		  .attr("d", line(eighty))
		  .attr("id", "toupdate")
		  .style("stroke", "#be1e1e")
		  .style("opacity", 1)
		  .style("stroke-width", 2)
		  .style("fill", "none");
			
		d3.select("#legend").text("1975-1984").style("fill", "#be1e1e");
		
		//first animation, 80 -> 90
		d3.select("#toupdate").transition()
			.delay(2000)
			.duration(2000)
			.attr("d", line(ninety));
		d3.select("#eighty").transition().delay(2000).style("opacity", 0.5);
		d3.select("#legend").transition().delay(2000).text("1985-1994");
			
		//second animation, 90 -> 00
		d3.select("#toupdate").transition()
			.delay(6000)
			.duration(2000)
			.attr("d", line(twok));
		d3.select("#ninety").transition().delay(6000).style("opacity", 0.5);
		d3.select("#eighty").transition().delay(6000).style("opacity", 0.4);
		d3.select("#legend").transition().delay(6000).text("1995-2004");
			
		//third animation, 00 -> 10
		d3.select("#toupdate").transition()
			.delay(10000)
			.duration(2000)
			.attr("d", line(ten));
		d3.select("#twok").transition().delay(10000).style("opacity", 0.5);
		d3.select("#ninety").transition().delay(10000).style("opacity", 0.4);
		d3.select("#eighty").transition().delay(10000).style("opacity", 0.2);
		d3.select("#legend").transition().delay(10000).text("2005-2014");
			
		d3.select(".button.active").attr("class", "button");
		d3.select("#step5").attr("class", "button active");
		d3.select("#title").text(anot[4].subtitle);
		d3.select("#text").html(anot[4].explanation);
		
	};
	
	//Update function for 6-button
	update5 = function() {
		
		//remove everything
		clear();
		//set the stage
		d3.select("#avg").style({"stroke": "#000000", "stroke-width": 2});
	
		var maxrecvalues = [{"jaar": 2007, "temp": 7.2},
							{"jaar": 1990, "temp": 7.9},
							{"jaar": 1991, "temp": 9.5},
							{"jaar": 2007, "temp": 14.3},
							{"jaar": 2008, "temp": 16.4},
							{"jaar": 2003, "temp": 19.3},
							{"jaar": 2006, "temp": 23.0},
							{"jaar": 1997, "temp": 21.2},
							{"jaar": 2006, "temp": 18.4},
							{"jaar": 2001, "temp": 14.4},
							{"jaar": 1994, "temp": 10.4},
							{"jaar": 1934, "temp": 7.5}];
		
		var circlesmax = svg.selectAll("circle.max").data(maxrecvalues).enter().append("circle")
			.attr("cx",function(d,i) {return xanim(i);})
			.attr("cy", 0)
			.attr("r", 5)
			.attr("opacity", 0);
  			
		circlesmax.transition().duration(1000)
  			.attr("cx",function(d,i) {return xanim(i);})
  			.attr("cy",function(d) {return yanim(d.temp);})
			.attr("r", 5)
			.style({"opacity": 0.8, "fill": "#be1e1e", "stroke": "#be1e1e"});
		
		var jaarlabels = svg.selectAll(".jaarlabel").data(maxrecvalues).enter().append("text")
			.attr("x", function(d,i) {return xanim(i) - 16;})
			.attr("y", function(d) {return yanim(d.temp) + 18;})
			.style("font-size", 14)
			.style("opacity", 0)
			.attr("class", "yearlabel")
			.text(function(d) {return d.jaar;});
		
		var templabels = svg.selectAll(".templabel").data(maxrecvalues).enter().append("text")
			.attr("x", function(d,i) {return xanim(i) - 16;})
			.attr("y", function(d) {return yanim(d.temp) + 36;})
			.style("font-size", 14)
			.style("opacity", 0)
			.attr("class", "templabel")
			.text(function(d) { if (lang == "nl") {
					return (d.temp).toString().replace('.',',') + "°";
				}
				else {
					return d.temp + "°";
				}
				});
		console.log(lang);
		
		jaarlabels.transition().duration(4000)
			.style("opacity", 1);
		templabels.transition().duration(4000)
			.style("opacity", 1);
		
		updatelegend("", "#000000");
		
		d3.select(".button.active").attr("class", "button");
		d3.select("#step6").attr("class", "button active");
		d3.select("#title").text(anot[5].subtitle);
		d3.select("#text").html(anot[5].explanation);

	
	};
	
	//Update function for 7-button
	update6 = function() {
		
		//remove everything
		clear();
		//set the stage
		d3.select("#avg").style({"stroke": "#000000", "stroke-width": 2});
	
		var minrecvalues = [{"jaar": 1838, "temp": -6.3},
							{"jaar": 1956, "temp": -6.1},
							{"jaar": 1845, "temp": -1.6},
							{"jaar": 1837, "temp": 4.3},
							{"jaar": 1902, "temp": 8.5},
							{"jaar": 1923, "temp": 11.5},
							{"jaar": 1841, "temp": 13.4},
							{"jaar": 1833, "temp": 13.6},
							{"jaar": 1912, "temp": 10.7},
							{"jaar": 1881, "temp": 5.7},
							{"jaar": 1858, "temp": 0.9},
							{"jaar": 1879, "temp": -5.6}];
		
		var circlesmin = svg.selectAll("circle.min").data(minrecvalues).enter().append("circle")
			.attr("cx",function(d,i) {return xanim(i);})
			.attr("cy", height)
			.attr("r", 5)
			.attr("opacity", 0);
  			
		circlesmin.transition().duration(1000)
  			.attr("cx",function(d,i) {return xanim(i);})
  			.attr("cy",function(d) {return yanim(d.temp);})
			.attr("r", 5)
			.style({"opacity": 0.8, "fill": "#be1e1e", "stroke": "#be1e1e"});
		
		var jaarlabels = svg.selectAll(".jaarlabel").data(minrecvalues).enter().append("text")
			.attr("x", function(d,i) {return xanim(i) - 16;})
			.attr("y", function(d) {return yanim(d.temp) - 18;})
			.style("font-size", 14)
			.style("opacity", 0)
			.attr("class", "yearlabel")
			.text(function(d) {return d.jaar;});
		
		var templabels = svg.selectAll(".templabel").data(minrecvalues).enter().append("text")
			.attr("x", function(d,i) {return xanim(i) - 16;})
			.attr("y", function(d) {return yanim(d.temp) - 36;})
			.style("font-size", 14)
			.style("opacity", 0)
			.attr("class", "templabel")
			.text(function(d) {return (d.temp).toString().replace('.',',') + "°";});
		
		jaarlabels.transition().duration(4000)
			.style("opacity", 1);
		templabels.transition().duration(4000)
			.style("opacity", 1);
		
		updatelegend("", "#000000");
		
		d3.select(".button.active").attr("class", "button");
		d3.select("#step7").attr("class", "button active");
		d3.select("#title").text(anot[6].subtitle);
		d3.select("#text").html(anot[6].explanation);
	
	};
	
	//Update function for 8 button
	update7 = function () {
		
		clear();
		d3.select("#avg").style({"stroke": "#000000", "stroke-width": 2});
		
		
		var maxrecvalues = [7.2,7.9,9.5,14.3,16.4,19.3,23.00,21.2,18.4,14.4,10.4,7.5];
		var avgdata = [2.17,2.93,5.38,8.58,12.43,15.32,16.91,16.74,14.12,9.98,5.68,2.94];
		
		var data15 = d3.range(12);
		for (i = 0; i < 12; i++) {
			data15[i] = avgdata[i] + Math.random()*(maxrecvalues[i] - avgdata[i]);
		};
		
		var path = svg.append("path")
		  .attr("d", line(data15))
		  .attr("id", "jaar15")
		  .style("stroke", "#be1e1e")
		  .style("opacity", 0.8)
		  .style("stroke-width", 2)
		  .style("fill", "none");

		var totalLength = path.node().getTotalLength();

		path
		  .attr("stroke-dasharray", totalLength + " " + totalLength)
		  .attr("stroke-dashoffset", totalLength)
		  .transition()
			.duration(4000)
			.ease("linear")
			.attr("stroke-dashoffset", 0);
		
		d3.select("#legend").text("2015").style("fill", "#be1e1e");
		
		setTimeout(function() {setInterval(function () {animate ()}, 2000)},4500);
		
		function animate () {
			for (i = 0; i < 11; i++) {
				data15[i] = avgdata[i] + Math.random()*(maxrecvalues[i] - avgdata[i]);
			};
			
			d3.select("#jaar15").transition().duration(2000)
				.attr("d", line(data15));
		};
		
		updatelegend("2015?", "#be1e1e");
		
		d3.select(".button.active").attr("class", "button");
		d3.select("#step8").attr("class", "button active");
		d3.select("#title").text(anot[7].subtitle);
		d3.select("#text").html(anot[7].explanation);
		d3.select("#step9 text").text("<");
	}
	
	//Function to clear canvas
	function clear() {
		d3.selectAll("path").style({"stroke": "#cccccc", "stroke-width": 1});
		d3.selectAll(".hoverline").style({"stroke": "#7c7c7C", "stroke-width": 2, "opacity": 0});
		d3.selectAll(".axis path,.axis line").style("stroke-width", 0);
		d3.select("#eighty").remove();
		d3.select("#ninety").remove();
		d3.select("#twok").remove();
		d3.select("#ten").remove();
		d3.select("#toupdate").remove();
		d3.select("#anim14").remove();
		d3.select("#jaar15").remove();
		d3.selectAll("circle").remove();
		d3.selectAll(".yearlabel,.templabel").remove();
		d3.select("#step9 text").text(">");
		d3.select("#legend").text("");
	}
	
	//Function to update legend
	function updatelegend(defaultlegend, color) {
		var legend = defaultlegend;
		var legendcolor = color;
		d3.select("#legend").text(legend).style("fill", legendcolor);
		d3.selectAll(".hoverline").on("mouseover", function() {
			d3.select("#legend").text(legend).style("fill", "#7c7c7c");
			d3.select(this).style("opacity", 1);
			var jaar  = d3.select(this).attr("id").substr(5,7);
			d3.select("#legend").text(jaar);
		});
		d3.selectAll(".hoverline").on("mouseout", function() {
			d3.select("#legend").text(legend).style("fill", legendcolor);
			d3.select(this).style("opacity", 0);
		});
	}