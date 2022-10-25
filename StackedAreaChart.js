"use strict";

export default function StackedAreaChart(container) {
  // initialization
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };
  const width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

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
  const cScale = d3.scaleOrdinal().range(d3.schemeTableau10);

  // Create axis scales
  const xAxis = d3.axisBottom().scale(xScale);
  const yAxis = d3.axisLeft().scale(yScale);

  // Create axis containers
  const xGroup = svg
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0, ${height})`);

  const yGroup = svg.append("g").attr("class", "axis y-axis");

  let selected = null,
    xDomain,
    data;

  // tooltips
  const tooltip = svg
    .append("text")
    .attr("x", 20)
    .attr("y", -14)
    .attr("font-size", 20);

  const clipPath = svg
    .append("clipPath")
    .attr("id", "chart-area")
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0);

  function update(_data) {
    data = _data;
    const keys = selected ? [selected] : data.columns.slice(1);
    const stack = d3
      .stack()
      .keys(keys)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const stackedData = stack(data);
    const t = svg.transition().duration(1000);

    // set domains of scales
    xScale.domain(xDomain ? xDomain : d3.extent(data, (d) => d.date));
    yScale.domain([0, d3.max(stackedData, (a) => d3.max(a, (d) => d[1]))]);
    cScale.domain(keys);

    // create area generator
    const area = d3
      .area()
      .x((d) => xScale(d.data.date))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]));

    // create areas based on stack
    const areas = svg.selectAll(".area").data(stackedData, (d) => d.key);

    areas
      .enter()
      .append("path")
      .attr("clip-path", "url(#chart-area)")
      .attr("class", "area")
      .attr("fill", (d) => cScale(d.key))
      .on("mouseover", (event, d) => tooltip.text(d.key))
      .on("mouseout", () => tooltip.text(""))
      .on("click", (event, d) => {
        if (selected === d.key) {
          selected = null;
        } else {
          selected = d.key;
        }

        update(data);
      })
      .merge(areas)
      .attr("d", area);

    areas.exit().remove();

    // update axes
    xGroup
      .transition(t)
      .call(xAxis)
      .attr("transform", `translate(0, ${height})`);

    yGroup.transition(t).call(yAxis);
  }

  function filterByDate(range) {
    xDomain = range; // -- (3)
    update(data); // -- (4)
  }

  return {
    update,
    filterByDate,
  };
}
