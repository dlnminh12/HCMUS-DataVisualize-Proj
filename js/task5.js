d3.csv("../data/project_heart_disease.csv").then(function(data) {
    // Chuẩn bị dữ liệu
    const cholesterolData = data.filter(d => d["Cholesterol Level"] && d["Heart Disease Status"]);
    cholesterolData.forEach(d => d["Cholesterol Level"] = +d["Cholesterol Level"]);

    const grouped = d3.group(cholesterolData, d => d["Heart Disease Status"]);
    const boxData = Array.from(grouped, ([key, values]) => {
        const sorted = values.map(d => d["Cholesterol Level"]).sort(d3.ascending);
        return {
            key,
            q1: d3.quantile(sorted, 0.25),
            mean: d3.mean(sorted),
            q3: d3.quantile(sorted, 0.75),
            min: d3.min(sorted),
            max: d3.max(sorted)
        };
    });

    // Thiết lập kích thước và margin
    const svg = d3.select("#task5-chart");
    const margin = { top: 40, right: 100, bottom: 70, left: 60 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;

    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Tạo scale
    const x = d3.scaleBand()
        .domain(boxData.map(d => d.key))
        .range([0, width])
        .padding(0.5);

    const y = d3.scaleLinear()
        .domain([140, d3.max(boxData, d => d.max)])
        .nice()
        .range([height, 0]);

    // Vẽ trục
    chart.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    chart.append("g")
        .call(d3.axisLeft(y));

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#333")
        .style("color", "#fff")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // Vẽ box
    const boxWidth = 60;
    chart.selectAll("box")
        .data(boxData)
        .enter()
        .append("rect")
        .attr("x", d => x(d.key) + (x.bandwidth() - boxWidth) / 2)
        .attr("y", d => y(d.q3))
        .attr("height", d => y(d.q1) - y(d.q3))
        .attr("width", boxWidth)
        .attr("stroke", "#fff")
        .attr("fill", "#00acc1")
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(
                `<strong>${d.key}</strong><br/>
                 Min: ${d.min}<br/>
                 Q1: ${d.q1}<br/>
                 Mean: ${d.mean.toFixed(2)}<br/>
                 Q3: ${d.q3}<br/>
                 Max: ${d.max}`
            )
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0));

    // Vẽ đường mean
    chart.selectAll("meanLine")
        .data(boxData)
        .enter()
        .append("line")
        .attr("x1", d => x(d.key) + (x.bandwidth() - boxWidth) / 2)
        .attr("x2", d => x(d.key) + (x.bandwidth() - boxWidth) / 2 + boxWidth)
        .attr("y1", d => y(d.mean))
        .attr("y2", d => y(d.mean))
        .attr("stroke", "white")
        .style("stroke-width", 2);

    // Vẽ đường min-max
    chart.selectAll("whisker")
        .data(boxData)
        .enter()
        .append("line")
        .attr("x1", d => x(d.key) + x.bandwidth() / 2)
        .attr("x2", d => x(d.key) + x.bandwidth() / 2)
        .attr("y1", d => y(d.min))
        .attr("y2", d => y(d.max))
        .attr("stroke", "white")
        .style("stroke-width", 2);

    // Tên trục X
    chart.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("fill", "white")
        .style("font-size", "14px")
        .text("Heart Disease Status");

    // Tên trục Y
    chart.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("fill", "white")
        .style("font-size", "14px")
        .text("Cholesterol Level (mg/dL)");
});
