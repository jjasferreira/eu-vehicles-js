

// Global variables
var gd_air, d_air;
var gd_gdp, d_gdp;
var gd_indexes, d_indexes;
var gd_population, d_population;
var gd_vehicles, d_vehicles;
var gd_geo, d_geo;



// Create a tooltip
var tooltip3;
var tooltip4;

var selected_countries = [];
var maxYear;
var minYear;

const all_countries = [ 'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden'];

// Start the dashboard
function startDashboard() {

  loadData().then(() => {
    createIdiom4();
    createChoropleth();
    //createParallelSets();
    createDotPlot();
    createLineChart();
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

  // Set up dimensions and margins
  const margin = {top: 20, right: 20, bottom: 40, left: 60};
  //const width = 600 - margin.left - margin.right; 
  //const height = 400 - margin.top - margin.bottom;

  const container = d3.select("#idiom1");
  const width = 420;
  const height = 180;

  console.log(width, height );

  // Create SVG container
  const svg = d3.select("#idiom1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`); 

  // Initialize scales and axes
  const x = d3.scaleTime()
    .range([0, width])
    .domain(d3.extent(d_vehicles, d => d.YEAR));

  const y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(d_vehicles, d => d.UNITS)]);

  const xAxis = d3.axisBottom(x)
    .ticks(9)
    .tickFormat(d3.format("d")); 
  
  const yAxis = d3.axisLeft(y)
    .ticks(5);

  // Append axes
  svg.append("g")
    .attr("transform", `translate(0,${height})`) 
    .call(xAxis);

  svg.append("g")
    .call(yAxis);
    // Initialize line generator 
  const line = d3.line()
  .x(d => x(d.YEAR)) 
  .y(d => y(d.UNITS));
  
  // Append path element
  const path = svg.append("path");
  
  /*
  // Create vertical slider controls
  let minYear = +d3.min(d_vehicles, d => d.YEAR); 
  let maxYear = +d3.max(d_vehicles, d => d.YEAR);

  const sliderLeft = svg.append("g")
    .attr("class", "slider-left")
    .attr("transform", `translate(${x(minYear)},0)`);

  sliderLeft.append("line")
    .attr("stroke", "black")
    .attr("y1", 0)
    .attr("y2", height);

  const handleLeft = sliderLeft.append("circle")
    .attr("r", 6)
    .attr("cy", height / 2)
    .attr("cursor", "ew-resize")
    .call(d3.drag()
      .on("drag", () => {
        const x = d3.event.x;
        minYear = Math.round(x.invert(x));
        minYear = Math.min(maxYear-1, minYear); 
        update();
      })  
    );

  const sliderRight = svg.append("g")  
    .attr("class", "slider-right")
    .attr("transform", `translate(${x(maxYear)},0)`);

  sliderRight.append("line")
    .attr("stroke", "black") 
    .attr("y1", 0)
    .attr("y2", height);

  const handleRight = sliderRight.append("circle")   
    .attr("r", 6)
    .attr("cy", height / 2) 
    .attr("cursor", "ew-resize")
    .call(d3.drag()
      .on("drag", () => {
        const x = d3.event.x;
        maxYear = Math.round(x.invert(x));
        maxYear = Math.max(minYear+1, maxYear);
        update();
      })
    );

  // Initialize displayed data
  update();

  // Updates the chart when sliders change
  function update() {
    
    // Filter data based on slider values 
    const filteredData = d_vehicles.filter(d => {
      return d.YEAR >= minYear && d.YEAR <= maxYear; 
    });
    
    // Update domains
    x.domain([minYear, maxYear]);
    y.domain([0, d3.max(filteredData, d => d.UNITS)]); 

    // Update path data
    path
      .datum(filteredData)
      .attr("d", line);

    // Update axis scales
    xAxis.scale(x);
    yAxis.scale(y);

    // Update slider positions
    sliderLeft.attr("transform", `translate(${x(minYear)},0)`); 
    handleLeft.attr("cy", height/2);

    sliderRight.attr("transform", `translate(${x(maxYear)},0)`);
    handleRight.attr("cy", height/2);

    // Redraw axes
    svg.select(".x-axis").call(xAxis);  
    svg.select(".y-axis").call(yAxis);

  }

  */
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
  /* {
    const legendWidth = width * 0.4;
    const legendHeight = 15;
    const legendX = 15;
    const legendY = 20;
    
    const ratioValues = Object.values(currentData);
    const legendScale = d3.scaleQuantize()
    .domain([d3.min(ratioValues), d3.max(ratioValues)])
    .range([d3.interpolateBlues(0), d3.interpolateBlues(0.2), d3.interpolateBlues(0.4), d3.interpolateBlues(0.6), d3.interpolateBlues(0.8), d3.interpolateBlues(1)]);
    
    const legendGroup = svg.append("g")
    .style('transform', `translate(${legendX}px, ${legendY}px)`);
    
    legendGroup.selectAll("rect")
    .data(legendScale.range())
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * legendWidth / 6)
    .attr("y", 0)
    .attr("width", legendWidth / 6)
    .attr("height", legendHeight)
    .style("fill", (d) => d)
    .attr("stroke", "black");

    const legendAxis = d3
    .axisBottom(legendScale)
    .tickFormat(d3.format(".2f"))
    .tickValues(legendScale.domain())
    .tickSize(5)
    .tickPadding(5)
    .tickSizeOuter(0);
    
    legendGroup.append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(legendAxis)
    .select(".domain").remove();
    /*
    
    legendGroup.append("text")
    .attr("x", legendWidth / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text("Ratio of selected Vehicle types sales to total");
  }
  */
  
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
    .domain([0, 17])
    .range([width, 0]);
  const yScale = d3
    .scaleLinear()
    .domain([0, 13])
    .range([height, 0]);
  const rScale = d3
    .scaleRadial()
    .domain([minR, maxR])
    .range([5, 15]);

  // Minimum and maximum years interval
  const minYear = d3.min(d_vehicles, (d) => d.YEAR);
  const maxYear = d3.max(d_vehicles, (d) => d.YEAR);

  // Lines connecting Circles
  {
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
    svg.selectAll(".line") // Lines
      .data(all_countries)
      .enter()
      .append("line")
      .attr("class", "line data")
      .attr("stroke", "url(#line-gradient)")
      .attr("stroke-width", "3")
      .attr("opacity", "0.65")
      .text((c) => c)
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
      .text((c) => c)
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
      .text((c) => c)
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
      xTicks.push(Math.round(xScale.invert(index * width)));
      yTicks.push(Math.round(yScale.invert(index * height)));
    }
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat((d) => d).tickValues(xTicks).tickSizeOuter(0));
    svg.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${width},0)`)
      .call(d3.axisRight(yScale).tickFormat((d) => d).tickValues(yTicks).tickSizeOuter(0));
    svg.append("text") // Labels
      .attr("class", "x-axis-label")
      .attr("x", width/2 - 2)
      .attr("y", height+28)
      .style("text-anchor", "end")
      .text("Air pollutants")
      .attr("font-weight", "500");
    svg.append("text") // Labels
      .attr("class", "x-axis-label")
      .attr("x", width/2 + 2)
      .attr("y", height+27)
      .style("text-anchor", "start")
      .text("(kg per th. people)")
      .attr("font-size", "12px")
    svg.append("text")
      .attr("class", "y-axis-label")
      .attr("x", width+30)
      .attr("y", -12)
      .style("text-anchor", "end")
      .text("Selected vehicles sold")
      .attr("font-weight", "500")
      svg.append("text")
      .attr("class", "y-axis-label")
      .attr("x", width-10)
      .attr("y", 0)
      .style("text-anchor", "end")
      .text("(per th. people)")
      .attr("font-size", "12px")
  }
  // Year Legend
  {
    const yearLegendData = [
      { cx: 20, r: 10, color: "#CC6521", label: "2014" },
      { cx: 70, r: 10, color: "#663210", label: "2022" },
    ];
    const yearLegend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(0, -10)");
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
      // get the inverse of using 5 in the rScale
      { cx: 0, r: 5, label: rScale.invert(5).toFixed(0) },
      { cx: 15 + 25, r: 10, label: rScale.invert(10).toFixed(0) },
      { cx: 40 + 50, r: 15, label: rScale.invert(15).toFixed(0) }
    ];
    const gdpLegend = svg.append("g")
      .attr("class", "gdp-legend")
      .attr("transform", "translate(-15, 25)");
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
    gdpLegend.selectAll("text")
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
      .attr("y", -2);
    console.log(gdpLegendData);
  }
  // Tooltip
  {
  tooltip4 = d3
    .select("#idiom4")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  }
}

// Cleveland Dot Plot
function createDotPlot() {
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const container = d3.select("#idiom2");
  const width = container.node().clientWidth;
  const height = container.node().clientHeight;
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
    "Cost of Living",
    "Pollution",
    "Purchasing Power",
    "Quality of Life",
    "Traffic Commute Time",
  ];

  const indexStyles = {
    "Cost of Living": "blue",
    "Pollution": "red",
    "Purchasing Power": "orange",
    "Quality of Life": "green",
    "Traffic Commute Time": "purple",
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
    .attr("fill", (d) => indexStyles[d.INDEX]);

  // Add a legend
  const legend = svg.selectAll(".legend")
    .data(indexTypes)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`);

  legend.append("rect")
    .attr("x", width - margin.right)
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", (d) => indexStyles[d.INDEX]);

  legend.append("text")
    .attr("x", width - margin.right - 30)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
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
