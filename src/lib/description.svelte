<script>
    export let selectedEvent ;
    export let currentTimeInput;
    import Icon from '$lib/icon.svelte';
    import eventInfo from '$lib/data/dados.json';
    import { formattedDate, parseDate} from "$lib/utils";
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    const orderedEntries = Object.entries(eventInfo)
    .map(([id, event]) => ({
        id,
        ...event,
        timestamp: parseDate(event.date)
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

    // Now rebuild the ordered object
    const orderedEvents = Object.fromEntries(
        orderedEntries.map(({ id, ...eventWithTimestamp }) => [id, eventWithTimestamp])
    );
    console.log(orderedEvents)


    $: showStart = false;
    $: firstChange = false; 
    let tryUpdteSelectedEvent = true; 


    // Função para encontrar o evento mais próximo antes da data atual, caso não haja evento na data atual
    function getEventForTodayOrLast(currentTime) {
        if (tryUpdteSelectedEvent){
            let closestEvent = null;
            let closestDate = null;
            const tolerance = 43200000;

            // Check if there's an event on the current date
            for (let key in orderedEvents) {
                let eventDate = orderedEvents[key].timestamp;

                if (Math.abs(eventDate - currentTime) <= tolerance) {
                    // Found an event for today
                    closestEvent = key;
                    closestDate = eventDate;
                    break;
                }

                // Store the closest event before the current time
                if (!closestDate || (eventDate < currentTime && eventDate > closestDate)) {
                    closestEvent = key;
                    closestDate = eventDate;
                    if (eventDate > currentTime){
                        break
                    }
                }
            }
            
            // Set showStart to true if a valid event is found
            if (firstChange)
            {
                showStart = true;
            }
            if (closestEvent !== null) {
                firstChange = true;
            }

            
            return closestEvent;

        }
        else {
            return null
        }
        
    }

    // Verificar o evento para mostrar (data atual ou último evento antes da data atual)
    $: {
        if (tryUpdteSelectedEvent){
            const maybeEvent = getEventForTodayOrLast(currentTimeInput);
            // console.log(maybeEvent)
            if (maybeEvent !== null) {
                selectedEvent = maybeEvent;
            }
        }
        else {
            selectedEvent = null
            tryUpdteSelectedEvent = true
        }
       
        selectedEvent = selectedEvent;
        
    }
    
    function resetDescription() {
        showStart = false;
        selectedEvent = null
        tryUpdteSelectedEvent = false
    }

    $: console.log(showStart)

</script>

{#if showStart && selectedEvent}
    <div class="description-container">
        <div class="icon-wrapper">
            <Icon name={orderedEvents[selectedEvent].icon} width_icon={38} height_icon={38} />
        </div>
        <h3 class="title-description">{orderedEvents[selectedEvent].title}</h3>
        <p><strong>Date:</strong> {formattedDate(orderedEvents[selectedEvent].date)}</p>
        <p class="image_description">
            {#if orderedEvents[selectedEvent].image}
                <img src="{orderedEvents[selectedEvent].image}" alt="{orderedEvents[selectedEvent].label} image" class="event-image">
            {/if}
        </p>
        <div class="event-description">
            {@html orderedEvents[selectedEvent].info}
        </div>
        <button on:click={resetDescription} class="reset-button">
            Restart Description
        </button>
    </div>
{:else}
    <div class="description-container">
        <h3 class="title-description">Minard and French invasion of Russia</h3>
        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e3/Raevsky_saltanovka.jpg" alt="napoleaon invasion" class="event-image">
        <p>The tragic campaign of Napoleon towards Russia was famously captured by Charles Minard in his renowned 1869 infographic, which visually depicts the dramatic reduction of Napoleon's army during the march to Moscow and the retreat, combining geography, temperature, and troop strength into one powerful visual narrative. We thought about making it interactive in order to better understand what Minard intended to convey with this infographic. We highlight famous battles and important events, allowing the user to scroll through time and experience this great historical journey.</p>
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
        position: relative;
    }

    .title-description {
        margin: 15px;
        padding-top: 2px;
    }

    .icon-wrapper {
        position: absolute;
        top: -25px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #fff;
        padding: 5px;
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
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
    .reset-button {
        margin: 1rem auto 0 auto; /* margem em cima e centralizado horizontalmente */
        padding: 0.4rem 0.8rem; /* menor por dentro */
        background-color: #030303;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 0.9rem; /* fonte um pouco menor */
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.3s, transform 0.2s;
        display: flex; /* flex para centralizar conteúdo interno */
        align-items: center;
        justify-content: center; /* conteúdo do botão centralizado */
        gap: 0.4rem;
        width: fit-content; /* largura justa ao conteúdo */
    }

    .reset-button:hover {
        background-color: #464646;
        transform: translateY(-2px);
    }

    .reset-button:active {
        background-color: #464646;
        transform: translateY(0);
    }
</style>
