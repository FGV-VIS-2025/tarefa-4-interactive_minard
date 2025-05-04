<script>
    export let playing = false;
    export let onTogglePlay;

    function handleClick() {
        onTogglePlay();
    }
</script>

<button on:click={handleClick}>
    <span class="play-icon">{playing ? "| |" : "▶"}</span>
</button>

<style>
    button {
        width: 40px;
        height: 30px;
        padding: 5px 10px;
        font-size: 15px;
        background-color: #030303;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        position: absolute;
        top: 70px;
        left: 31px;
        cursor: pointer;

        display: flex;
        justify-content: center;
        align-items: center;

        transition:
            background-color 0.3s,
            transform 0.2s;
    }

    button:hover {
        background-color: #464646;
    }

    button:active {
        background-color: #686868;
    }

    span {
        display: inline-block;
        line-height: 0; /* Garante que o ícone não tenha espaços adicionais ao redor */
    }
</style>
