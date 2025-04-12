d3.csv("../data/project_heart_disease.csv").then(function(data) {
    // Filter and group data
    const filtered = data.filter(d => d["Exercise Habits"] && d["Heart Disease Status"]);
    const nested = d3.rollup(
        filtered,
        v => v.length,
        d => d["Exercise Habits"],
        d => d["Heart Disease Status"]
    );

    const exerciseGroups = Array.from(nested, ([group, val]) => {
        return {
            group,
            No: val.get("No") || 0,
            Yes: val.get("Yes") || 0
        };
    });

    const margin = { top: 40, right: 100, bottom: 70, left: 60 };

    const svg = d3.select("#task4-chart"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    
    const x0 = d3.scaleBand()
        .domain(exerciseGroups.map(d => d.group))
        .range([0, chartWidth])
        .paddingInner(0.2);

    const x1 = d3.scaleBand()
        .domain(["Yes", "No"])
        .range([0, x0.bandwidth()])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(exerciseGroups, d => Math.max(d.No, d.Yes)) * 1.1])
        .nice()
        .range([chartHeight, 0]);

    const color = d3.scaleOrdinal()
        .domain(["Yes", "No"])
        .range(["#4caf50", "#f44336"]);

    
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("padding", "8px")
        .style("background", "#333")
        .style("color", "#fff")
        .style("border-radius", "4px")
        .style("font-size", "13px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // Draw hidden axes
    const yAxisScaleStart = d3.scaleLinear()
        .domain([0, 0])
        .range([chartHeight, chartHeight]);

    const yAxis = chart.append("g")
        .call(d3.axisLeft(yAxisScaleStart).ticks(5));

    const xAxis = chart.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(d3.scaleBand().domain(exerciseGroups.map(d => d.group)).range([0, 0])));

    // Animate axes
    setTimeout(() => {
        yAxis.transition()
            .duration(1000)
            .ease(d3.easeCubicOut)
            .call(d3.axisLeft(y));

        xAxis.transition()
            .duration(1000)
            .ease(d3.easeCubicOut)
            .call(d3.axisBottom(x0));
    }, 100);

    // Animate bars
    setTimeout(() => {
        const bars = chart.selectAll(".bar-group")
            .data(exerciseGroups)
            .join("g")
            .attr("class", "bar-group")
            .attr("transform", d => `translate(${x0(d.group)}, 0)`);

        bars.selectAll("rect")
            .data(d => ["No", "Yes"].map(key => ({ key, value: d[key], group: d.group })))
            .join("rect")
            .attr("x", d => x1(d.key))
            .attr("y", y(0)) 
            .attr("width", x1.bandwidth())
            .attr("height", 0)
            .attr("fill", d => color(d.key))
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(200).style("opacity", 0.95);
                tooltip.html(
                    `Exercise Habits: <b>${d.group}</b><br/>
                    Heart Disease Status: <b>${d.key}</b><br/>
                    No of Records: <b>${d.value}</b>`
                );
            })
            .on("mousemove", function(event) {
                tooltip
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 100) + "px");
            })
            .on("mouseout", function() {
                tooltip.transition().duration(500).style("opacity", 0);
            })
            .transition()
            .duration(1000)
            .attr("y", d => y(d.value)) 
            .attr("height", d => chartHeight - y(d.value)); 
    }, 1000);

    // Axis labels
    chart.append("text")
        .attr("text-anchor", "middle")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight + 50)
        .attr("fill", "white")
        .style("font-size", "14px")
        .text("Exercise Habits");

    chart.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight / 2)
        .attr("y", -45)
        .attr("fill", "white")
        .style("font-size", "14px")
        .text("Number of Records");

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 190}, ${margin.top})`);

    ["No", "Yes"].forEach((key, i) => {
        const row = legend.append("g")
            .attr("transform", `translate(0, ${i * 25})`);

        row.append("rect")
            .attr("width", 14)
            .attr("height", 14)
            .attr("fill", color(key));

        row.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .attr("fill", "white")
            .style("font-size", "13px")
            .text(`Heart Disease Status: ${key}`);
    });
});