// Load and process data
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

    // SVG setup
    const width = 800;
    const height = 500;
    const margin = { top: 40, right: 100, bottom: 70, left: 60 };

    const svg = d3.select("#task4-chart")
        .attr("width", width)
        .attr("height", height);

    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Scales
    const x0 = d3.scaleBand()
        .domain(exerciseGroups.map(d => d.group))
        .range([0, chartWidth])
        .paddingInner(0.2);

    const x1 = d3.scaleBand()
        .domain(["No", "Yes"])
        .range([0, x0.bandwidth()])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(exerciseGroups, d => Math.max(d.No, d.Yes)) * 1.1])
        .nice()
        .range([chartHeight, 0]);

    const color = d3.scaleOrdinal()
        .domain(["No", "Yes"])
        .range(["#4caf50", "#f44336"]);

    // Tooltip
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

    // Draw bars
    const bars = chart.selectAll(".bar-group")
        .data(exerciseGroups)
        .enter()
        .append("g")
        .attr("class", "bar-group")
        .attr("transform", d => `translate(${x0(d.group)}, 0)`);

    bars.selectAll("rect")
        .data(d => ["No", "Yes"].map(key => ({ key, value: d[key], group: d.group })))
        .enter()
        .append("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => chartHeight - y(d.value))
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
        });

    // Labels on bars
    bars.selectAll("text")
        .data(d => ["No", "Yes"].map(key => ({ key, value: d[key] })))
        .enter()
        .append("text")
        .attr("x", d => x1(d.key) + x1.bandwidth() / 2)
        .attr("y", d => y(d.value) - 5)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .style("font-size", "12px")
        .text(d => d.value);

    // Axes
    chart.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(x0));

    chart.append("g")
        .call(d3.axisLeft(y));

    // Tên trục
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
