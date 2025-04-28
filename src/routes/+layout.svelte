<script>

    import { base } from '$app/paths';
    import { page } from "$app/stores";

    let pages = [
      { url: "/", title: "Iterative Graph" },
      { url: "/autores", title: "Authors" },
      { url: "/minard", title: "Original Minard" },
      { url: "https://github.com/FGV-VIS-2025/tarefa-4-interactive_minard", title: "Github" }
    ];
</script>

<div class="layout">
    <nav>
        {#each pages as p}
        <a
                href={p.url.startsWith("http")
                    ? p.url
                    : `${base}${p.url}`}
                class:current={$page.route.id === p.url}
                target={p.url.startsWith("http") ? "_blank" : undefined}
            >
        {p.title}
        </a>
        {/each}
    </nav>
    <main>
        <slot />
    </main>
</div>

<style>
    .layout {
        display: flex;
        flex-direction: column;
        min-height: 90vh;
    }

    nav {
        --border-color: oklch(50% 10% 200 / 40%);
        display: flex;
        margin-bottom: 1em;
        border-bottom: 1px solid var(--border-color);
    }

    nav a {
        flex: 1;
        text-decoration: none;
        color: inherit;
        text-align: center;
        padding: 0.5em;
    }

    nav a.current {
        border-bottom: 0.4em solid var(--border-color);
        padding-bottom: 0.1em;
        font-weight: bold;
    }

    nav a:hover {
        border-bottom: 0.4em solid var(--color-accent);
        padding-bottom: 0.1em;
        background-color: color-mix(in oklch, var(--color-accent), canvas 85%);
    }

    main {
        flex-grow: 1; /* faz o conteúdo expandir ocupando o espaço restante */
        padding: 8px;
        display: flex;
        flex-direction: column;
    }
</style>
