<script>
    export let selectedEvent;
    export let eventInfo = {};
</script>

{#if selectedEvent && eventInfo[selectedEvent]}
    <div class="description-container">
        <h3>{eventInfo[selectedEvent].label}</h3>
        <p><strong>Date:</strong> {eventInfo[selectedEvent].date}</p>
        <p><strong>Location:</strong> 
            {eventInfo[selectedEvent].lat}°N, {eventInfo[selectedEvent].lon}°E
        </p>
        <div class="event-description">
            {@html eventInfo[selectedEvent].info}
        </div>
    </div>
{:else}
    <div class="description-container">
        <p>Select an event to see details</p>
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
    }

    .description-container h3 {
        margin-top: 0;
        color: #333;
    }

    .event-description {
        margin-top: 15px;
        line-height: 1.5;
    }
</style>