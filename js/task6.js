const svg = d3.select("#boxplot-bmi-heart-status");
const margin = { top: 20, right: 30, bottom: 40, left: 50 },
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

// Create a tooltip
const tooltip = d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("color", "white")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("font-size", "12px")
    .style("display", "none")
    .style("pointer-events", "none");

d3.csv("../data/project_heart_disease.csv").then(data => {
    data.forEach(d => d.BMI = +d.BMI);

    const groups = d3.groups(data, d => d["Heart Disease Status"]);

    const x = d3.scaleBand()
        .domain(groups.map(d => d[0]))
        .range([0, width])
        .padding(0.4);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.BMI)])
        .range([height, 0])
        .nice();

    // Define color scale for the boxes
    const color = d3.scaleOrdinal()
        .domain(["Yes", "No"])
        .range(["#ff7f0e", "#1f77b4"]); // Orange for "Yes", Blue for "No"

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text") 
        .style("font-size", "14px") 
        .style("fill", "#ffffff"); 

    g.append("g")
        .call(d3.axisLeft(y));

    // Calculate boxplot data
    groups.forEach(([key, values]) => {
        values.sort((a, b) => a.BMI - b.BMI);
        const q1 = d3.quantile(values.map(d => d.BMI), 0.25);
        const median = d3.quantile(values.map(d => d.BMI), 0.5);
        const q3 = d3.quantile(values.map(d => d.BMI), 0.75);
        const min = d3.min(values, d => d.BMI);
        const max = d3.max(values, d => d.BMI);
        const mean = d3.mean(values, d => d.BMI);

        const boxWidth = 60; // Increase box width
        const center = x(key) + x.bandwidth() / 2;

        // Draw box
        g.append("rect")
            .attr("x", center - boxWidth / 2)
            .attr("y", y(q3))
            .attr("height", y(q1) - y(q3))
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .attr("fill", color(key)) // Use color scale for different boxes
            .on("mouseover", () => {
                tooltip.style("display", "block")
                    .html(`
                        <strong>Heart Disease Status:</strong> ${key}<br/>
                        <strong>Min BMI:</strong> ${min.toFixed(2)}<br/>
                        <strong>Q1 BMI:</strong> ${q1.toFixed(2)}<br/>
                        <strong>Mean BMI:</strong> ${mean.toFixed(2)}<br/>
                        <strong>Q3 BMI:</strong> ${q3.toFixed(2)}<br/>
                        <strong>Max BMI:</strong> ${max.toFixed(2)}<br/>
                        `);
            })
            .on("mousemove", (event) => {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 30) + "px");
            })
            .on("mouseout", () => tooltip.style("display", "none"));

            // Add X-Y-axis label
        g.append("text")
        .attr("x", width / 2) 
        .attr("y", height + 30)
        .attr("text-anchor", "middle")
        .style("font-size", "14px") 
        .style("fill", "#ffffff") 
        .text("Smoking Status"); 

        g.append("text")
        .attr("x",-(height / 2) ) 
        .attr("y",-40)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("font-size", "14px") 
        .style("fill", "#ffffff") 
        .text("BMI"); 

        // Median line
        g.append("line")
            .attr("x1", center - boxWidth / 2)
            .attr("x2", center + boxWidth / 2)
            .attr("y1", y(median))
            .attr("y2", y(median))
            .attr("stroke", "white");

        // Whiskers
        g.append("line").attr("x1", center).attr("x2", center).attr("y1", y(min)).attr("y2", y(q1)).attr("stroke", "white");
        g.append("line").attr("x1", center).attr("x2", center).attr("y1", y(q3)).attr("y2", y(max)).attr("stroke", "white");

        // Horizontal lines (whisker ends)
        g.append("line").attr("x1", center - boxWidth / 4).attr("x2", center + boxWidth / 4).attr("y1", y(min)).attr("y2", y(min)).attr("stroke", "white");
        g.append("line").attr("x1", center - boxWidth / 4).attr("x2", center + boxWidth / 4).attr("y1", y(max)).attr("y2", y(max)).attr("stroke", "white");
    });
    // Add legend
    const legend = svg.append("g")
    .attr("transform", `translate(${width - 150}, 20)`); // Vị trí của legend

    const legendData = [
    { label: "Heart Disease: Yes", color: "#ff7f0e" },
    { label: "Heart Disease: No", color: "#1f77b4" }
    ];

    legendData.forEach((d, i) => {
    const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);

    legendRow.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", d.color);

    legendRow.append("text")
        .attr("x", 25)
        .attr("y", 15)
        .text(d.label)
        .style("fill", "#ffffff")
        .style("font-size", "15px");
    });
});