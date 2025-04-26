<script>
    import {onMount} from "svelte";
    import * as d3 from "d3";

    export let data = [];

    export let svgElement;
    export let x;
    export let y;
    // let svg;
    let yScale;
    let barGroup;
    let tempBar;

    const TEMP_MIN = -35;
    const TEMP_MAX = 0;

    function setupBar()
    {
        if (!svgElement)
        {
            return;
        }

        const svg = d3.select(svgElement);

        svg.selectAll(".temperature-bar").remove();
        svg.selectAll(".temp-axis").remove();

        const margin = {top: 20, right: 10, bottom: 60, left: 50};
        const chartHeight = +svg.attr("height");
        const chartWidth = +svg.attr("width");

        const barAreaWidth = 40;

        yScale = d3.scaleLinear()
            .domain([TEMP_MAX, TEMP_MIN])
            .range([margin.top, chartHeight - margin.bottom]);

        barGroup = svg.append("g")
            .attr("class", "temperature-bar")
            .attr("transform", `translate(${margin.left + 20}, 0)`);

        const tempAxis = d3.axisLeft(yScale)
            .ticks(5)
            .tickFormat(d => `${d} °C`);

        svg.append("g")
            .attr("class", "temp-axis")
            .attr("transform", `translate(${margin.left + 10}, 0)`)
            .call(tempAxis)
            .append("text")
            .attr("fill", "black")
            .attr("text-anchor", "middle")
            .attr("transform", `rotate(-90)`)
            .attr("x", -(chartHeight/2)+20)
            .attr("y", -50)
            .text("Temperature")
            .style("font-size", "12px")
            .selectAll(".tick text")
            .style("font-size", "10px");

        tempBar = barGroup.append("rect")
            .attr("x", 0)
            .attr("width", 10)
            .attr("fill", "steelblue")
            .attr("opacity", 0.8)
            .style("display", "none");
    }

    onMount(() => {
        setupBar();
    });

    $: if (svgElement)
    {
        setupBar();
    }

    $: if (tempBar && yScale)
    {
        const pointWithTemp = data.find(d => typeof d.temp === "number" && !Number.isNaN(d.temp));

        if (pointWithTemp)
        {
            const temp = pointWithTemp.temp;

            const yTop = yScale(TEMP_MAX);
            const yBottom = yScale(temp);

            tempBar.attr("y", yTop)
                   .attr("height", yBottom - yTop)
                   .style("display", "block");
        }
        else
        {
            tempBar.style("display", "none");
        }
    }
</script>

<style>
    .temperature-bar rect {
        transition: all 0.3s ease;
    }
</style>