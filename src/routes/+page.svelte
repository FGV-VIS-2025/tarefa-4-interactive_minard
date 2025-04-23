<script>
    import {onMount} from "svelte";
    import * as d3 from "d3";
    import {join} from "$lib/join";

    export let data;

    var army = data.army;
    var temperature = data.temperature;

    const armyWithTemp = join(army, temperature);
    console.log(armyWithTemp);

    let svgElement;

    onMount(() => {
        const width = 600;
        const height = 400;
        const margin = {top: 20, right: 30, bottom: 30, left: 40};

        const svg = d3.select(svgElement)
            .attr("width", width)
            .attr("height", height);

        const x = d3.scaleLinear()
            .domain(d3.extent(army, d => d.lon))
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain(d3.extent(army, d => d.lat))
            .range([height - margin.bottom, margin.top]);

        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(y));

        svg.selectAll("circle")
            .data(army)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.lon))
            .attr("cy", d => y(d.lat))
            .attr("r", d => d.size / 10000)
            .attr("fill", d => d.direction === "A" ? "steelblue" : "tomato")
            .attr("opacity", 0.7);
    })
</script>


<h1>Interactive Minard</h1>

<svg bind:this={svgElement}>

</svg>