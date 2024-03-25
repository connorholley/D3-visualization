// rent_control.js

// Wrap the entire code in a function to avoid global scope pollution
(function () {
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

  // Append a container for the visualization
  const rentControlContainer = document.getElementById("rent-control-content");

  // Start spinner while loading data
  var spinner = new Spinner().spin(rentControlContainer);

  function loaded(error, topo, data) {
    if (error) throw error;

    spinner.stop();

    const provinceGeo = topo.objects.provinces.geometries;

    provinceGeo.forEach(function (geo, i) {
      const provinceName = geo.properties.name;
      if (provinceName in data.canada) {
        provinceGeo[i].properties.is_rent_controlled =
          data.canada[provinceName].is_rent_controlled;
      } else {
        provinceGeo[i].properties.is_rent_controlled = 0;
      }
    });

    const color = d3
      .scaleOrdinal()
      .domain([0, 1]) // Domain for the color scale
      .range(["#ffffff", "#333333"]); // Colors: white for 0, dark gray for 1

    var tooltip = d3
      .select(rentControlContainer)
      .append("div")
      .attr("class", "toolTip");

    const provinces = topojson.feature(topo, topo.objects.provinces);

    const svg = d3
      .select(rentControlContainer)
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
        return color(d.properties.is_rent_controlled);
      })
      .attr("d", canadaPaths)
      .on("mouseover", function (d) {
        var currentState = this;
        d3.select(this).style("stroke-width", 1.5);
        tooltip
          .style("display", "inline-block")
          .html(
            "<b>" +
              d.properties.name +
              "</b><br/>Rent control status: " +
              (d.properties.is_rent_controlled ? "Yes" : "No")
          );
      })
      .on("mouseout", function (d) {
        d3.select(this).style("stroke-width", 0.5);
      });

    // Append legend to the right of the map
    var legend = d3
      .select(rentControlContainer)
      .append("div")
      .attr("class", "legend")
      .style("position", "relative")
      .style("padding-top", "20px")
      .style("left", "20%"); // Adjust the percentage as needed

    // Append legend items
    const legendItems = legend
      .selectAll(".legend-item")
      .data([
        {
          label: "No Rent Protection",
          color: "#ffffff",
          border: "1px solid #000",
        },
        { label: "Rent Protection", color: "#333333" },
      ])
      .enter()
      .append("div")
      .attr("class", "legend-item")
      .style("margin-bottom", "10px"); // Adjust the margin-bottom value as needed

    legendItems
      .append("div")
      .style("background-color", (d) => d.color)
      .style("width", "20px")
      .style("height", "20px")
      .style("margin-right", "5px")
      .style("display", "inline-block")
      .style("border", (d) => d.border);

    legendItems
      .append("span")
      .style("vertical-align", "top") // Align text vertically
      .text((d) => d.label)
      .style("margin-right", "10px");

    // Display legend items side by side
    legendItems.style("display", "inline-block").style("margin-right", "20px");
  }

  d3.queue()
    .defer(d3.json, canadaTopoJSON)
    .defer(d3.json, canadaDataJSON)
    .await(loaded);
})();
