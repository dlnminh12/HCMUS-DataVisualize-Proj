// -----------------------Chart for task 3-------------------/
const svg3 = d3.select("#grouped-bar-chart-smoking-heart-status"),
    width3 = +svg3.attr("width"),
    height3 = +svg3.attr("height"),
    margin3 = { top: 40, right: 30, bottom: 50, left: 60 },
    chartWidth3 = width3 - margin3.left - margin3.right,
    chartHeight3 = height3 - margin3.top - margin3.bottom;

const chart3 = svg3.append("g")
    .attr("transform", `translate(${margin3.left},${margin3.top})`);

d3.csv("../data/project_heart_disease.csv").then(function(data) {
    data.forEach(d => {
        d.Smoking = d.Smoking.trim();
        d["Heart Disease Status"] = d["Heart Disease Status"].trim();
    });

    // count as group
    const grouped = d3.rollup(
        data,
        v => v.length,
        d => d.Smoking,
        d => d["Heart Disease Status"]
    );

    // Convert to array for charting
    const keys = ["Yes", "No"]; // Heart Disease Status
    const chartData = Array.from(grouped, ([smoking, values]) => {
        const row = { Smoking: smoking };
        keys.forEach(k => {
            row[k] = values.get(k) || 0;
        });
        return row;
    });

    // Scales
    const x0 = d3.scaleBand()
        .domain(chartData.map(d => d.Smoking))
        .range([0, chartWidth3])
        .padding(0.4);

    const x1 = d3.scaleBand()
        .domain(keys)
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d3.max(keys, key => d[key]))])
        .nice()
        .range([chartHeight3, 0]);

    const color = d3.scaleOrdinal()
        .domain(keys)
        .range(["#4daf4a", "#e41a1c"]); // Yes/No - Heart Disease Status


// Draw grouped bars with tooltip functionality
const tooltip = d3.select("#tooltip");
chart3.append("g")
    .selectAll("g")
    .data(chartData)
    .join("g")
    .attr("transform", d => `translate(${x0(d.Smoking)},0)`)
    .selectAll("rect")
    .data(d => keys.map(key => ({ key, value: d[key], total: d["Yes"] + d["No"], smoking: d.Smoking })))
    .join("rect")
    .attr("x", d => x1(d.key))
    .attr("y", d => y(d.value))
    .attr("width", x1.bandwidth())
    .attr("height", d => chartHeight3 - y(d.value))
    .attr("fill", d => color(d.key))
    .on("mouseover", function (event, d) {
        // Show tooltip
        tooltip.style("display", "block")
            .html(`
                <strong>Smoking Status:</strong> ${d.smoking}<br>
                <strong> Heart disease status <strong>${d.key}:</strong> ${d.value}<br>
            `);
        d3.select(this).style("opacity", 0.8); // Highlight the bar
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

    // Axes
    chart3.append("g")
        .attr("transform", `translate(0,${chartHeight3})`)
        .call(d3.axisBottom(x0));

    chart3.append("g")
        .call(d3.axisLeft(y));


    //Add X-Y-axis label
    chart3.append("text")
    .attr("x", chartWidth3 / 2) 
    .attr("y", chartHeight3 + 40)
    .attr("text-anchor", "middle")
    .style("font-size", "14px") 
    .style("fill", "#ffffff") 
    .text("Smoking Status"); 

    chart3.append("text")
    .attr("x", -(chartHeight3 / 2)) 
    .attr("y",-40)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .style("font-size", "14px") 
    .style("fill", "#ffffff") 
    .text("Records"); 

    // Legend
    const legend = svg3.append("g")
        .attr("transform", `translate(${width3-200}, 20)`);

    keys.forEach((key, i) => {
        const g = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
        g.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", color(key));
        g.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(`Heart Disease: ${key}`)
        .style("fill", "#ffffff")
    });
});
