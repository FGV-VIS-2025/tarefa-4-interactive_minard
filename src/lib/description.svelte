<script>
    export let selectedEvent;
    export let eventInfo = {};
    import Icon from '$lib/Icon.svelte';
</script>

{#if selectedEvent && eventInfo[selectedEvent]}
    <div class="description-container">
        <div class="icon-wrapper">
            <Icon name={eventInfo[selectedEvent].icon} width_icon = {38} height_icon = {38}/>
        </div>
        <h3 class="title-description">{eventInfo[selectedEvent].label}</h3>
        <p><strong>Date:</strong> {eventInfo[selectedEvent].date}</p>
        <p><strong>Location:</strong> {eventInfo[selectedEvent].lat}°N, {eventInfo[selectedEvent].lon}°E</p>
        <p class="image_description">
            {#if eventInfo[selectedEvent].image}
                <img src="{eventInfo[selectedEvent].image}" alt="{eventInfo[selectedEvent].label} image" class="event-image">
            {/if}
        </p>
        <div class="event-description">
            {@html eventInfo[selectedEvent].info}
        </div>
    </div>
{:else}
    <div class="description-container">
        <p>Napoleon's invasion of Russia began on June 24, 1812, with his army crossing the Neman River. The French forces advanced towards key Russian cities, facing initial successes but encountering strong resistance and harsh conditions. Key battles like Borodino and strategic missteps, including poor leadership and supply issues, led to heavy losses. By the end of the year, the French were forced to retreat, suffering catastrophic casualties due to the Russian winter and ongoing Russian attacks, marking a disastrous end to the campaign.</p>
    </div>
{/if}


<style>
    .description-container {
        width: 300px;
        padding: 15px;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: #f9f9f9;
        margin-left: 20px;
        position: relative; /* Permite o posicionamento absoluto do ícone */
    }

    .title-description {
        margin: 0; /* Remove qualquer margem */
        padding-top: 2px; /* Ajuste o espaçamento superior se necessário */
    }

    .icon-wrapper {
        position: absolute;
        top: -25px; /* Ajuste a altura do ícone */
        left: 50%;
        transform: translateX(-50%); /* Centraliza o ícone horizontalmente */
        background-color: #fff; /* Fundo branco atrás do ícone */
        padding: 5px; /* Adiciona padding ao redor do ícone */
        border-radius: 50%; /* Torna o fundo arredondado */
        box-shadow: 0 2px 5px rgba(0,0,0,0.2); /* Adiciona sombra para destacar o ícone */
    }

    .event-description {
        margin-top: 15px;
        line-height: 1.5;
    }

    .event-image {
        width: 100%;
        max-width: 230px;
        height: auto;
    }
</style>    