<script>
    import { onMount } from "svelte";
    import * as d3 from "d3";
    import { parseDate } from "$lib/utils";

    export let data = [];

    export let svgElement;
    export let chartHeight;
    let yScale;
    let barGroup;
    let tempBar;
    let tempBar2;
    let tempAxisGroup;
    let defs;
    let gradient;

    const TEMP_MIN = -33;
    const TEMP_MAX = 0;

    function setupBar() {
        if (!svgElement) {
            return;
        }

        const svg = d3.select(svgElement);

        svg.selectAll(".temperature-bar").remove();
        svg.selectAll(".temp-axis").remove();

        const margin = { top: 20, right: 10, bottom: 60, left: 50 };
        // const chartHeight = +svg.attr("height");
        // const chartWidth = +svg.attr("width");

        const barAreaWidth = 40;

        yScale = d3
            .scaleLinear()
            .domain([TEMP_MAX, TEMP_MIN])
            .range([margin.top, chartHeight - margin.bottom]);

        barGroup = svg
            .append("g")
            .attr("class", "temperature-bar")
            .attr("transform", `translate(${margin.left + 20}, 0)`);

        const tempAxis = d3
            .axisLeft(yScale)
            .ticks(5)
            .tickFormat((d) => `${d} °C`);

        tempAxisGroup = svg
            .append("g")
            .attr("class", "temp-axis")
            .attr("transform", `translate(${margin.left + 10}, 0)`)
            .call(tempAxis)
            .attr("style", "transition: opacity 0.1s ease");

        tempAxisGroup
            .append("text")
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .attr("transform", `rotate(-90)`)
            .attr("x", -(chartHeight / 2) + 20)
            .attr("y", -50)
            .text("Temperature")
            .style("font-size", "12px");

        tempAxisGroup.selectAll(".tick text").style("font-size", "10px");

        defs = svg.append("defs");

        defs.append("linearGradient")
            .attr("id", "temp-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%")
            .selectAll("stop")
            .data([
                {offset: "0%", color: "#b3d9ff"},
                {offset: "100%", color: "#004080"}
            ])
            .enter()
            .append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

        barGroup.append("rect")
            .attr("class", "gradient-bar")
            .attr("x", 0)
            .attr("y", yScale(TEMP_MAX))
            .attr("width", 10)
            .attr("height", yScale(TEMP_MIN) - yScale(TEMP_MAX))
            .attr("fill", "url(#temp-gradient)");

        tempBar2 = barGroup
            .append("rect")
            .attr("x", 0)
            .attr("width", 10)
            .attr("fill", "white")
            .attr("style", "transition: opacity 0.1s ease")
            .attr("pointer-events", "none")
            .style("display", "block")
            .style("opacity", 0)
            .attr("y", yScale(TEMP_MAX))
            .attr("height", yScale(TEMP_MIN) - yScale(TEMP_MAX));
        tempBar = barGroup
            .append("rect")
            .attr("x", 0)
            .attr("width", 10)
            .attr("fill", "white")
            .attr("style", "transition: opacity 0.1s ease")
            .attr("pointer-events", "none");

        barGroup.append("text")
                .attr("class", "temp-placeholder-text")
                .attr("x", -67)
                .attr("y", yScale(TEMP_MAX) + 105)
                .text("No temperature")
                .attr("font-size", "12px")
                .attr("fill", "#555")
                .attr("style", "transition: opacity 0.1s ease");
        barGroup.append("text")
                .attr("class", "temp-placeholder-text")
                .attr("x", -70)
                .attr("y", yScale(TEMP_MAX) + 118)
                .text("data for this date")
                .attr("font-size", "12px")
                .attr("fill", "#555")
                .attr("style", "transition: opacity 0.1s ease");
    }

    onMount(() => {
        setupBar();
    });

    $: if (svgElement) {
        setupBar();
    }

    $: if (tempBar && yScale && tempAxisGroup) {
        const pointWithTemp = data.find(
            (d) => typeof d.temp === "number" && !Number.isNaN(d.temp),
        );

        if (pointWithTemp) {
            const temp = pointWithTemp.temp;

            const yBottom = yScale(temp);

            tempBar
                .style("display", "block")
                .attr("y", yBottom)
                .attr("height", yScale(TEMP_MIN) - yBottom);

            tempAxisGroup.style("opacity", 1).style("pointer-events", "all");
            barGroup.selectAll(".temp-placeholder-text").style("opacity", 0);
            tempBar2.style("opacity", 0);

        } else {
            if (
                data.length > 0 &&
                parseDate(data[0].date) > parseDate("1812-12-06")
            ) {
                const temp = -26;
                const yBottom = yScale(temp);

                tempBar
                    .style("display", "block")
                    .attr("y", yBottom)
                    .attr("height", yScale(TEMP_MIN) - yBottom);

            } else {
                tempBar.style("display", "block")
                       .attr("y", yScale(TEMP_MAX))
                       .attr("height", yScale(TEMP_MIN) - yScale(TEMP_MAX))
                       .style("opacity", 1);
            }

            tempAxisGroup.style("opacity", 0.1).style("pointer-events", "none");
            barGroup.selectAll(".temp-placeholder-text").style("opacity", 0.8);
            tempBar2.style("opacity", 0.9);
        }
    }
</script>
