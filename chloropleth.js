const w = 800;
const h = 600;

const canadaTopoJSON =
  "https://gistcdn.githack.com/montanaflynn/32f882ec77b0dd15bced6a28fad80028/raw/13f1fb4d257ca2f11dd441003ce578a46ec5097f/canada-provinces.topo.json";

const canadaDataJSON = "canada_data.json";

const canadaProjection = d3
  .geoAzimuthalEqualArea()
  .rotate([100, -45])
  .center([5, 20])
  .scale(w)
  .translate([w / 2, h / 2]);

const canadaPaths = d3.geoPath().projection(canadaProjection);

d3.select("body").append("div").attr("class", "container");

var targets = document.getElementsByClassName("container");
var spinner = new Spinner().spin(targets[0]);

function loaded(error, topo, data) {
  if (error) throw error;

  spinner.stop();

  const provinceGeo = topo.objects.provinces.geometries;

  provinceGeo.forEach(function (geo, i) {
    const provinceName = geo.properties.name;
    console.log(provinceName);
    if (provinceName in data.canada) {
      provinceGeo[i].properties.ratio = data.canada[provinceName].ratio;
      provinceGeo[i].properties.owner_with_children = data.canada[provinceName].owner_with_children;
      provinceGeo[i].properties.renter_with_children = data.canada[provinceName].renter_with_children;
    } else {
      provinceGeo[i].properties.ratio = 0;
    }
  });

  const values = d3
    .entries(topo.objects.provinces.geometries)
    .map(function (d) {
      return d.value.properties.ratio;
    });

  const minVal = 0;
  const maxVal = 3;

  const color = d3
    .scaleLinear()
    .domain([minVal, 1, maxVal])
    .range(["#eee", "#e0f3ff", "#0066ff"]);

  var tooltip = d3.select(".container").append("div").attr("class", "toolTip");

  const provinces = topojson.feature(topo, topo.objects.provinces);

  const svg = d3
    .select(".container")
    .append("svg")
    .attr("class", "canada")
    .attr("width", w)
    .attr("height", h)
    .append("g")
    .attr("class", "provinces")
    .selectAll("path")
    .data(provinces.features)
    .enter()
    .append("path")
    .attr("stroke", "#000")
    .attr("stroke-width", 0.5)
    .attr("fill", function (d, i) {
      return color(d.properties.ratio);
    })
    .attr("d", canadaPaths)
    .on("mouseover", function (d) {
      
      var chartdata = [
        {group: "Owners With Children", value: d.properties.owner_with_children},
        {group: "Renters With Children", value: d.properties.renter_with_children,}
      ];
      update(chartdata, d.properties.name);
      var currentState = this;
      d3.select(this).style("stroke-width", 1.5);
      tooltip
        .style("display", "inline-block")
        .html(
          "<b>" +
            d.properties.name +
            "</b><br/>Rent to own ratio: " +
            d.properties.ratio
        );
    })
    .on("mouseout", function (d) {
      d3.select(this).style("stroke-width", 0.5);
    });

  // add a legend
  var legendDimensions = {
    w: 600, // Adjusted width to accommodate the legend
    h: 80,
  };

  const legendPaddingLeft = 60; // Adjust this value as needed to provide sufficient padding

  d3.select(".container")
    .append("div")
    .attr("class", "legend-title")
    .style("text-align", "left")
    .style("margin-left", "calc(15%)") // Adjust the value to suit your layout
    .text("Rent to Own Ratio");

  var key = d3
    .select(".container")
    .append("svg")
    .attr("width", legendDimensions.w + legendPaddingLeft + 10) // Adjusted width to accommodate the legend and padding
    .attr("height", legendDimensions.h)
    .attr("class", "legend")
    .style("position", "relative"); // Ensure the legend container is positioned relatively

  key
    .append("text")
    .attr("class", "legend-title")
    .attr("x", legendPaddingLeft + legendDimensions.w / 2)
    .attr("y", 0) // Adjust the y position to move the title above the legend rectangle
    .style("text-anchor", "middle")
    .style("z-index", "999") // Set a higher z-index value
    .text("Rent to Own Ratio");

  var legend = key
    .append("defs")
    .append("svg:linearGradient")
    .attr("id", "gradient")
    .attr("y1", "100%")
    .attr("x1", "0%")
    .attr("y2", "100%")
    .attr("x2", "100%")
    .attr("spreadMethod", "pad");

  legend
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#0066ff") // Changed stop color to blue
    .attr("stop-opacity", 1);

  legend
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#eee")
    .attr("stop-opacity", 1);

  key
    .append("rect")
    .attr("width", legendDimensions.w)
    .attr("height", legendDimensions.h)
    .style("fill", "url(#gradient)")
    .attr("transform", "translate(" + legendPaddingLeft + ",10)");

  var x = d3
    .scaleLinear()
    .range([legendDimensions.w, 0])
    .domain([minVal, maxVal]);

  var yAxis = d3.axisBottom(x);

  key
    .append("g")
    .attr("class", "y_axis")
    .attr("transform", "translate(" + (legendPaddingLeft + 10) + ",10)")
    .call(yAxis);
}

d3.queue()
  .defer(d3.json, canadaTopoJSON)
  .defer(d3.json, canadaDataJSON)
  .await(loaded);
