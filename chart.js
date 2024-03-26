const chart = {
    const height = Math.min(500, width / 2);
    const outerRadius = height / 2 - 10;
    const innerRadius = outerRadius * 0.75;
    const tau = 2 * Math.PI;
    const color = d3.scaleOrdinal(d3.schemeObservable10);
  
    const svg = d3.create("svg")
        .attr("viewBox", [-width/2, -height/2, width, height]);
  
    const arc = d3.arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius);
  
    const pie = d3.pie().sort(null).value((d) => d["apples"]);
    
    const path = svg.datum(data).selectAll("path")
        .data(pie)
      .join("path")
        .attr("fill", (d, i) => color(i))
        .attr("d", arc)
        .each(function(d) { this._current = d; }); // store the initial angles
  
    function change(value) {
      pie.value((d) => d[value]); // change the value function
      path.data(pie); // compute the new angles
      path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
    }
  
    // Store the displayed angles in _current.
    // Then, interpolate from _current to the new angles.
    // During the transition, _current is updated in-place by d3.interpolate.
    function arcTween(a) {
      const i = d3.interpolate(this._current, a);
      this._current = i(0);
      return (t) => arc(i(t));
    }
  
    // Return the svg node to be displayed.
    return Object.assign(svg.node(), {change});
    
  };