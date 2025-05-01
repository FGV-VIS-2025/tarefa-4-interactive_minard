<script>
    export let selectedEvent;
    export let currentTimeInput;
    export let onTogglePlay;
    export let playing;
    export let minTime;
    import Icon from "$lib/icon.svelte";
    import eventInfo from "$lib/data/dados.json";
    import { formattedDate, parseDate } from "$lib/utils";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    // Pegamos o evento de eventInfo e ordenamos por timestamp
    const orderedEntries = Object.entries(eventInfo)
        .map(([id, event]) => ({
            id,
            ...event,
            timestamp: parseDate(event.date),
        }))
        .sort((a, b) => a.timestamp - b.timestamp);

    // Criamos um dicionário com as keys, ordenadas por timestamp
    const orderedEvents = Object.fromEntries(
        orderedEntries.map(({ id, ...eventWithTimestamp }) => [
            id,
            eventWithTimestamp,
        ]),
    );

    // booleanos para controle de eventos
    //controla se mostra a introdução
    $: showStart = false;
    // Controla se é a primeira mudança
    $: firstChange = false;
    // Controla se é o evento selecionado
    let tryUpdteSelectedEvent = true;

    // Função que itera sobre o orderedEntries toda vez e pega o elemento menor mais próximo
    function getEventForTodayOrLast(currentTime) {
        // Se ele quer pegar o evento mais próximo
        if (tryUpdteSelectedEvent) {
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
                    // Se passamos da data, podemos retornar
                    if (eventDate > currentTime) {
                        break;
                    }
                }
            }

            // Se já tiver passado uma vez, seta como true
            if (firstChange) {
                showStart = true;
            }
            // Se não for nulo setamos como true
            if (closestEvent !== null) {
                firstChange = true;
            }
            //Retornamos o closest event encontrado
            return closestEvent;
        } else {
            // Se não não queremos retornar nada
            return null;
        }
    }

    // Função para atualizar o selectedevent, se queremos atualizar ele
    $: {
        if (tryUpdteSelectedEvent) {
            const maybeEvent = getEventForTodayOrLast(currentTimeInput);
            // console.log(maybeEvent)
            if (maybeEvent !== null) {
                selectedEvent = maybeEvent;
            }
        } else {
            selectedEvent = null;
            tryUpdteSelectedEvent = true;
        }

        selectedEvent = selectedEvent;
    }

    function handleClick() {
        onTogglePlay();
    }

    // Função para resetar a descrição
    function resetDescription() {
        showStart = false;
        selectedEvent = null;
        tryUpdteSelectedEvent = false;
        if (playing) {
            handleClick();
        }
        currentTimeInput = minTime;
    }
</script>

{#if showStart && selectedEvent}
    <div class="description-container">
        <div class="icon-wrapper">
            <Icon
                name={orderedEvents[selectedEvent].icon}
                width_icon={38}
                height_icon={38}
            />
        </div>
        <h3 class="title-description">{orderedEvents[selectedEvent].title}</h3>
        <p>
            <strong>Date:</strong>
            {formattedDate(orderedEvents[selectedEvent].date)}
        </p>
        <p class="image_description">
            {#if orderedEvents[selectedEvent].image}
                <img
                    src={orderedEvents[selectedEvent].image}
                    alt="{orderedEvents[selectedEvent].label} image"
                    class="event-image"
                />
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
        <img
            src="https://upload.wikimedia.org/wikipedia/commons/e/e3/Raevsky_saltanovka.jpg"
            alt="napoleaon invasion"
            class="event-image"
        />
        <p class= "container-intro">
            Napoleon's campaign in Russia was famously depicted by Charles
            Minard in his 1869 infographic, illustrating the army’s decline by
            combining geography, temperature and troop strength. We propose
            making it interactive to better understand Minard’s message,
            highlighting key battles and events as users scroll through the
            historical journey.
        </p>
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
        margin-top: -80px;
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
        line-height: 1.2;
        text-align: justify;
    }
    .container-intro
    {
        text-align: justify;
        line-height: 1.2;
    }
    .event-image {
        width: 100%;
        max-width: 270px;
        height: auto;
    }
    .reset-button {
        margin: 1rem auto 0 auto;
        padding: 0.4rem 0.8rem;
        background-color: #030303;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: bold;
        cursor: pointer;
        transition:
            background-color 0.3s,
            transform 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        width: fit-content;
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
