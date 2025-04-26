<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  let mapElement;

  // Limites da região de interesse
  const minLat = 52;
  const maxLat = 56;
  const minLong = 24;
  const maxLong = 38;

  // Lista de países que queremos destacar
  const targetCountries = ["Russia", "Lithuania", "Latvia", "Belarus"];

  onMount(async () => {
    // Configuração principal
    const svg = d3.select(mapElement);
    const width = 800;
    const height = 400;

    svg.attr("width", width)
       .attr("height", height);

    const g = svg.append("g");

    // Configuração da projeção geográfica
    const projection = d3.geoMercator()
      .center([31, 54])  // Centro aproximado da nossa região de interesse
      .scale(3500)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    try {
      // Carregar os dados geográficos
      const worldGeoJson = await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson");

      // Filtrar para os países que nos interessam
      const filteredCountries = worldGeoJson.features.filter(d =>
        targetCountries.includes(d.properties.name)
      );

      // Desenhar os países selecionados - bordas em preto
      g.selectAll(".country")
        .data(filteredCountries)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("fill", "#f0f0f0")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("d", path)
        .append("title")
        .text(d => d.properties.name);

      // Desenhar o retângulo que representa os limites da região de interesse
      // const cornerPoints = [
      //   [minLong, minLat],
      //   [maxLong, minLat],
      //   [maxLong, maxLat],
      //   [minLong, maxLat]
      // ];

      // const regionBoundary = {
      //   type: "Feature",
      //   geometry: {
      //     type: "Polygon",
      //     coordinates: [cornerPoints.concat([[minLong, minLat]])]
      //   }
      // };

      // Configurar o "viewport" para exibir apenas a região de interesse
      const clipPath = svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("path")
        .datum(regionBoundary)
        .attr("d", path);

      g.attr("clip-path", "url(#clip)");

      // Adicionar contorno da região sem preenchimento
      g.append("path")
        .datum(regionBoundary)
        .attr("fill", "none") // Sem preenchimento
        .attr("stroke", "red")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "5,5")
        .attr("d", path);

    } catch (error) {
      console.error("Erro ao carregar o mapa:", error);
    }
  });
</script>

<style>
  svg {
    background-color: white;
    max-width: 100%;
    height: auto;
  }

  :global(.country) {
    transition: fill 0.3s;
  }

  :global(.country:hover) {
    fill: #d0d0d0;
  }
</style>

<div class="map-container">
  <svg bind:this={mapElement}></svg>
</div>
