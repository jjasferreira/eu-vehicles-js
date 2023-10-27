

// Global variables
var gd_air, d_air;
var gd_gdp, d_gdp;
var gd_indexes, d_indexes;
var gd_population, d_population;
var gd_vehicles, d_vehicles;
var gd_geo, d_geo;



// Create a tooltip
var tooltip1;
var tooltip3;
var tooltip4;

var minYear = '2014';
var maxYear = '2022';

var selected_countries = [];

const all_countries = [ 'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden'];

// Start the dashboard
function startDashboard() {

  loadData().then(() => {
    createChoropleth();
    //createDotPlot();
    createLineChart();
    create4();
    createIdiom5();
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
  
  console.log(selectedYearlySales);
  // Set up dimensions and margins
  const margin = {top: 20, right: 20, bottom: 40, left: 60};
  //const width = 600 - margin.left - margin.right; 
  //const height = 400 - margin.top - margin.bottom;

  const container = d3.select("#idiom1");
  const width = 420;
  const height = 180;

  // Create SVG container
  const svg = d3.select("#idiom1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`); 

  // Initialize scales and axes
  const xScale = d3.scalePoint()
  .domain(selectedYearlySales.map(d => d.YEAR)) // Use map to extract years from the array of objects
  .range([0, width])
  .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(selectedYearlySales, d => d.UNITS)]) // Use the maximum UNITS value
    .range([height, 0]);


  const xAxis = d3.axisBottom(xScale)
    .ticks(9);
    //.tickFormat(d3.format("d")); 
  
  const yAxis = d3.axisLeft(yScale)
    .ticks(5);

  // Append axes
  svg.append("g")
    .attr("transform", `translate(0,${height})`) 
    .call(xAxis);

  svg.append("g")
    .call(yAxis);
    // Initialize line generator 
    
  // Initialize line generator
  const line = d3.line()
    .x((d) => xScale(d.YEAR))
    .y((d) => yScale(d.UNITS));

  // Append path element
  svg
    .append("path")
    .datum(selectedYearlySales)
    .attr("class", "line")
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2);

    // append circles
  svg
    .selectAll(".circle")
    .data(selectedYearlySales)
    .enter()
    .append("circle")
    .attr("class", "circle data")
    .attr("cx", (d) => xScale(d.YEAR))
    .attr("cy", (d) => yScale(d.UNITS))
    .attr("r", 5)
    .attr("fill", "steelblue")
    .attr("stroke", "black")
    .on("mouseover", handleMouseOverLineChart)
    .on("mouseout", handleMouseOutLineChart)
    .append("title")
    .text((d) => d.YEAR);

  // Initialize the selected range
  var selectedRange = [parseInt(minYear), parseInt(maxYear)];

  console.log(selectedRange[1]);

  // Set up the width and height of the sliders
  const sliderWidth = 2;
  const sliderHeight = height;

  // Create the sliders
  const leftSlider = svg
    .append("rect")
    .attr("x", xScale(selectedRange[0]) - sliderWidth / 2)
    .attr("y", 0)
    .attr("width", sliderWidth)
    .attr("height", sliderHeight)
    .attr("fill", "navy")
    .attr("opacity", "0.8")
    .call(
      d3
      .drag()
      .on("start", dragstarted)
      .on("drag", draggedLeft)
      .on("end", dragended)
      )
    ;

    
  const rightSlider = svg
    .append("rect")
    .attr("x", xScale(selectedRange[1]) - sliderWidth / 2)
    .attr("y", 0)
    .attr("width", sliderWidth)
    .attr("height", sliderHeight)
    .attr("fill", "navy")
    .attr("opacity", "0.8")
    .call(
      d3
      .drag()
      .on("start", dragstarted)
      .on("drag", draggedRight)
      .on("end", dragended)
      );

  const handleRadius = 10; // Set the radius of the handle
  const handleLeft = svg
    .append("circle")
    .attr("cx", xScale(selectedRange[0])) // Initial position of the handle
    .attr("cy", sliderHeight / 2) // Vertically center the handle
    .attr("r", handleRadius) // Set the radius of the handle
    .attr("fill", "navy") // Set the handle color
    .attr("stroke", "#333333")
    .attr("stroke-width", 1.5) // Set the handle color
    .attr("opacity", "0.8")
    .call(
      d3.drag()
        .on("start", dragstarted)
        .on("drag", draggedLeft)
        .on("end", dragended)
    );
  
  const handleRight = svg
    .append("circle")
    .attr("cx", xScale(selectedRange[1])) // Initial position of the handle
    .attr("cy", sliderHeight / 2) // Vertically center the handle
    .attr("r", handleRadius) // Set the radius of the handle
    .attr("fill", "navy") // Set the handle color
    .attr("stroke", "#333333")
    .attr("stroke-width", 1.5) // Set the handle color
    .attr("opacity", "0.8")
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
    handleLeft.attr("cx", xScale(newMinYear));
    leftSlider.attr("x", xScale(newMinYear) - sliderWidth / 2);
  }

  function draggedRight(event, d) {
    let x = event.x;
    x = Math.max(xScale(selectedRange[0]) + sliderWidth, Math.min(x, width - sliderWidth));
    const newMaxYear = Math.max(getClosestYear(x), selectedRange[0]);
    selectedRange[1] = newMaxYear;
    //maxYear = newMaxYear;
    handleRight.attr("cx", xScale(newMaxYear));
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
    selectionText.text(`Time range: ${minYear} to ${maxYear}`);
    console.log("Chupa misto");
    updateChoropleth();
    update4();
  }

    // Add title 
  svg.append("text")
  .attr("x", width/2)
  .attr("y", 0 - (margin.top/2) + 10)
  .attr("text-anchor", "middle")  
  .style("font-size", "16px") 
  .style("text-decoration", "underline")  
  .text("Total Units Sold for Selection");

  // Add min/max text
  const selectionText = svg.append("text")
  .attr("x", 0)
  .attr("y", height + margin.bottom - 10)
  .text(`Time range: ${minYear} to ${maxYear}`)
  .style("font-size", "12px");


  // tooltip
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

  console.log(selectedCountrySales);

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
      .attr("fill", d3.interpolateBlues(colorScale(currentData[element])))
      .attr("data", currentData[element]);
  });

  // Add the "deselect all" button
  {
    const deselectButton = svg.append("g")
      .attr("class", "button")
      .attr("transform", `translate(${40}, ${50})`)
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
  }

  // zoom
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

  // Add the legend
  {

    let max = d3.max(Object.values(currentData));
    let min = d3.min(Object.values(currentData));
    let l = Legend(d3.scaleSequential([min, max], d3.interpolateBlues), {
      width: 100,
      ticks: 5,
      tickFormat: "%",
      marginLeft: 10,
    })

    svg.append(() => l);
  }
  
  
  
  // tooltip
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
  // add title to top of map
  {
    
    svg.append("text")
      .attr("x", width/2)
      .attr("y", 20)
      .attr("text-anchor", "middle")  
      .style("font-size", "16px") 
      .style("text-decoration", "underline")  
      .text("Total Units Sold by Country");
  }
}

function create4() {

  const h = d3.select("#idiom4").node().getBoundingClientRect().height;
  const w = d3.select("#idiom4").node().getBoundingClientRect().width;

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

  update4();
}

// Cleveland Dot Plot
function createDotPlot() {
  const margin = { top: 40, right: 40, bottom: 40, left: 80 };
  const container = d3.select("#idiom2");
  const width = container.node().clientWidth - margin.left - margin.right;
  const height = container.node().clientHeight - margin.bottom - margin.top;
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
  function calculateAverageValues(data, selectedYears) {
    const countryIndexAverages = {};

    data.forEach((d) => {
      if (selectedYears.includes(+d.YEAR)) {
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
  // Calculate the average GDP values for each country during selectedYears
  function calculateAverageGDP(data, selectedYears) {
    const countryGDPAverages = {};

    data.forEach((d) => {
      if (selectedYears.includes(+d.YEAR)) {
        const key = d.COUNTRY;
        if (!countryGDPAverages[key]) {
          countryGDPAverages[key] = { sum: 0, count: 0 };
        }
        countryGDPAverages[key].sum += +d.VALUE;
        countryGDPAverages[key].count += 1;
      }
    });

    const averages = [];

    for (const country in countryGDPAverages) {
      const avgGDP = countryGDPAverages[country].sum / countryGDPAverages[country].count;
      averages.push({ COUNTRY: country, AVG_GDP: avgGDP });
    }

    // Sort selectedCountries by average GDP values in descending order
    selectedCountries.sort((a, b) => {
      const avgGDP_A = averages.find((c) => c.COUNTRY === a);
      const avgGDP_B = averages.find((c) => c.COUNTRY === b);

      if (avgGDP_A && avgGDP_B) {
        return avgGDP_A.AVG_GDP - avgGDP_B.AVG_GDP;
      }
      return 0; // Handle cases where data is missing for a country
    });

    return averages;
  }

  // Define the selected years (e.g., 2020 and 2021)
  const selectedYears = [2018, 2019];
  
  // Define the selected IndexType to order
  const selectedIndex = "Cost of Living"

  // Define the selected Index Types
  const selectedIndexTypes = [
    "Cost of Living",
    "Pollution",
    "Purchasing Power",
    "Quality of Life",
    "Traffic Commute Time",
  ];

  // Call the function to calculate average values for the selected years
  const averageData = calculateAverageValues(gd_indexes, selectedYears);
  
  // Order Coutries by ascending GDP
  const averageGDPData = calculateAverageGDP(d_gdp, selectedYears);

  // Filter by selecter index types
  const filteredAverageData = averageData.filter((d) => selectedIndexTypes.includes(d.INDEX));

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
    .domain([0, d3.max(filteredAverageData, (d) => +d.VALUE)])
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
    "Traffic Commute Time",
    "Cost of Living",
    "Pollution",
    "Purchasing Power",
    "Quality of Life",
  ];

  const indexStyles = {
    "Traffic Commute Time": "purple",
    "Cost of Living": "blue",
    "Pollution": "red",
    "Purchasing Power": "orange",
    "Quality of Life": "green",
  };

  // Create dots for each data point
  const dots = svg
    .selectAll(".dot")
    .data(filteredAverageData)
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
    .on("click", handleClickDotPlot)
    .on("mouseover", handleMouseOver2)
    .on("mouseout", handleMouseOut2);

  // Add a legend
  const legend = svg.selectAll(".legend")
    .data(indexTypes)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(${i*100 + 50}, ${0})`);

  legend.append("circle")
    .attr("cx", 30)
    .attr("cy", 9)
    .attr("r", 4)
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .attr("fill", (d) => indexStyles[d]);

  legend.append("text")
    .attr("x", 20)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .style("font-size", "10px")
    .text((d) => d);

  // Add x-axis label
  svg
    .append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .style("text-anchor", "middle")
    .text("Index Values");

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

function createIdiom5() {

  const h = d3.select("#idiom5").node().getBoundingClientRect().height;
  const w = d3.select("#idiom5").node().getBoundingClientRect().width;
  const height = h - 50;
  const width = w - 50;
  
  // Create an SVG element to hold the parallel sets diagram
  const svg = d3
    .select("#idiom5")
    .append("svg")
    .attr("height", height + 50)
    .attr("width", width + 50)
    .append("g")
    .attr("transform", `translate(25, 25)`);

  // Create x scales for the parallel sets
  const tScale = d3
    .scalePoint()
    .domain([...new Set(gd_vehicles.map((d) => d.VEHICLE))])
    .range([0, width]);
  const bScale = d3
    .scalePoint()
    .domain([...new Set(gd_vehicles.map((d) => d.FUEL))])
    .range([0, width]);

  // Create lines to represent flows
  svg
    .selectAll(".line")
    .data(gd_vehicles)
    .enter()
    .append("line")
    .attr("x1", d => tScale(d.VEHICLE))
    .attr("x2", d => tScale(d.VEHICLE))
    .attr("y1", d => bScale(d.FUEL))
    .attr("y2", d => bScale(d.FUEL))
    .attr("stroke", "blue")
    .attr("stroke-width", d => d.VALUE);

  // Labels for x axes
  {
    svg.selectAll(".vehicle-label") // Vehicle labels
      .data([...new Set(gd_vehicles.map((d) => d.VEHICLE))])
      .enter()
      .append("text")
      .text(d => d)
      .attr("x", d => tScale(d))
      .attr("y", height)
      .attr("text-anchor", "start");
    svg.selectAll(".fuel-label") // Fuel labels
      .data([...new Set(gd_vehicles.map((d) => d.FUEL))])
      .enter()
      .append("text")
      .text(d => d)
      .attr("x", d => bScale(d))
      .attr("y", 0)
      .attr("text-anchor", "start");
  }
}
