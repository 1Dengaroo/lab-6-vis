"use strict";

export default function AreaChart(container) {
  // intialize brush event listener
  const listeners = { brushed: null };

  // set margins
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };
  const width = 800 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

  // initialization
  // SVG INIT ------------------
  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // initialize scales
  const xScale = d3.scaleTime().range([0, width]);
  const yScale = d3.scaleLinear().range([height, 0]);

  // create single path for area and assign class name
  const path = svg.append("path").attr("class", "area");

  // Create axis scales
  const xAxis = d3.axisBottom().scale(xScale);
  const yAxis = d3.axisLeft().scale(yScale);

  // Create axis containers
  const xGroup = svg
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0, ${height})`);

  const yGroup = svg.append("g").attr("class", "axis y-axis");

  // Create brush
  const brush = d3
    .brushX()
    .extent([
      [0, 0],
      [width, height],
    ])
    // set the brush extent and callbacks for "brush" and "end" events
    .on("brush", brushed)
    .on("end", brushed);

  // Add brush by calling it on SVG group
  svg.append("g").attr("class", "brush").call(brush);

  // Define event callbacks
  function brushed(event) {
    if (event.selection) {
      listeners["brushed"](event.selection.map(xScale.invert));
    }
  }

  function update(data) {
    // update scales, encodings, axes (use the total count)
    console.log("UPDATING: ");
    xScale.domain(d3.extent(data.map((d) => d.date)));
    yScale.domain([0, d3.max(data, (d) => d.total)]);

    // transition
    const t = svg.transition().duration(1000);

    // initalize area
    const area = d3
      .area()
      .x((d) => xScale(d.date)) // p = points
      .y0(yScale(0))
      .y1((d) => yScale(d.total));

    path.datum(data).attr("d", area).attr("fill", "steelblue");

    // update axes
    xGroup
      .transition(t)
      .call(xAxis)
      .attr("transform", `translate(0, ${height})`);

    yGroup.transition(t).call(yAxis);
  }

  function on(event, listener) {
    listeners[event] = listener;
  }

  return {
    update,
    on, // ES6 shorthand for "update": update
  };
}
