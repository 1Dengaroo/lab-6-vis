import AreaChart from "./AreaChart.js";
import StackedAreaChart from "./StackedAreaChart.js";

const path = "assets/unemployment.csv";

// fetch data and compute totals
async function fetchData(path) {
  return d3.csv(path, d3.autoType);
}

const data = await fetchData(path);

// add total to all entries of data prolly a terrible way to do so :(
data.map((d) => {
  let sum = 0;
  for (const [k, v] of Object.entries(d)) {
    if (k !== "date") sum += v;
  }
  d["total"] = sum;
});

const areaChart = AreaChart(".area-chart");
const stackedAreaChart = StackedAreaChart(".stacked-chart");

areaChart.update(data);
areaChart.on("brushed", (range) => {
  stackedAreaChart.filterByDate(range); // coordinating with stackedAreaChart
});
stackedAreaChart.update(data);
