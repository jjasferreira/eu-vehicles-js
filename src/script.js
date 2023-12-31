

// Global variables
var gd_air, d_air;
var gd_gdp, d_gdp;
var gd_indexes, d_indexes;
var gd_population, d_population;
var gd_vehicles, d_vehicles;
var gd_geo, d_geo;



// Create tooltips
var tooltip1;
var tooltip3;
var tooltip4;
var tooltip5;

var minYear = '2014';
var maxYear = '2022';

var selected_countries = [];

var deactivatedIndexes = [];

var selectedIndex = ""

const all_countries = [ 'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden'];

// Start the dashboard
function startDashboard() {

  loadData().then(() => {
    createChoropleth();
    createDotPlot();
    createLineChart();
    create4();
    create5();
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

function createLineChart() {
  var selectedYearlySales = [];

  // Loop through the data to calculate the total sales for each year
  d_vehicles.forEach(function(d) {
    var year = parseInt(d.YEAR);
    var units = +d.UNITS; // Convert units to a number
    var yearEntry = selectedYearlySales.find(entry => entry.YEAR === year);

    if (yearEntry) {
      yearEntry.UNITS += units; // Add to existing total
    } else {
      selectedYearlySales.push({ YEAR: year, UNITS: units }); // Initialize if it doesn't exist
    }
  });
  
  // Set up dimensions and margins
  const height = d3.select("#idiom1").node().getBoundingClientRect().height;
  const width = d3.select("#idiom1").node().getBoundingClientRect().width;
  const margin = {top: 20, right: 20, bottom: 25, left: 60};

  // Create SVG container
  const svg = d3.select("#idiom1")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`); 

  // Initialize scales and axes
  const xScale = d3
    .scalePoint()
    .domain(selectedYearlySales.map(d => d.YEAR)) // Use map to extract years from the array of objects
    .range([0, width - margin.left - margin.right])
    .padding(0.1);
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(selectedYearlySales, d => d.UNITS)]) // Use the maximum UNITS value
    .range([height - margin.top - margin.bottom, 0]);
  const xAxis = d3.axisBottom(xScale).ticks(9);
  const yAxis = d3.axisLeft(yScale).ticks(5);
  // Append axes
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - margin.top - margin.bottom})`) 
    .call(xAxis);
  svg.append("g")
    .attr("class", "y-axis")
    .call(yAxis);
    
  // Initialize line generator
  const line = d3.line()
    .x((d) => xScale(d.YEAR))
    .y((d) => yScale(d.UNITS));

  // Append path element
  svg
    .append("path")
    .attr("class", "line")
    .datum(selectedYearlySales)
    .attr("class", "line")
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "#CC9E21")
    .attr("stroke-width", 2);

  // Append circles
  svg
    .selectAll(".circle")
    .data(selectedYearlySales)
    .enter()
    .append("circle")
    .attr("class", "circle data")
    .attr("cx", (d) => xScale(d.YEAR))
    .attr("cy", (d) => yScale(d.UNITS))
    .attr("r", 5)
    .attr("fill", "#CC9E21")
    .attr("stroke", "black")
    .on("mouseover", handleMouseOverLineChart)
    .on("mouseout", handleMouseOutLineChart)
    .append("title")
    .attr("year", (d) => d.YEAR);

  // Initialize the selected range
  var selectedRange = [parseInt(minYear), parseInt(maxYear)];

  console.log(selectedRange[1]);

  // Set up the width and height of the sliders
  const sliderWidth = 2;
  const sliderHeight = height - margin.top - margin.bottom;

  // Create the sliders
  const leftSlider = svg
    .append("rect")
    .attr("x", xScale(selectedRange[0]) - sliderWidth / 2)
    .attr("y", 0)
    .attr("width", sliderWidth)
    .attr("height", sliderHeight)
    .attr("fill", "#CC6521")
    .call(
      d3
      .drag()
      .on("start", dragstarted)
      .on("drag", draggedLeft)
      .on("end", dragended)
      );
  const rightSlider = svg
    .append("rect")
    .attr("x", xScale(selectedRange[1]) - sliderWidth / 2)
    .attr("y", 0)
    .attr("width", sliderWidth)
    .attr("height", sliderHeight)
    .attr("fill", "#663210")
    .call(
      d3
      .drag()
      .on("start", dragstarted)
      .on("drag", draggedRight)
      .on("end", dragended)
      );

  const handleLeft = svg
    .append("rect")
    .attr("height", 30)
    .attr("width", 12)
    .attr("x", xScale(selectedRange[0]) - 6)
    .attr("y", sliderHeight / 2 - 15) // Vertically center the handle
    .attr("rx", 5)
    .attr("fill", "#CC6521")
    .attr("stroke", "black")
    .style("cursor", "pointer")
    .call(
      d3.drag()
        .on("start", dragstarted)
        .on("drag", draggedLeft)
        .on("end", dragended)
    );
  
  const handleRight = svg
    .append("rect")
    .attr("height", 30)
    .attr("width", 12)
    .attr("x", xScale(selectedRange[1]) - 6) // Initial position of the handle
    .attr("y", sliderHeight / 2 - 15) // Vertically center the handle
    .attr("rx", 5)
    .attr("fill", "#663210")
    .attr("stroke", "black")
    .style("cursor", "pointer")
    .call(
      d3.drag()
        .on("start", dragstarted)
        .on("drag", draggedRight)
        .on("end", dragended)
    );

  // Define the drag behavior for sliders
  function dragstarted(event, d) {
    d3.select(this).raise().classed("active", true);
  }

  function draggedLeft(event, d) {
    let x = event.x;
    x = Math.max(0, Math.min(x, xScale(selectedRange[1]) - sliderWidth));
    const newMinYear = Math.min(getClosestYear(x), selectedRange[1]);
    selectedRange[0] = newMinYear;
    //minYear = newMinYear;
    handleLeft.attr("x", xScale(newMinYear) - 6);
    leftSlider.attr("x", xScale(newMinYear) - sliderWidth / 2);
  }

  function draggedRight(event, d) {
    let x = event.x;
    x = Math.max(xScale(selectedRange[0]) + sliderWidth, Math.min(x, width - sliderWidth));
    const newMaxYear = Math.max(getClosestYear(x), selectedRange[0]);
    selectedRange[1] = newMaxYear;
    //maxYear = newMaxYear;
    handleRight.attr("x", xScale(newMaxYear) - 6);
    rightSlider.attr("x", xScale(newMaxYear) - sliderWidth / 2);
  }

  function getClosestYear(x) {
    // go from 2014 to 2022 and return the value of xScale that is closest to x
    let closestYear = 2014;
    let minDistance = 100000;
    for (let i = 2014; i <= 2022; i++) {
      if (Math.abs(xScale(i) - x) < minDistance) {
        minDistance = Math.abs(xScale(i) - x);
        closestYear = i;
      }
    }
    return closestYear;
  }

  function dragended(event, d) {
    d3.select(this).classed("active", false);
    minYear = selectedRange[0].toString();
    maxYear = selectedRange[1].toString();
    updateChoropleth();
    updateDotPlot();
    update4();
    update5();
  }

    // Add title 
  svg.append("text")
  .attr("x", width/2 - 50)
  .attr("y", 0 - (margin.top/2) + 12)
  .attr("text-anchor", "middle") 
  .text("Total selected vehicles sales")
  .attr("font-weight", "500");

  // Tooltip
  {  
    tooltip1 = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("display", "block")
      .style("opacity", 0);
  }
  
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
    .scaleLinear()
    .domain([
      d3.min(Object.values(currentData)),
      d3.max(Object.values(currentData)),
    ])  
    .range([0, 1]);

  const projection = d3
    .geoMercator()
    .fitSize([width, height], gd_geo)
    // tilt the map
    .rotate([6, 4, -3])

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
      .attr("fill", d3.interpolateBlues(colorScale(currentData[element])))
      .attr("data", currentData[element]);
  });

  // "Deselect all" button
  {
    const deselectButton = svg.append("g")
      .attr("class", "button")
      .attr("transform", `translate(${17.5}, ${93})`)
      .on("click", deselectAll);

    deselectButton.append("rect")
      .attr("width", 100)
      .attr("height", 20)
      .attr("rx", 5)
      .attr("ry", 5)
      .style("fill", "lightgrey")
      .style("stroke", "black")
      .style("cursor", "pointer");
    deselectButton.append("text")
      .attr("x", 50)
      .attr("y", 14)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .style("fill", "black")
      .style("cursor", "pointer")
      .text("Deselect all");
  }
  // Zoom
  {  
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
  }
  // Legend
  {
    let max = d3.max(Object.values(currentData));
    let min = d3.min(Object.values(currentData));
    let l = Legend(d3.scaleSequential([min, max], d3.interpolateBlues), {
      height: 90,
      marginTop: 55,
      width: 200,
      marginLeft: 17,
      ticks: 5,
      tickFormat: "%",
    });
    svg
      .append(() => l);
  }
  // Tooltip
  {  
    tooltip3 = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("display", "block")
      .style("opacity", 0);

    // Add a rectangle behind the tooltip text
    tooltip3.append("div")
      .attr("class", "tooltip-rect")
      .style("background-color", "white")
      .style("padding", "5px")
  }
  // Title on top of map
  {
    svg.append("text")
      .attr("x", 15)
      .attr("y", 25)
      .text("Ratio of selected vehicles sales")
      .attr("font-weight", "500");
    svg.append("text")
      .attr("x", 15)
      .attr("y", 42.5)
      .text("to total vehicles sales")
      .attr("font-weight", "500");
  }
}

function create4() {

  const h = d3.select("#idiom4").node().getBoundingClientRect().height;
  const w = d3.select("#idiom4").node().getBoundingClientRect().width;
  const height = h - 25;
  const width = w - 25;

  // Create an SVG element to hold the scatter plot
  const svg = d3
    .select("#idiom4")
    .append("svg")
    .attr("height", h)
    .attr("width", w)
    .attr("minYear", minYear)
    .attr("maxYear", maxYear)
    .append("g");
  
  // Create Lines gradient
  svg.append("defs") // Linear color gradient
    .append("linearGradient")
    .attr("id", "line-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%")
    .selectAll("stop")
    .data([{offset: "0%", color: "#CC6521"}, {offset: "100%", color: "#663210"}])
    .enter()
    .append("stop")
    .attr("offset", (d) => d.offset)
    .attr("stop-color", (d) => d.color);
  
  // Tooltip
  tooltip4 = d3
    .select("#idiom4")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Values for axes scales
  const maxX = d3.max(d_vehicles, (d) => {
    const air = d_air.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
    const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
    return (air.VALUE / pop.VALUE) * 1000;
  });
  const countryYearGroup = d3.group(d_vehicles, (d) => d.COUNTRY, (d) => d.YEAR);
  const maxY = d3.max(countryYearGroup.entries(), ([country, countryData]) => {
    return d3.max(countryData.entries(), ([year, yearData]) => {
        const units = d3.sum(yearData, (d) => d.UNITS);
        const pop = d_population.find((d) => d.COUNTRY === country && d.YEAR === year);
        return (units / pop.VALUE) * 1000;
    });
  });
  const minR = d3.min(d_vehicles, (d) => {
    const gdp = d_gdp.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
    const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
    return (gdp.VALUE / pop.VALUE) * 1000;
  });
  const maxR = d3.max(d_vehicles, (d) => {
    const gdp = d_gdp.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
    const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
    return (gdp.VALUE / pop.VALUE) * 1000;
  });
  // Create x, y and r scales for the scatter plot
  const xScale = d3
    .scaleLinear()
    .domain([0, maxX*1.05])
    .range([width-12.5, 25]);
  const yScale = d3
    .scaleLinear()
    .domain([0, maxY*1.05])
    .range([height-12.5, 25]);
  const rScale = d3
    .scaleRadial()
    .domain([minR, maxR])
    .range([5, 15]);

  // Lines connecting Circles
  {
    svg.selectAll(".line")
      .data(all_countries)
      .enter()
      .append("line")
      .attr("class", "line data")
      .attr("stroke", "url(#line-gradient)")
      .attr("stroke-width", "3")
      .attr("opacity", "0.65")
      .attr("country", (c) => c)
      .attr("x1", (c) => {
        const air = d_air.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        return xScale((air.VALUE / pop.VALUE) * 1000);
      })
      .attr("y1", (c) => {
        const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === c && o.YEAR === minYear), (d) => d.UNITS);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        return yScale((units / pop.VALUE) * 1000);
      })
      .attr("x2", (c) => {
        const air = d_air.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        return xScale((air.VALUE / pop.VALUE) * 1000);
      })
      .attr("y2", (c) => {
        const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === c && o.YEAR === maxYear), (d) => d.UNITS);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        return yScale((units / pop.VALUE) * 1000);
      });
  }
  // Circles for Min Year
  {
    svg
      .selectAll(".circle-min")
      .data(all_countries)
      .enter()
      .append("circle")
      .attr("class", "circle-min data")
      .attr("fill", "#CC6521")
      .attr("stroke", "black")
      .attr("stroke-width", "1")
      .attr("country", (c) => c)
      .on("mouseover", handleMouseOver4)
      .on("mouseout", handleMouseOut4)
      .on("click", handleClick4)
      .attr("x-data", (c) => {
        const air = d_air.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        return ((air.VALUE / pop.VALUE) * 1000).toFixed(1);
      })
      .attr("cx", (c) => {
        const air = d_air.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        return xScale((air.VALUE / pop.VALUE) * 1000);
      })
      .attr("y-data", (c) => {
        const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === c && o.YEAR === minYear), (d) => d.UNITS);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        return ((units / pop.VALUE) * 1000).toFixed(1);
      })
      .attr("cy", (c) => {
        const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === c && o.YEAR === minYear), (d) => d.UNITS);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        return yScale((units / pop.VALUE) * 1000);
      })
      .attr("r-data", (c) => {
        const gdp = d_gdp.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        return ((gdp.VALUE / pop.VALUE) * 1000).toFixed(1);
      })
      .attr("r", (c) => {
        const gdp = d_gdp.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        return rScale((gdp.VALUE / pop.VALUE) * 1000);
      });
  }
  // Circles for Max Year
  {
    svg
      .selectAll(".circle-max")
      .data(all_countries)
      .enter()
      .append("circle")
      .attr("class", "circle-max data")
      .attr("fill", "#663210")
      .attr("stroke", "black")
      .attr("stroke-width", "1")
      .attr("country", (c) => c)
      .on("mouseover", handleMouseOver4)
      .on("mouseout", handleMouseOut4)
      .on("click", handleClick4)
      .attr("tooltip-data", (c) => {
        const air = d_air.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === c && o.YEAR === maxYear), (d) => d.UNITS);
        const gdp = d_gdp.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        return [{"x": (air.VALUE / pop.VALUE) * 1000, "y": (units / pop.VALUE) * 1000, "r": (gdp.VALUE / pop.VALUE) * 1000}]
      })
      .attr("x-data", (c) => {
        const air = d_air.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        return ((air.VALUE / pop.VALUE) * 1000).toFixed(1);
      })
      .attr("cx", (c) => {
        const air = d_air.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        return xScale((air.VALUE / pop.VALUE) * 1000);
      })
      .attr("y-data", (c) => {
        const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === c && o.YEAR === maxYear), (d) => d.UNITS);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        return ((units / pop.VALUE) * 1000).toFixed(1);
      })
      .attr("cy", (c) => {
        const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === c && o.YEAR === maxYear), (d) => d.UNITS);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        return yScale((units / pop.VALUE) * 1000);
      })
      .attr("r-data", (c) => {
        const gdp = d_gdp.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        return ((gdp.VALUE / pop.VALUE) * 1000).toFixed(1);
      })
      .attr("r", (c) => {
        const gdp = d_gdp.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        return rScale((gdp.VALUE / pop.VALUE) * 1000);
      });
  }
  // Tick marks and labels for x and y axes
  {
    var xTicks = [], yTicks = []; // Ticks
    for (let index = 0; index <= 1; index += 0.25) {
      xTicks.push(Math.round(xScale.invert(30 + index * (width - 37.5))));
      yTicks.push(Math.round(yScale.invert(30 + index * (height - 37.5))));
    }
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height-12.5})`)
      .call(d3.axisBottom(xScale).tickFormat((d) => d).tickValues(xTicks).tickSizeOuter(0));
    svg.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${width-12.5},0)`)
      .call(d3.axisRight(yScale).tickFormat((d) => d).tickValues(yTicks).tickSizeOuter(0));
    svg.append("text") // Labels
      .attr("class", "x-axis-label")
      .attr("x", width/2 - 2)
      .attr("y", height+16.5)
      .style("text-anchor", "end")
      .text("Air pollutants")
      .attr("font-weight", "500");
    svg.append("text") // Labels
      .attr("class", "x-axis-label")
      .attr("x", width/2 + 2)
      .attr("y", height+16.5)
      .style("text-anchor", "start")
      .text("(kg per th. people)")
      .attr("font-size", "12px");
    svg.append("text")
      .attr("class", "y-axis-label")
      .attr("x", width-5)
      .attr("y", 20)
      .style("text-anchor", "end")
      .text("Selected vehicles sold")
      .attr("font-weight", "500");
    svg.append("text")
      .attr("class", "y-axis-label")
      .attr("x", width-17)
      .attr("y", 33)
      .style("text-anchor", "end")
      .text("(per th. people)")
      .attr("font-size", "12px");
  }
  // Year Legend
  {
    const yearLegendData = [
      { cx: 20, r: 10, color: "#CC6521", label: minYear },
      { cx: 70, r: 10, color: "#663210", label: maxYear },
    ];
    const yearLegend = svg.append("g")
      .attr("class", "year-legend")
      .attr("transform", "translate(35, 20)");
    yearLegend.selectAll("line") // Line
      .data(yearLegendData)
      .enter()
      .append("line")
      .attr("x1", yearLegendData[0].cx)
      .attr("y1", 0)
      .attr("x2", yearLegendData[1].cx)
      .attr("y2", 0)
      .attr("stroke", "#994C18")
      .attr("stroke-width", "3")
      .attr("opacity", "0.5");
    yearLegend.selectAll("circle") // Circles
      .data(yearLegendData)
      .enter()
      .append("circle")
      .attr("cx", (d) => d.cx)
      .attr("r", (d) => d.r)
      .attr("fill", (d) => d.color);
    yearLegend.selectAll("text") // Labels
      .data(yearLegendData)
      .enter()
      .append("text")
      .attr("x", (d, i) => {
          if (i === 0) return d.cx - d.r - 30;
            if (i === 1) return d.cx + d.r + 5;
        })
      .attr("y", (d) => d.r / 2)
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .text((d) => d.label);
  }
  // GDP Legend
  {
    const gdpLegendData = [
      { cx: 0, r: 5, label: rScale.invert(5).toFixed(0) },
      { cx: 15 + 25, r: 10, label: rScale.invert(10).toFixed(0) },
      { cx: 40 + 50, r: 15, label: rScale.invert(15).toFixed(0) }
    ];
    const gdpLegend = svg.append("g")
      .attr("class", "gdp-legend")
      .attr("transform", "translate(20, 50)");
    gdpLegend.selectAll("circle")
      .data(gdpLegendData)
      .enter()
      .append("circle")
      .attr("r", (d) => d.r)
      .attr("cx", (d) => d.cx)
      .attr("cy", 18)
      .attr("fill", "transparent")
      .attr("stroke", "black")
      .attr("stroke-width", "1");
    gdpLegend.selectAll("ntext")
      .data(gdpLegendData)
      .enter()
      .append("text")
      .text((d) => d.label)
      .attr("x", (d) => d.cx + d.r + 5)
      .attr("y", 22)
      .attr("font-size", "12px");
    gdpLegend.append("text")
      .text("GDP")
      .attr("font-weight", "500")
      .attr("x", -6)
      .attr("y", 0);
    gdpLegend.append("text")
      .text("(mill. € per th. people)")
      .attr("font-size", "12px")
      .attr("x", 30)
      .attr("y", -1.5);
  }
}

// Cleveland Dot Plot
function createDotPlot() {

  const margin = { top: 40, right: 20, bottom: 30, left: 70 };
  const height = d3.select("#idiom2").node().clientHeight - margin.bottom - margin.top;
  const width = d3.select("#idiom2").node().clientWidth - margin.left - margin.right;
  const svg = d3
    .select("#idiom2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Filter data for selected countries
  const selectedCountries = all_countries;

  const filteredData = gd_indexes.filter((d) => selectedCountries.includes(d.COUNTRY));

  // Function to calculate the average value for each index type for each country for selected years
  function calculateAverageValues(data, minYear, maxYear) {
    const countryIndexAverages = {};

    data.forEach((d) => {
      const year = +d.YEAR;
      if (year >= minYear && year <= maxYear) {
        const key = d.COUNTRY;
        if (!countryIndexAverages[key]) {
          countryIndexAverages[key] = {};
        }
        if (!countryIndexAverages[key][d.INDEX]) {
          countryIndexAverages[key][d.INDEX] = { sum: 0, count: 0 };
        }
        countryIndexAverages[key][d.INDEX].sum += +d.VALUE;
        countryIndexAverages[key][d.INDEX].count += 1;
      }
    });

    const averages = [];

    for (const country in countryIndexAverages) {
      for (const index in countryIndexAverages[country]) {
        const avg = countryIndexAverages[country][index].sum / countryIndexAverages[country][index].count;
        averages.push({ COUNTRY: country, INDEX: index, VALUE: avg });
      }
    }

    return averages;
  }

  // Call the function to calculate average values for the selected years
  const averageData = calculateAverageValues(gd_indexes, minYear, maxYear);

  // Sort selectedCountries based on the selected IndexType
  selectedCountries.sort((a, b) => {
    const valueA = averageData.find((d) => d.COUNTRY === a && d.INDEX === selectedIndex);
    const valueB = averageData.find((d) => d.COUNTRY === b && d.INDEX === selectedIndex);
    
    if (valueA && valueB) {
      return valueA.VALUE - valueB.VALUE;
    }
    
    return 0; // Handle cases where data is missing for a country
  });

  // Create a scale for the y-axis (countries)
  const yScale = d3
    .scaleBand()
    .domain(selectedCountries)
    .range([height, margin.top])
    .padding(0.2);

  // Create a scale for the x-axis (index values)
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(averageData, (d) => +d.VALUE)])
    .range([0, width]);

  // Create x-axis
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

  // Create y-axis
  svg
    .append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale));

  const indexTypes = [
    "Quality of Life",
    "Cost of Living",
    "Pollution",
    "Purchasing Power",
    "Traffic Commute Time",
  ];

  const indexStyles = {
    "Quality of Life": "green",
    "Cost of Living": "blue",
    "Pollution": "red",
    "Purchasing Power": "orange",
    "Traffic Commute Time": "purple",
  };

  // Create dots for each data point
  const dots = svg
    .selectAll(".dot")
    .data(averageData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => xScale(+d.VALUE))
    .attr("cy", (d) => yScale(d.COUNTRY) + yScale.bandwidth() / 2)
    .attr("r", 4)
    .attr("fill", (d) => indexStyles[d.INDEX])
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .attr("country", (d) => d.COUNTRY)
    .attr("value", (d) => d.VALUE)
    .attr("index", (d) => d.INDEX)
    .on("click", handleClickDotPlot)
    .on("mouseover", handleMouseOver2)
    .on("mouseout", handleMouseOut2);

  // Add buttons with rounded edges
  const buttons = svg.selectAll(".button")
    .data(indexTypes)
    .enter()
    .append("g")
    .attr("class", "button")
    .attr("transform", (d, i) => `translate(${-65 + i * 95}, ${0})`)
    .on("click", handleButtonClickDotPlot);
  buttons.append("rect")
    .attr("x", 10)
    .attr("y", -8)
    .attr("width", 90)
    .attr("height", 20)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", (d) => indexStyles[d])
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .attr("fill-opacity", 0.75);
  buttons.append("text")
    .attr("x", 55)
    .attr("y", 5)
    .attr("text-anchor", "middle")
    .style("font-size", "8px")
    .style("font-weight", "bold")
    .style("cursor", "pointer")
    .text((d) => d);
  // Add activation buttons
  const activation_button = svg.selectAll(".activation-button")
    .data(indexTypes)
    .enter()
    .append("g")
    .attr("class", "button")
    .attr("transform", (d, i) => `translate(${-65 + i * 95}, ${0})`)
    .on("click", handleActivateDotPlot);
  activation_button.append("rect")
    .attr("x", 10)
    .attr("y", 12.5)
    .attr("width", 57.5)
    .attr("height", 20)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", "lightgrey")
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
  activation_button.append("text")
    .attr("x", 18)
    .attr("y", 25.5)
    .style("font-size", "8px")
    .style("font-weight", "bold")
    .style("cursor", "pointer")
    .text("Show/Hide");

  // Add title
  svg
    .append("text")
    .attr("class", "title")
    .attr("x", width / 2 - 25)
    .attr("y", -17.5)
    .style("text-anchor", "middle")
    .style("font-weight", "500")
    .text("Index Values for all EU countries");

  // Create lines connecting the dots for each country
  const countryGroups = svg.selectAll(".country-group")
    .data(averageData)
    .enter()
    .filter((d, i, nodes) => {
      // Filter to select only the first dot for each country
      const country = d.COUNTRY;
      const firstIndex = averageData.findIndex((item) => item.COUNTRY === country);
      return i === firstIndex;
    });

  // Inside your code where you are drawing lines between the dots
  countryGroups.each(function (d, i) {
    const country = d.COUNTRY;
    const countryDots = dots.filter((dotData) => dotData.COUNTRY === country);
    if (countryDots.size() > 1) {
      const coordinates = [];
      countryDots.each(function(dotData) {
        const x = +d3.select(this).attr("cx");
        const y = +d3.select(this).attr("cy");
        coordinates.push([x, y]);
      });

      // Add start and end points to the coordinates
      const start = [0, coordinates[0][1]]; // Start point at the left edge
      const end = [width, coordinates[0][1]]; // End point at the right edge
      coordinates.unshift(start);
      coordinates.push(end);

      // Draw lines between the dots
      svg.append("path")
        .datum(coordinates)
        .attr("class", "line")
        .attr("d", d3.line())
        .attr("stroke", "black")
        .attr("fill", "none")
        .attr("opacity", 0.1);
    }
  });
}

function create5() {

  // Get height and width of the container
  const height = d3.select("#idiom5").node().getBoundingClientRect().height;
  const width = d3.select("#idiom5").node().getBoundingClientRect().width;
  margin = { top: 30, right: 250, bottom: 10, left: 25 };

  // Create SVG to hold the heatmap
  const svg = d3
    .select("#idiom5")
    .append("svg")
    .attr("minYear", minYear)
    .attr("maxYear", maxYear)
    .attr("countries", all_countries)
    .attr("width", width)
    .attr("height", height);

  // Group data by vehicle and fuel type
  const groupByVehicleFuel = d3.group(gd_vehicles, d => d.VEHICLE, d => d.FUEL);
  // For each vehicle and fuel, sum the units
  const vehicleFuelUnits = [];
  groupByVehicleFuel.forEach((fuelMap, vehicle) => {
    fuelMap.forEach((units, fuel) => {
      vehicleFuelUnits.push({ vehicle, fuel, units: d3.sum(units, d => d.UNITS) });
    });
  });

  // Compute total units sold across all vehicles and fuels
  const totalUnits = d3.sum(vehicleFuelUnits, d => d.units);
  const setVehicles = [...new Set(gd_vehicles.map(d => d.VEHICLE))];
  const setFuels = [...new Set(gd_vehicles.map(d => d.FUEL))];

  // Axes scales
  const xScale = d3
    .scaleBand()
    .domain(setVehicles)
    .range([0, width - margin.left - margin.right])
    .padding(0.05);
  const yScale = d3
    .scaleBand()
    .domain(setFuels)
    .range([height - margin.top - margin.bottom, 0])
    .padding(0.1);  

  svg.append("g")
    .attr("transform", `translate(${60}, ${25})`)
    .call(d3.axisTop(xScale));
  svg.append("g")
    .attr("transform", `translate(${60}, ${25})`)
    .call(d3.axisLeft(yScale));

  const fuelUnits = {};
  vehicleFuelUnits.forEach(d => {
    if (!fuelUnits[d.fuel]) {
      fuelUnits[d.fuel] = 0;
    }
    fuelUnits[d.fuel] += d.units;
  });
  const vehicleUnits = {};
  vehicleFuelUnits.forEach(d => {
    if (!vehicleUnits[d.vehicle]) {
      vehicleUnits[d.vehicle] = 0;
    }
    vehicleUnits[d.vehicle] += d.units;
  });
    
  // create the rectangles
  svg.selectAll()
    .data(vehicleFuelUnits)
    .enter()
    .append("rect")
    .attr("class", "rect")
    .attr("x", d => xScale(d.vehicle) + 60)
    .attr("y", d => yScale(d.fuel) + 25)
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .attr("vehicle", d => d.vehicle)
    .attr("fuel", d => d.fuel)
    .attr("units", d => d.units)
    .attr("share", d => ((d.units/totalUnits)*100).toFixed(1))
    .attr("share-vehicle", d => ((d.units/vehicleUnits[d.vehicle])*100).toFixed(1))
    .attr("share-fuel", d => ((d.units/fuelUnits[d.fuel])*100).toFixed(1))
    .on("mouseover", handleMouseOver5)
    .on("mouseout", handleMouseOut5)
    .on("click", handleClick5)
    .attr("fill", d => {
      // create color scale with domain going from 0 to max share for each fuel type
      const colorScale = d3.scaleLinear()
        .domain([0, d3.max(vehicleFuelUnits.filter(o => o.fuel === d.fuel), d => d.units/fuelUnits[d.fuel])])
        .range([0, 1]);
      const color = d3.interpolateGreens(colorScale(d.units/fuelUnits[d.fuel]));
      return color;
    })
    .attr("stroke", "gray");

  // Tooltip
  tooltip5 = d3
    .select("#idiom4")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
}