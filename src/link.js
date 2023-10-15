function handleMouseOverChoropleth(event, item) {
    this.setAttribute("fill", "rgb(210, 100, 100)");
    const circles_min = document.querySelectorAll(".circle-min.data");
    const circles_max = document.querySelectorAll(".circle-max.data");
    
    circles_min.forEach((circle) => {
        if (circle.textContent === item.properties.NAME) {
            if(!selected_countries.includes(circle.textContent)) {
                circle.setAttribute("fill", "rgb(210, 100, 100)");
            }
        }
    });
    circles_max.forEach((circle) => {
        if (circle.textContent === item.properties.NAME) {
            if(!selected_countries.includes(circle.textContent)) {
                circle.setAttribute("fill", "rgb(240, 40, 40)");
            }
        }
    });
}

function handleMouseOutChoropleth(event, item) {
    const totalCountrySales = d3.group(gd_vehicles, (d) => d.COUNTRY);
    const selectedCountrySales = d3.group(d_vehicles, (d) => d.COUNTRY);

    var currentData = {};

    totalCountrySales.forEach((sales, country) => {
        const totalSales = d3.sum(sales, (d) => +d.UNITS);
        const selectedSales = d3.sum(selectedCountrySales.get(country), (d) => +d.UNITS);
        currentData[country] = selectedSales / totalSales;
    });

    const colorScale = d3
        .scaleLog()
        .domain([
            d3.min(Object.values(currentData)),
            d3.max(Object.values(currentData)),
        ])  
        .range([0, 1]);
    if (currentData[item.properties.NAME] !== undefined) {
        this.setAttribute("fill", d3.interpolateBlues(colorScale(currentData[item.properties.NAME])));
    }
    else {
        this.setAttribute("fill", "lightgrey");
    }

    const circles_min = document.querySelectorAll(".circle-min.data");
    const circles_max = document.querySelectorAll(".circle-max.data");
    circles_min.forEach((circle) => {
        if (circle.textContent === item.properties.NAME) {
            if (!selected_countries.includes(circle.textContent)) {
                circle.setAttribute("fill", "lightblue");
            }
        }
    });
    circles_max.forEach((circle) => {
        if (circle.textContent === item.properties.NAME) {
            if (!selected_countries.includes(circle.textContent)) {
                circle.setAttribute("fill", "blue");
            }
        }
    });
}

function handleClickChoropleth(event, item) {
    if (!euCountriesMap.includes(item.properties.NAME)) {
        return;
    }
    if (selected_countries.includes(item.properties.NAME)) {
        selected_countries.splice(selected_countries.indexOf(item.properties.NAME), 1);
        // find clone with same name as this and clone class
        const clone = this.parentNode.querySelector(`[name="${item.properties.NAME}"].clone`);
        console.log("Clone:", clone);
        clone.remove();
        updateChoropleth();
        // update idiom4 circles
        const circles_min = document.querySelectorAll(".circle-min.data");
        const circles_max = document.querySelectorAll(".circle-max.data");

        const circles = [...circles_min, ...circles_max];

        circles.forEach((circle) => {
            // if textContent is in selected_countries
            if (!selected_countries.includes(circle.textContent)) {
                console.log("Circle:", circle);
                circle.setAttribute("opacity", "0.5"); 
            }
        });
        
        return;
    }
    selected_countries.push(item.properties.NAME);
    const clone = this.cloneNode(true);
    clone.removeAttribute("onclick");
    clone.removeAttribute("onmouseover");
    clone.removeAttribute("onmouseout");
    clone.setAttribute("stroke", "red");
    clone.setAttribute("stroke-width", "1");
    clone.setAttribute("opacity", "1");
    clone.setAttribute("name", item.properties.NAME);
    this.parentNode.appendChild(clone);
    clone.setAttribute("fill", "none");
    clone.setAttribute("class", "clone");
    console.log(selected_countries);
    updateChoropleth();

    const circles_min = document.querySelectorAll(".circle-min.data");
    const circles_max = document.querySelectorAll(".circle-max.data");

    const circles = [...circles_min, ...circles_max];

    circles.forEach((circle) => {
        // if textContent is in selected_countries
        if (!selected_countries.includes(circle.textContent)) {
            circle.setAttribute("opacity", "0.5");
        }
        if (selected_countries.includes(circle.textContent)) {
            circle.setAttribute("opacity", "1");
            circle.setAttribute("fill", "red");
            // redraw them on top
            circle.parentNode.appendChild(circle);
        }
    });
}

function deselectAll() {
    // clear selected_countries
    selected_countries = [];
    // clear clones
    const clones = document.querySelectorAll(".clone");
    clones.forEach((clone) => clone.remove());
    updateChoropleth();
}

var last_fill = "";
var last_country_fill = "";

function handleMouseOverIdiom4(event, item) {
    last_fill = this.getAttribute("fill");
    this.setAttribute("fill", "rgb(210, 100, 100)");
    
    const countries = document.querySelectorAll(".country.data");
    countries.forEach((country) => {
        if (country.textContent === item.COUNTRY) {
            last_country_fill = country.getAttribute("fill");
            country.setAttribute("fill", "rgb(210, 100, 100)");
        }
    });

    tooltip4.transition().duration(200).style("opacity", 0.9);
    tooltip4
        .html(`<strong>Country: </strong> ${item.COUNTRY} <br>}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 30) + "px");
}

function handleMouseOutIdiom4(event, item) {
    this.setAttribute("fill", last_fill);

    const countries = document.querySelectorAll(".country.data");
    console.log(item);
    countries.forEach((country) => {
        if (country.textContent === item.COUNTRY) {
            country.setAttribute("fill", last_country_fill);
        }
    });

}