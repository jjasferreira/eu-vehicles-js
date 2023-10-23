// Global variables
var gd_air, d_air;
var gd_gdp, d_gdp;
var gd_indexes, d_indexes;
var gd_population, d_population;
var gd_vehicles, d_vehicles;
var gd_geo, d_geo;

// Create a tooltip
var tooltip4;

var selected_countries = [];

const euCountriesMap = [
  'Austria',
  'Belgium',
  'Bulgaria',
  'Croatia',
  'Cyprus',
  'Czechia',
  'Denmark',
  'Estonia',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'Hungary',
  'Ireland',
  'Italy',
  'Latvia',
  'Lithuania',
  'Luxembourg',
  'Malta',
  'Netherlands',
  'Poland',
  'Portugal',
  'Romania',
  'Slovakia',
  'Slovenia',
  'Spain',
  'Sweden'
];

// Start the dashboard
function startDashboard() {

  loadData().then(() => {
    createIdiom4();
    createChoropleth();
    //createParallelSets();
    //createDotPlot();
    //createLineChart();
  });
}

async function loadData() {

  gd_air = await d3.csv("../data/eu-air-pollutants.csv");
  gd_gdp = await d3.csv("../data/eu-gdp.csv");
  gd_indexes = await d3.csv("../data/eu-indexes.csv");
  gd_population = await d3.csv("../data/eu-population.csv");
  gd_vehicles = await d3.csv("../data/eu-vehicles.csv");
  
  d_geo = await d3.json("../data/europe.json");
  gd_geo = topojson.feature(d_geo, d_geo.objects.europe);

  d_air = gd_air;
  d_gdp = gd_gdp;
  d_population = gd_population;
  d_vehicles = gd_vehicles.filter((d) => d.FUEL === "Electric" || d.FUEL === "Hybrid");
}

function createChoropleth() {
  // choropleth map in the idiom3 div container.
  const totalCountrySales = d3.group(gd_vehicles, (d) => d.COUNTRY);
  const selectedCountrySales = d3.group(d_vehicles, (d) => d.COUNTRY);

  // Initialize an empty object to store the aggregated data
  var currentData = {};

  totalCountrySales.forEach((sales, country) => {
    const totalSales = d3.sum(sales, (d) => +d.UNITS);
    const selectedSales = d3.sum(selectedCountrySales.get(country), (d) => +d.UNITS);
    currentData[country] = selectedSales / totalSales;
  });

  const container = d3.select("#idiom3");
  const width = container.node().clientWidth;
  const height = container.node().clientHeight - 1;
  //console.log(width, height);
  const svg = container
    .append("svg")
    .attr("width", width) // Set width to container width
    .attr("height", height); // Set height to container height


  // Create a group to hold the map
  const mapGroup = svg.append("g");
  
  // Declare a color scale for the choropleth map
  const colorScale = d3
    .scaleLog()
    .domain([
      d3.min(Object.values(currentData)),
      d3.max(Object.values(currentData)),
    ])  
    .range([0, 1]);

  const projection = d3
    .geoMercator()
    .fitSize([width, height], gd_geo);

  const path = d3.geoPath().projection(projection);

  // Add the map to the map group
  mapGroup
    .selectAll("country")
    .data(gd_geo.features)
    .enter()
    .append("path")
    .attr("class", "country data")
    .attr("d", path)
    .attr("stroke", "black")
    .on("mouseover", handleMouseOverChoropleth)
    .on("mouseout", handleMouseOutChoropleth)
    .on("click", handleClickChoropleth)
    .attr("stroke-width", 0.5)
    .append("title")
    .text((d) => d.properties.NAME);

  Object.keys(currentData).forEach(function(element) {
    //console.log(element);
    mapGroup
      .attr("fill", "lightgrey")
      .selectAll("path")
      .filter(function(d) { 
        return d.properties.NAME === element; 
      })
      .attr("fill", d3.interpolateBlues(colorScale(currentData[element])));
  });

  // Add the "deselect all" button
  const deselectButton = svg.append("g")
    .attr("class", "button")
    .attr("transform", `translate(${40}, ${30})`)
    .on("click", deselectAll);

  deselectButton.append("rect")
    .attr("width", 100)
    .attr("height", 20)
    .attr("rx", 5)
    .attr("ry", 5)
    .style("fill", "lightgrey")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .style("cursor", "pointer");

  deselectButton.append("text")
    .attr("x", 50)
    .attr("y", 14)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("fill", "black")
    .style("cursor", "pointer")
    .text("Deselect All");

  const zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .translateExtent([
      [0, 0],
      [width, height],
    ])
    .on("zoom", zoomed);

  svg.call(zoom);

  function zoomed(event) {
    mapGroup.attr("transform", event.transform);
  }

  // Add the legend
  const legendWidth = width * 0.8;
  const legendHeight = 20;
  const legendX = (width - legendWidth) / 2;
  const legendY = height - legendHeight - 30;

  const ratioValues = Object.values(currentData);
  const legendScale = d3.scaleOrdinal()
    .domain([d3.min(ratioValues), d3.max(ratioValues)])
    .range([d3.interpolateBlues(0), d3.interpolateBlues(0.2), d3.interpolateBlues(0.4), d3.interpolateBlues(0.6), d3.interpolateBlues(0.8), d3.interpolateBlues(1)]);
  // TODO não funciona
  const legendGroup = svg.append("g")
    .style('transform', `translate(${legendX}px, ${legendY}px)`)
    .call(
      d3.axisBottom(legendScale)
      .tickFormat(function(d) {
        console.log(d + ' position');
        return d + ' position';
      })
    );

  legendGroup.selectAll("rect")
    .data(legendScale.range())
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * legendWidth / 6)
    .attr("y", 0)
    .attr("width", legendWidth / 6)
    .attr("height", legendHeight)
    .style("fill", (d) => d)
    // add ticks
    .attr("stroke", "black")


  const legendAxis = d3.axisBottom(legendScale)
    .tickFormat(d3.format(".2f"))
    .tickSize(20)
    .tickPadding(10);

  legendGroup.append("g")
    .attr("transform", `translate(${legendWidth}, ${legendHeight})`)
    .call(legendAxis);

  legendGroup.append("text")
    .attr("x", legendWidth / 2)
    .attr("y", legendHeight + 25)
    .attr("text-anchor", "middle")
    .text("Ratio of selected Vehicle types sales to total");
}
  


// CUSTOM SCATTER PLOT
function createIdiom4() {

  const width = 420;
  const height = 420;

  // Create an SVG element to hold the scatter plot
  const svg = d3
    .select("#idiom4")
    .append("svg")
    .attr("width", width + 100)
    .attr("height", height + 100)
    .append("g")
    .attr("transform", "translate(40, 35)");

  // Values for the x axis scale
  const minX = d3.min(d_vehicles, (d) => {
    const air = d_air.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
    const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
    return (air.VALUE / pop.VALUE) * 1000;
  });
  const maxX = d3.max(d_vehicles, (d) => {
    const air = d_air.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
    const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
    return (air.VALUE / pop.VALUE) * 1000;
  });
  // Values for the y axis scale
  const countryYearGroup = d3.group(d_vehicles, (d) => d.COUNTRY, (d) => d.YEAR);
  const maxY = d3.max(countryYearGroup.entries(), ([country, countryData]) => {
    return d3.max(countryData.entries(), ([year, yearData]) => {
      const units = d3.sum(yearData, (d) => d.UNITS);
      const pop = d_population.find((d) => d.COUNTRY === country && d.YEAR === year);
      return (units / pop.VALUE) * 1000;
    });
  });
  // Values for the radius scale
  const minR = d3.min(d_vehicles, (d) => {
    const gdp = d_gdp.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
    const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
    return gdp.VALUE / pop.VALUE;
  });
  const maxR = d3.max(d_vehicles, (d) => {
    const gdp = d_gdp.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
    const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
    return gdp.VALUE / pop.VALUE;
  });

  // Create x, y and r scales for the scatter plot
  const xScale = d3
    .scaleLinear()
    .domain([minX, 17])
    .range([width, 0]);
  const yScale = d3
    .scaleLinear()
    .domain([0, 13])
    .range([height, 0]);
  const rScale = d3
    .scaleLinear()
    .domain([minR, maxR])
    .range([5, 15]);

  // Minimum year in years interval
  const minYear = d3.min(d_vehicles, (d) => d.YEAR);
  svg
    .selectAll(".circle-min")
    .data(d_population.filter((d) => d.YEAR === minYear), (d) => d.COUNTRY)
    .enter()
    .append("circle")
    .attr("class", "circle-min data")
    .attr("cx", (d) => {
      const air = d_air.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === minYear);
      const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === minYear);
      return xScale((air.VALUE / pop.VALUE) * 1000);
    })
    .attr("cy", (d) => {
      const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === d.COUNTRY && o.YEAR === minYear), (d) => d.UNITS);
      const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === minYear);
      return yScale((units / pop.VALUE) * 1000);
    })
    .attr("r", (d) => {
      const gdp = d_gdp.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === minYear);
      const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === minYear);
      return rScale(gdp.VALUE / pop.VALUE);
    })
    .attr("fill", "lightblue")
    .attr("stroke", "black")
    .on("mouseover", handleMouseOverIdiom4)
    .on("mouseout", handleMouseOutIdiom4)
    .on("click", handleClickIdiom4)
    .text((d) => d.COUNTRY);

  // Maximum year in years interval
  const maxYear = d3.max(d_vehicles, (d) => d.YEAR);
  svg
    .selectAll(".circle-max")
    .data(d_population.filter((d) => d.YEAR === maxYear), (d) => d.COUNTRY)
    .enter()
    .append("circle")
    .attr("class", "circle-max data")
    .attr("cx", (d) => {
      const air = d_air.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === maxYear);
      const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === maxYear);
      return xScale((air.VALUE / pop.VALUE) * 1000);
    })
    .attr("cy", (d) => {
      const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === d.COUNTRY && o.YEAR === maxYear), (d) => d.UNITS);
      const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === maxYear);
      return yScale((units / pop.VALUE) * 1000);
    })
    .attr("r", (d) => {
      const gdp = d_gdp.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === maxYear);
      const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === maxYear);
      return rScale(gdp.VALUE / pop.VALUE);
    })
    .attr("fill", "blue")
    .attr("stroke", "black")
    .on("mouseover", handleMouseOverIdiom4)
    .on("mouseout", handleMouseOutIdiom4)
    .on("click", handleClickIdiom4)
    .text((d) => d.COUNTRY);

  // Create lines to connect both circles min and max
  svg
    .selectAll(".line")
    .data(d_population.filter((d) => d.YEAR === maxYear), (d) => d.COUNTRY)
    .enter()
    .append("line")
    .attr("class", "line data")
    .attr("x1", (d) => {
      const air = d_air.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === minYear);
      const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === minYear);
      return xScale((air.VALUE / pop.VALUE) * 1000);
    })
    .attr("y1", (d) => {
      const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === d.COUNTRY && o.YEAR === minYear), (d) => d.UNITS);
      const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === minYear);
      return yScale((units / pop.VALUE) * 1000);
    })
    .attr("x2", (d) => {
      const air = d_air.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === maxYear);
      const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === maxYear);
      return xScale((air.VALUE / pop.VALUE) * 1000);
    })
    .attr("y2", (d) => {
      const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === d.COUNTRY && o.YEAR === maxYear), (d) => d.UNITS);
      const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === maxYear);
      return yScale((units / pop.VALUE) * 1000);
    })
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "5,5");
  
  // Create tick marks and labels for the x and y axes
  var xTicks = [], yTicks = [];
  for (let index = 0; index <= 1; index += 0.25) {
    xTicks.push(Math.round(xScale.invert(index * width)));
    yTicks.push(Math.round(yScale.invert(index * height)));
  }
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3
        .axisBottom(xScale)
        .tickFormat((d) => d)
        .tickValues(xTicks)
        .tickSizeOuter(0)
    );
  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${width},0)`)
    .call(
      d3
        .axisRight(yScale)
        .tickFormat((d) => d)
        .tickValues(yTicks)
        .tickSizeOuter(0)
    );
  
  // Add labels for the x and y axes
  svg
    .append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + 25)
    .style("text-anchor", "middle")
    .text("Air pollutants per capita (kg)");
  svg
    .append("text")
    .attr("class", "y-axis-label")
    .attr("x", 4*width/5)
    .attr("y", -13)
    .style("text-anchor", "middle")
    .text("All EV sold (per 1000 inhabitants)");
  
  // Create a tooltip
  tooltip4 = d3
    .select("#choropleth")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
}