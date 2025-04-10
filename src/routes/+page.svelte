<script>
    export let data;
</script>


<h2>Temperaturas:</h2>
<ul>
    {#each data.temperature as temperature}
        <li>
            Longitude: {temperature.lon}
            Temperatura: {temperature.temp}
            Date: {temperature.date}
        </li>
    {/each}
</ul>