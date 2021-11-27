// @TODO: YOUR CODE HERE!
// Step 1: Set up our chart
//= ================================
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 120
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Step 2: Create an SVG wrapper,
// append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
// =================================
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
  .classed("chart", true);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.9,
      d3.max(data, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);
  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.9,
      d3.max(data, d => d[chosenYAxis]) * 1.1
    ])
    .range([height, 0]);
  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
  .duration(1000)
  .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("dx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]))
    .attr("dy", d => newYScale(d[chosenYAxis])+3.3);

  return circlesGroup;
}

// new texts
function renderXTexts(circlesGroupText, newXScale, chosenXAxis) {

  circlesGroupText.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[chosenXAxis]));

  return circlesGroupText;
}

function renderYTexts(circlesGroupText, newYScale, chosenYAxis) {

  circlesGroupText.transition()
    .duration(1000)
    .attr("dy", d => newYScale(d[chosenYAxis])+3.3);

  return circlesGroupText;
}

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xlabel;
  var ylabel;

  if (chosenXAxis === "poverty") {
    xlabel = "Poverty: ";
  }
  else if (chosenXAxis === "age") {
    xlabel = "Age: ";
  }
  else {
    xlabel = "Income: ";
  }

  if (chosenYAxis === "healthcare") {
    ylabel = "Healthcare: ";
  }
  else if (chosenYAxis === "smokes") {
    ylabel = "Smokes: ";
  }
  else {
    ylabel = "Obese: ";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}%`);
    });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Step 3:
// Import data from the data.csv file
// =================================
d3.csv("assets/data/data.csv").then(function(data) {
    // format data
    data.forEach(function(data) {
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.obesity = +data.obesity;
        data.income = +data.income;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);
    // yLinearScale function above csv import
    var yLinearScale = yScale(data, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g").attr("transform", `translate(0, ${height})`).call(bottomAxis);


    // append y axis
    var yAxis = chartGroup.append("g")
      .call(leftAxis);
      
    var circlesGroup = chartGroup.selectAll(null)
      .data(data)
      .enter()
      .append("g")

    var circlesGroupPosition = circlesGroup
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", "10")
      .classed("stateCircle", true);
    

    var circlesGroupText = circlesGroup
      .append("text")
      .text(d => d.abbr)
      .style("font-size", "9")
      .attr("dx", d => xLinearScale(d[chosenXAxis])-0.3)
      .attr("dy", d => yLinearScale(d[chosenYAxis])+3.3)
      .classed("stateText", true);

    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("class", "aText")
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 45)
      .attr("class", "aText")
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 70)
      .attr("class", "aText")
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");

    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
     .attr("transform", "rotate(-90)");  

    var healthcareLabel = ylabelsGroup.append("text")
      .attr("y", -40)
      .attr("x", 0 - (height / 2))
      .attr("class", "aText")
      .attr("value", "healthcare") // value to grab for event listener
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    var smokesLabel = ylabelsGroup.append("text")
      .attr("y", -70)
      .attr("x", 0 - (height / 2))
      .attr("class", "aText")
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smokes (%)");

    var obeseLabel = ylabelsGroup.append("text")
      .attr("y", -100)
      .attr("x", 0 - (height / 2))
      .attr("class", "aText")
      .attr("value", "obesity") // value to grab for event listener
      .classed("inactive", true)
      .text("Obese (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        // replaces chosenXAxis with value
        chosenXAxis = value;
        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);
        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);
        // updates circles with new x values
        circlesGroupPosition = renderXCircles(circlesGroupPosition, xLinearScale, chosenXAxis);
        // updates text with new x values
        circlesGroupText = renderXTexts(circlesGroupText, xLinearScale, chosenXAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "income") {
          incomeLabel
           .classed("active", true)
           .classed("inactive", false);
          ageLabel
           .classed("active", false)
           .classed("inactive", true);
          povertyLabel
           .classed("active", false)
           .classed("inactive", true);
        }
        else {
          povertyLabel
           .classed("active", true)
           .classed("inactive", false);
          ageLabel
           .classed("active", false)
           .classed("inactive", true);
          incomeLabel
           .classed("active", false)
           .classed("inactive", true);
        }
      }
    });

    // y axis labels event listener
    ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
        // replaces chosenYAxis with value
        chosenYAxis = value;
        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(data, chosenYAxis);
        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);
        // updates circles with new y values
        circlesGroupPosition = renderYCircles(circlesGroupPosition, yLinearScale, chosenYAxis);
        // updates text with new y values
        circlesGroupText = renderYTexts(circlesGroupText, yLinearScale, chosenYAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "smokes") {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "obesity") {
          obeseLabel
           .classed("active", true)
           .classed("inactive", false);
          smokesLabel
           .classed("active", false)
           .classed("inactive", true);
          healthcareLabel
           .classed("active", false)
           .classed("inactive", true);
        }
        else {
          healthcareLabel
           .classed("active", true)
           .classed("inactive", false);
          obeseLabel
           .classed("active", false)
           .classed("inactive", true);
          smokesLabel
           .classed("active", false)
           .classed("inactive", true);
        }
      }
    });
}).catch(function(error) {
    console.log(error);
});