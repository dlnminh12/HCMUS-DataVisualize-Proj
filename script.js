
//toggle sidebar
var sidebarOpen = false;
var sidebar = document.getElementById("sidebar");  

function openSidebar(){
    if(!sidebarOpen){
        sidebar.add("sidebar-responsive");
        sidebarOpen = true;
    }
}

function closeSidebar(){
    if(sidebarOpen){
        sidebar.remove("sidebar-responsive");
        sidebarOpen = false;
    }
}

const svg = d3.select("#stacked-bar-chart-age-gender"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    margin = { top: 40, right: 30, bottom: 50, left: 60 },
    chartWidth = width - margin.left - margin.right,
    chartHeight = height - margin.top - margin.bottom;

const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

function getAgeGroup(age) {
    const floor = Math.floor(age / 10) * 10;
    return `${floor}-${floor + 9}`;
}

d3.csv("../data/project_heart_disease.csv").then(function(data) {
    // Step 1: Convert Age to number and classify Age Group
    data.forEach(d => {
        d.Age = +d.Age; //string to number
        d.ageGroup = getAgeGroup(d.Age);
        d.Gender = d.Gender.trim();
    });

    // Step 2: Count occurrences by ageGroup and gender
    const grouped = d3.rollup(
        data,
        v => ({
            Male: v.filter(d => d.Gender === 'Male').length,
            Female: v.filter(d => d.Gender === 'Female').length
        }),
        d => d.ageGroup
    );

    // Step 3: Format data
    const chartData = Array.from(grouped, ([ageGroup, values]) => ({
        ageGroup,
        Male: values.Male,
        Female: values.Female
    }));

    // Step 4: Stack data
    const stack = d3.stack().keys(["Male", "Female"]);
    const stackedData = stack(chartData);

    // Step 5: Scales

    chartData.sort((a, b) => {
        const ageA = parseInt(a.ageGroup.split('-')[0], 10);
        const ageB = parseInt(b.ageGroup.split('-')[0], 10);
        return ageA - ageB;
    });
    
    const x = d3.scaleBand()
        .domain(chartData.map(d => d.ageGroup))
        .range([0, chartWidth])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.Male + d.Female)])
        .nice()
        .range([chartHeight, 0]);

    const color = d3.scaleOrdinal()
        .domain(["Male", "Female"])
        .range(["#1f77b4", "#ff69b4"]);

// Create a tooltip
const tooltip = d3.select("#tooltip");


// Step 6: Draw bars with tooltip functionality
chart.selectAll("g.layer")
    .data(stackedData)
    .join("g")
    .attr("class", "layer")
    .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
    .attr("x", d => x(d.data.ageGroup))
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .on("mouseover", function (event, d) {
        // Show tooltip
        tooltip.style("display", "block")
        .html(`
            <div style="display: flex; align-items: center;">
                <div style="width: 10px; height: 10px; background-color: ${color("Male")}; margin-right: 5px;"></div>
                <strong>Male:</strong> ${d.data.Male}
            </div>
            <div style="display: flex; align-items: center;">
                <div style="width: 10px; height: 10px; background-color: ${color("Female")}; margin-right: 5px;"></div>
                <strong>Female:</strong> ${d.data.Female}
            </div>
            <strong>Total:</strong> ${d.data.Male + d.data.Female}
        `);        d3.select(this).style("opacity", 0.8); // Highlight the bar
    })
    .on("mousemove", function (event) {
        // Position tooltip near the cursor
        tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", function () {
        // Hide tooltip
        tooltip.style("display", "none");
        d3.select(this).style("opacity", 1); // Reset bar opacity
    });
    // Step 7: Axes
    chart.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x));

    chart.append("g")
        .call(d3.axisLeft(y));

    // Step 8: Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 120}, 30)`);

    ["Male", "Female"].forEach((key, i) => {
        const g = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);

        g.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(key));

        g.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .text(key)
            .style("fill","#ffffff");
    });
});
