<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let data = [];
  export let size = 80; // Variável para o tamanho, sempre quadrado

  let doughnutSvg;

  // Atualiza a soma dos tamanhos sempre que a data mudar
  $: sumSize = data ? data.reduce((acc, d) => acc + d.size, 0) : 0;

  onMount(() => {
    // Cria o grupo inicialmente
    d3.select(doughnutSvg)
    .append("g")
    .attr("transform", `translate(${size / 2}, ${size / 2})`);
  });

  // Redesenha sempre que data, sumSize ou size mudarem
  $: if (doughnutSvg && sumSize) {
    const radius = size / 2;
    const total = 400000; // valor total fixo para o cálculo

    const svg = d3.select(doughnutSvg);
    svg.selectAll("*").remove();

    const group = svg.append("g")
    .attr("transform", `translate(${size / 2}, ${size / 2})`);

    const arc = d3.arc()
    .innerRadius(radius * 0.6)
    .outerRadius(radius)
    .startAngle(0)
    .endAngle(2 * Math.PI * (sumSize / total));

    const backgroundArc = d3.arc()
    .innerRadius(radius * 0.6)
    .outerRadius(radius)
    .startAngle(2 * Math.PI * (sumSize / total))
    .endAngle(2 * Math.PI);

    group.append("path")
    .attr("d", backgroundArc)
    .attr("fill", "#eee");

    group.append("path")
    .attr("d", arc)
    .attr("fill", "#cf9e96");

    group.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", ".3em")
    .style("font-size", `${size * 0.12}px`) // Ajusta o tamanho do texto proporcional ao tamanho
    .text(`${((sumSize / total) * 100).toFixed(1)}%`);
  }
</script>

<svg bind:this={doughnutSvg} weight = {size} height = {size}></svg>
