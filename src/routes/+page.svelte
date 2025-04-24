<script>
    import {onMount} from "svelte";
    import * as d3 from "d3";
    import {join} from "$lib/utils";
    import {interpolatePoints} from "$lib/utils";
    import {parseDate} from "$lib/utils";

    let eventInfo = {};

    // Load JSON on mount
    onMount(async () => {
      const response = await fetch('/dados.json');
      eventInfo = await response.json();
    });
    console.log(eventInfo)

    // let 
    $: if (svg && typeof x === 'function' && typeof y === 'function' && Object.keys(eventInfo).length > 0) {
    const eventPoints = Object.entries(eventInfo).map(([id, info]) => ({
      id,
      ...info
    }));

    const markers = svg.selectAll(".event-marker")
      .data(eventPoints, d => d.id);

    // Criar marcadores se ainda não existem
    const enter = markers.enter()
      .append("circle")
      .attr("class", "event-marker")
      .attr("r", 5)
      .attr("fill", "gold")
      .attr("stroke", "black");

    enter.append("title").text(d => d.id);

    // Atualizar posição sempre que x/y mudarem
    markers.merge(enter)
      .attr("cx", d => x(d.lon))
      .attr("cy", d => y(d.lat));

    // Remover os que não estão mais presentes
    markers.exit().remove();
  }

    // Pegando o dado
    export let data;

    // Dados do exército e da temperatura
    var army = data.army;
    var temperature = data.temperature;

    // Dados unidos do exército e da temperatura
    var armyWithTemp = join(army, temperature);

    // Tempo selecionado no time scroller
    let currentTime;

    // Convertendo a data de string para data
    armyWithTemp = armyWithTemp.filter(d => parseDate(d.date));

    // Consertando a divisão dos últimos dados
    armyWithTemp = armyWithTemp.map(d => {
        const cutoff = new Date("1812-11-28").getTime();
        const current = new Date(d.date).getTime();

        if (current > cutoff)
        {
            return {...d, division: 1};
        }

        return d;
    })

    // Pegando todas as datas ordenadas
    const times = [...new Set(armyWithTemp.map(d => parseDate(d.date)))].sort((a, b) => a - b);
    // Pegando as datas mínima e máxima (para os limites do time scroller)
    const minTime = times[0];
    const maxTime = times.at(-1);
    // Começa o tempo no time scroller como o mínimo
    currentTime = minTime;

    // Interativamente calcula os pontos interpolados da data selecionada
    $: interpolatedData = interpolatePoints(currentTime, armyWithTemp);

    // Elementos do svg
    let x, y;
    let svgElement;
    let svg;

    // Configurações do gráfico
    onMount(() => {
        const width = 600;
        const height = 400;
        const margin = {top: 20, right: 30, bottom: 30, left: 40};

        svg = d3.select(svgElement)
            .attr("width", width)
            .attr("height", height);

        x = d3.scaleLinear()
            .domain(d3.extent(army, d => d.lon))
            .range([margin.left, width - margin.right]);

        y = d3.scaleLinear()
            .domain(d3.extent(army, d => d.lat))
            .range([height - margin.bottom, margin.top]);

        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(y));
    });

    // Atualiza o gráfico interativamente
    $: if (svg && interpolatedData && typeof x === "function" && typeof y === "function") {
        const circles = svg.selectAll(".army-circle")

            .data(interpolatedData, d => d.division);

        circles.enter()
            .append("circle")
            .attr("class", "army-circle")
            .merge(circles)
            .attr("cx", d => x(d.lon))
            .attr("cy", d => y(d.lat))
            .attr("r", d => Math.sqrt(d.size)/10)
            .attr("fill", d => d.direction === "R" ? "tomato" : "steelblue");

        circles.exit().remove();
    }

</script>

<h1>Interactive Minard</h1>

<!-- Time scroller -->
<input type="range" min={minTime} max={maxTime} step={1} bind:value={currentTime} />
<p>Data: {new Date(currentTime).toLocaleDateString()}</p>

<!-- Gráfico -->
<svg bind:this={svgElement} id="chart" width="800" height="500"></svg>

<!-- <h2>Dados do join</h2>
<table border="1">
  <thead>
    <tr>
      <th>Divisão</th>
      <th>Latitude</th>
      <th>Longitude</th>
      <th>Tamanho</th>
      <th>Direção</th>
      <th>Data</th>
      <th>Temperatura</th>
    </tr>
  </thead>
  <tbody>
    {#each armyWithTemp as d}
      <tr>
        <td>{d.division}</td>
        <td>{d.lat}</td>
        <td>{d.lon}</td>
        <td>{d.size}</td>
        <td>{d.direction}</td>
        <td>{d.date}</td>
        <td>{d.temp}</td>
      </tr>
    {/each}
  </tbody>
</table> -->

<h2>Dados no gráfico</h2>
<table border="1">
  <thead>
    <tr>
      <th>Divisão</th>
      <th>Latitude</th>
      <th>Longitude</th>
      <th>Tamanho</th>
      <th>Direção</th>
      <th>Data</th>
      <th>Temperatura</th>
    </tr>
  </thead>
  <tbody>
    {#each interpolatedData as d}
      <tr>
        <td>{d.division}</td>
        <td>{d.lat}</td>
        <td>{d.lon}</td>
        <td>{d.size}</td>
        <td>{d.direction}</td>
        <td>{d.date}</td>
        <td>{d.temp}</td>
      </tr>
    {/each}
  </tbody>
</table>