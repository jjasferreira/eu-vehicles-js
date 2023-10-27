function handleMouseOverChoropleth(event, item) {
    if (all_countries.includes(item.properties.NAME)) {
        this.setAttribute("stroke-width", "1.5");
        this.setAttribute("stroke", "rgb(240, 70, 70)");
        this.parentNode.appendChild(this); // move country to end of parent's child nodes
        // find circles in idiom4
        const circles_min = document.querySelectorAll(".circle-min.data");
        const circles_max = document.querySelectorAll(".circle-max.data");
        
        const circles = [...circles_min, ...circles_max];

        circles.forEach((circle) => {
            if (circle.getAttribute("country") === item.properties.NAME) {
                circle.setAttribute("stroke", "yellow");
                circle.setAttribute("stroke-width", "1.5");
                circle.parentNode.appendChild(circle); // move circle to end of parent's child nodes
            }
        });
        // tooltip already exists

        tooltip3
            .style("left", event.pageX + "px")
            .style("top", event.pageY + "px")
            
        // select tooltip div and update its text
        tooltip3
            .select("div")
            // Add a rectangle behind the tooltip text
            .html(`Country: ${item.properties.NAME} <br> Ratio of selected vehicle sales to total: ${(100*this.getAttribute("data")).toFixed(2)}% <br>`);
        
        // Show the tooltip
        tooltip3.transition()
            .duration(200)
            .style("opacity", 0.9)
            .style("visibility", "visible");
    }
}

function handleMouseOutChoropleth(event, item) {
    if (!selected_countries.includes(item.properties.NAME)) {
        this.setAttribute("stroke-width", "0.5");
    }
    this.setAttribute("stroke", "black");

    const circles_min = document.querySelectorAll(".circle-min.data");
    const circles_max = document.querySelectorAll(".circle-max.data");
    circles_min.forEach((circle) => {
        if (circle.getAttribute("country") === item.properties.NAME) {
            if (!selected_countries.includes(circle.textContent)) {
                circle.setAttribute("stroke-width", "0.5");
            }
            circle.setAttribute("stroke", "black");
        }
    });
    circles_max.forEach((circle) => {
        if (circle.getAttribute("country") === item.properties.NAME) {
            if (!selected_countries.includes(circle.textContent)) {
                circle.setAttribute("stroke-width", "0.5");
            }
            circle.setAttribute("stroke", "black");
        }
    });
    tooltip3.transition()
        .duration(200)
        .style("opacity", 0)
        .style("visibility", "hidden");
        
}

function handleClickChoropleth(event, item) {
    if (!all_countries.includes(item.properties.NAME)) {
        return;
    } // make sure it's an EU country
    if (selected_countries.includes(item.properties.NAME)) {
        selected_countries.splice(selected_countries.indexOf(item.properties.NAME), 1);
        update4();
        updateChoropleth();
        updateDotPlot();
        return;
    }
    selected_countries.push(item.properties.NAME);
    update4();
    updateChoropleth();
    updateDotPlot();
}

function deselectAll() {
    // clear selected_countries
    selected_countries = [];
    // clear clones
    const clones = document.querySelectorAll(".clone");
    clones.forEach((clone) => clone.remove());
    updateChoropleth();
    update4();
    updateDotPlot();

}

function handleMouseOver4(event, item) {
    // Changes on Idiom 3
    const countries = document.querySelectorAll(".country.data");
    countries.forEach((country) => {
        if (country.textContent === item) {
            country.setAttribute("stroke", "rgb(240, 70, 70)");
            country.setAttribute("stroke-width", "1.5");
        }
    });
    // Changes on Idiom 4
    document.querySelectorAll(".line.data").forEach((line) => {
        if (line.getAttribute("country") === item) {
            line.setAttribute("stroke", "yellow");
            line.setAttribute("opacity", "1");
            line.parentNode.appendChild(line);
        }
    });
    const circles_min = document.querySelectorAll(".circle-min.data");
    const circles_max = document.querySelectorAll(".circle-max.data");
    circles = [...circles_min, ...circles_max];
    circles.forEach((circle) => {
        if (circle.getAttribute("country") === item) {
            circle.setAttribute("stroke", "yellow");
            circle.setAttribute("stroke-width", "1.5");
            circle.parentNode.appendChild(circle);
        }
    });
    // Show the tooltip
    tooltip4
        .transition()
        .duration(250)
        .style("opacity", 0.9);
    tooltip4
        .html(`<strong> ${item} </strong> <br>
        <i>Air pollutants: </i> ${(this.getAttribute("x-data"))} kg <br>
        <i>Selected vehicles sold: </i> ${(this.getAttribute("y-data"))} <br>
        <i>GDP: </i> €${(this.getAttribute("r-data"))}M`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 30) + "px")
        .style("visibility", "visible");
}

function handleMouseOut4(event, item) {
    if (!selected_countries.includes(item)) {        
        this.setAttribute("stroke-width", "0.5");
    }
    this.setAttribute("stroke", "black");
    // Changes on Idiom 3
    const countries = document.querySelectorAll(".country.data");
    countries.forEach((country) => {
        if (country.textContent === item) {
            if (!selected_countries.includes(country.textContent)) {
                country.setAttribute("stroke-width", "0.5");
            }
            country.setAttribute("stroke", "black");
        }
    });
    // Changes on Idiom 4
    document.querySelectorAll(".line.data").forEach((line) => {
        if (line.getAttribute("country") === item) {
            line.setAttribute("stroke", "url(#line-gradient)");
            line.setAttribute("opacity", "0.65");
            line.parentNode.appendChild(line);
        }
    });
    const circles_min = document.querySelectorAll(".circle-min.data");
    const circles_max = document.querySelectorAll(".circle-max.data");
    circles = [...circles_min, ...circles_max];
    circles.forEach((circle) => {
        if (circle.getAttribute("country") === item) {
            circle.setAttribute("stroke", "black");
            circle.setAttribute("stroke-width", "1");
            circle.parentNode.appendChild(circle);
        }
    });
    // Hide the tooltip
    tooltip4
        .transition()
        .duration(500)
        .style("opacity", 0)
        .style("visibility", "hidden");
}

function handleClick4(event, item) {
    if (selected_countries.includes(item.COUNTRY)) {
        selected_countries.splice(selected_countries.indexOf(item.COUNTRY), 1);
    } else {
        selected_countries.push(item.COUNTRY);
    }
    console.log("I'm here")
    updateChoropleth();
    update4();
    updateDotPlot();
}


// Cleveland dot Plot Mouse over interactions
function handleMouseOver2(event, item) {
    // Show the tooltip
    tooltip4
        .transition()
        .duration(250)
        .style("opacity", 0.9);
    tooltip4
        .html(`<strong> ${item.COUNTRY} </strong> <br>
        <i>${item.INDEX}: </i> ${parseFloat(item.VALUE).toFixed(2)}<br>`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 30) + "px")
        .style("visibility", "visible");
}
// Cleveland dot Plot Mouse out interactions
function handleMouseOut2(event, item) {
    // Hide the tooltip
    tooltip4
        .transition()
        .duration(500)
        .style("opacity", 0)
        .style("visibility", "hidden");
}
// Cleveland dot Plot click interactions
function handleClickDotPlot(event, item) {
    if (selected_countries.includes(item.COUNTRY)) {
        selected_countries.splice(selected_countries.indexOf(item.COUNTRY), 1);
        update4();
        updateChoropleth();
        updateDotPlot();
        return;
    }
    else {
        selected_countries.push(item.COUNTRY);
        update4();
        updateChoropleth();
        updateDotPlot();
        return;
    }
}

// Helper function for Cleveland dot Plot buttons
function sortSelectedCountries(selectedIndex) {
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
    const averageData = calculateAverageValues(gd_indexes, minYear, maxYear);
    all_countries.sort((a, b) => {
        const valueA = averageData.find((d) => d.COUNTRY === a && d.INDEX === selectedIndex);
        const valueB = averageData.find((d) => d.COUNTRY === b && d.INDEX === selectedIndex);
        
        if (valueA && valueB) {
            return valueA.VALUE - valueB.VALUE;
        }
        
        return 0; // Handle cases where data is missing for a country
    });
}

// Cleveland dot Plot button click
function handleButtonClickDotPlot(event, item) {
    selectedIndex = item;
    const buttons = document.querySelectorAll(".button")
    buttons.forEach((button) => {
        if (button.textContent == item) {
            button.setAttribute("stroke-widht", "1");
            button.setAttribute("opacity", "1");
        }
        else {
            button.setAttribute("stroke-widht", "0.5");
            button.setAttribute("opacity", "0.8");
        }
    })
    sortSelectedCountries(selectedIndex)
    updateDotPlot();
}
function handleActivateDotPlot(event, item) {
    if (!deactivatedIndexes.includes(item) && deactivatedIndexes.length == 4) {
        return;
    }
    else if (deactivatedIndexes.includes(item)) {
        deactivatedIndexes.splice(deactivatedIndexes.indexOf(item), 1);
        this.setAttribute("opacity", "1");
    }
    else if (!deactivatedIndexes.includes(item)) {
        deactivatedIndexes.push(item);
        this.setAttribute("opacity", "0.5");
    }
    updateDotPlot();
}

function handleMouseOverLineChart(event, item) {
    tooltip1.html("Units sold: " + item.UNITS)
        .style("left", event.pageX + "px")
        .style("top", event.pageY + "px");
    tooltip1.transition()
        .duration(200)
        .style("opacity", .9)
        .style("visibility", "visible");
}

function handleMouseOutLineChart() {
    tooltip1.transition()
        .duration(500)
        .style("opacity", 0)
        .style("visibility", "hidden");
}