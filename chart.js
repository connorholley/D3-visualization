console.log("chart loaded");
// create 2 data_set
var data1 = [
  { group: "Owners With Children", value: 0 },
  { group: "Renters With Children", value: 0 },
];

// set the dimensions and margins of the graph
var margin = { top: 30, right: 30, bottom: 70, left: 60 },
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// X axis
var x = d3
  .scaleBand()
  .range([0, width])
  .domain(
    data1.map(function (d) {
      return d.group;
    })
  )
  .padding(0.2);
svg
  .append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

// Add Y axis
var y = d3.scaleLinear().domain([0, 1400000]).range([height, 0]);
svg.append("g").attr("class", "myYaxis").call(d3.axisLeft(y));

svg
  .append("text")
  .attr("class", "chart-title")
  .attr("x", width / 2)
  .attr("y", -margin.top / 2)
  .attr("text-anchor", "middle")
  .style("font-size", "16px")
  .text("Property Ownership Distribution");

// A function that create / update the plot for a given variable:
function update(data, name) {
  var u = svg.selectAll("rect").data(data);
  u.enter()
    .append("rect")
    .merge(u)
    .transition()
    .duration(1000)
    .attr("x", function (d) {
      return x(d.group);
    })
    .attr("y", function (d) {
      return y(d.value);
    })
    .attr("width", x.bandwidth())
    .attr("height", function (d) {
      return height - y(d.value);
    })
    .attr("fill", "#69b3a2");

  svg.select(".chart-title").text("Property Ownership Distribution of " + name);
}

// Initialize the plot with the first dataset
update(data1, "Canada");
