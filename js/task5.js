const svg = d3.select("#boxplot-Cholesterol-Level-heart-status");
const margin = { top: 20, right: 30, bottom: 40, left: 50 },
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);


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
    data.forEach(d => d["Cholesterol Level"] = +d["Cholesterol Level"]);

    const groups = d3.groups(data, d => d["Heart Disease Status"]);

    const x = d3.scaleBand()
        .domain(groups.map(d => d[0]))
        .range([0, width])
        .padding(0.4);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d["Cholesterol Level"])])
        .range([height, 0])
        .nice();


    const color = d3.scaleOrdinal()
        .domain(["Yes", "No"])
        .range(["#ff7f0e", "#1f77b4"]); 

    // Hidden axes
    const yAxisScaleStart = d3.scaleLinear()
        .domain([0, 0])
        .range([height, height]);

    const yAxis = g.append("g")
        .call(d3.axisLeft(yAxisScaleStart).ticks(5));

    const xAxis = g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(d3.scaleBand().domain(groups.map(d => d[0])).range([0, 0])));

    // Animate axes
    setTimeout(() => {
        yAxis.transition()
            .duration(1000)
            .ease(d3.easeCubicOut)
            .call(d3.axisLeft(y));

        xAxis.transition()
            .duration(1000)
            .ease(d3.easeCubicOut)
            .call(d3.axisBottom(x));
    }, 100);

    // Animate boxplot elements
    setTimeout(() => {
        groups.forEach(([key, values]) => {
            values.sort((a, b) => a["Cholesterol Level"] - b["Cholesterol Level"]);
            const q1 = d3.quantile(values.map(d => d["Cholesterol Level"]), 0.25);
            const median = d3.quantile(values.map(d => d["Cholesterol Level"]), 0.5);
            const q3 = d3.quantile(values.map(d => d["Cholesterol Level"]), 0.75);
            const min = d3.min(values, d => d["Cholesterol Level"]);
            const max = d3.max(values, d => d["Cholesterol Level"]);

            const boxWidth = 60;
            const center = x(key) + x.bandwidth() / 2;

            // Box
            g.append("rect")
                .attr("x", center - boxWidth / 2)
                .attr("y", y(0)) 
                .attr("height", 0) 
                .attr("width", boxWidth)
                .attr("stroke", "black")
                .attr("fill", color(key))
                .on("mouseover", () => {
                    tooltip.style("display", "block")
                        .html(`
                            <strong>Heart Disease Status:</strong> ${key}<br/>
                            <strong>Min Cholesterol Level:</strong> ${min.toFixed(2)}<br/>
                            <strong>Q1 Cholesterol Level:</strong> ${q1.toFixed(2)}<br/>
                            <strong>Median Cholesterol Level:</strong> ${median.toFixed(2)}<br/>
                            <strong>Q3 Cholesterol Level:</strong> ${q3.toFixed(2)}<br/>
                            <strong>Max Cholesterol Level:</strong> ${max.toFixed(2)}<br/>
                        `);
                })
                .on("mousemove", (event) => {
                    tooltip.style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 30) + "px");
                })
                .on("mouseout", () => tooltip.style("display", "none"))
                .transition()
                .duration(1000)
                .attr("y", y(q3)) // Animate to Q3 position
                .attr("height", y(q1) - y(q3)); // Animate to correct height

            // Median line
            g.append("line")
                .attr("x1", center - boxWidth / 2)
                .attr("x2", center + boxWidth / 2)
                .attr("y1", y(0)) 
                .attr("y2", y(0)) 
                .attr("stroke", "white")
                .transition()
                .duration(1000)
                .attr("y1", y(median))
                .attr("y2", y(median));

            // Whiskers
            g.append("line")
                .attr("x1", center)
                .attr("x2", center)
                .attr("y1", y(0)) 
                .attr("y2", y(0)) 
                .attr("stroke", "white")
                .transition()
                .duration(1000)
                .attr("y1", y(min))
                .attr("y2", y(q1));

            g.append("line")
                .attr("x1", center)
                .attr("x2", center)
                .attr("y1", y(0)) 
                .attr("y2", y(0)) 
                .attr("stroke", "white")
                .transition()
                .duration(1000)
                .attr("y1", y(q3))
                .attr("y2", y(max));

            // Horizontal lines
            g.append("line")
                .attr("x1", center - boxWidth / 4)
                .attr("x2", center + boxWidth / 4)
                .attr("y1", y(0)) 
                .attr("y2", y(0)) 
                .attr("stroke", "white")
                .transition()
                .duration(1000)
                .attr("y1", y(min))
                .attr("y2", y(min));

            g.append("line")
                .attr("x1", center - boxWidth / 4)
                .attr("x2", center + boxWidth / 4)
                .attr("y1", y(0)) 
                .attr("y2", y(0)) 
                .attr("stroke", "white")
                .transition()
                .duration(1000)
                .attr("y1", y(max))
                .attr("y2", y(max));
        });
    }, 1000);

    g.append("text")
    .attr("x", width / 2)
    .attr("y", height + 35)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "#ffffff")
    .text("Heart Disease Status");

    g.append("text")
    .attr("x", -height / 2)
    .attr("y", -30)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "#ffffff")
    .text("Cholesterol Level");

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 150}, 20)`);

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