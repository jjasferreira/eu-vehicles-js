// Global variables

var globalGeoData;
var globalData;
var currentData;
var currentSelection;

function startDashboard() {
    const dataFile = "../data/eu-vehicles.csv";
    const geoFile = "../data/europe.json";

    async function processData() {
        const data = await d3.csv(dataFile);
        const geoData = await d3.json(geoFile);
        globalData = data;
        // get topojson features into global variable
        globalGeoData = topojson.feature(geoData, geoData.objects.europe);
    }

    processData().then(() => {
        createChoropleth();
        //createIdiom4();
        // TODO
        //createParallelSets();
        //createDotPlot();
        //createLineChart();
    });
}

function createChoropleth() {
    // choropleth map in the idiom3 div container.
    const countrySales = d3.group(globalData, (d) => d.COUNTRY);

    // Initialize an empty object to store the aggregated data
    var currentData = {};

    countrySales.forEach((sales, country) => {
        const totalSales = d3.sum(sales, (d) => +d.UNITS);
        currentData[country] = totalSales;
    });

    const container = d3.select("#idiom3");
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;
    console.log(width, height);
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
        .fitSize([width, height], globalGeoData);

    const path = d3.geoPath().projection(projection);

    // Add the map to the map group
    mapGroup
        .selectAll("country")
        .data(globalGeoData.features)
        .enter()
        .append("path")
        .attr("class", "country data")
        .attr("d", path)
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .append("title")
        .text((d) => d.properties.NAME);


    Object.keys(currentData).forEach(function(element) {
        console.log(element);
        mapGroup
            .attr("fill", "lightgrey")
            .selectAll("path")
            .filter(function(d) { 
                //console.log(d.properties.NAME === element.COUNTRY);
                //console.log(d.properties.NAME);
                //console.log(element.COUNTRY);
                return d.properties.NAME === element; 
            })
            .attr("fill", d3.interpolateBlues(colorScale(currentData[element])));

    });

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

    // Add a legend to the map
    const legendGroup = svg.append("g").attr("class", "legend");
    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = width - legendWidth;
    const legendY = height - legendHeight;
    const legendRectWidth = legendWidth / 10;
    const legendRectHeight = legendHeight;
    const legendValues = colorScale.ticks(10);
    const legendColors = legendValues.map((value) =>
        d3.interpolateBlues(colorScale(value))
    );
}


// CUSTOM SCATTER PLOT
function createIdiom4() {
  
    // Create an SVG element to hold the scatter plot
    const svg = d3
      .select("#idiom4")
      .append("svg")
      .attr("width", 300)
      .attr("height", 300)
      .append("g")
  
    // Create x and y scales for the scatter plot
    const xScale = d3
      .scaleLog()
      .domain([
        d3.min(currentData, (d) => d.UNITS),
        d3.max(currentData, (d) => d.UNITS),
      ])
      .range([0, width]);
  
    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(currentData, (d) => d.YEAR),
        d3.max(currentData, (d) => d.YEAR),
      ])
      .range([height, 0]);
    /*
    // Add circles to the scatter plot representing each country
    svg
      .selectAll(".circle")
      .data(currentData, (d) => d.COUNTRY)
      .enter()
      .append("circle")
      .attr("class", "circle data")
      .attr("cx", (d) => xScale(d.UNITS))
      .attr("cy", (d) => yScale(d.YEAR))
      .attr("r", 5)
      .attr("fill", "steelblue")
      .attr("stroke", "black")
      .text((d) => d.COUNTRY);
  
    // Create tick marks and labels for the x and y axes
    var xTicks = [];
    var yTicks = [];
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
      .call(
        d3
          .axisLeft(yScale)
          .tickFormat((d) => d)
          .tickValues(yTicks)
          .tickSizeOuter(0)
      );
  
    // Add labels for the x and y axes
    svg
      .append("text")
      .attr("class", "x-axis-label")
      .attr("x", 200 / 2)
      .attr("y", 200 + margin.top + 20)
      .style("text-anchor", "middle")
      .text("Test1");
  
    svg
      .append("text")
      .attr("class", "y-axis-label")
      .attr("x", -200 / 2)
      .attr("y", -margin.left + 30)
      .style("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Test2");
     */
  }