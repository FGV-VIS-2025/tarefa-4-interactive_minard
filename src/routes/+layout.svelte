<script>
    import { base } from "$app/paths";
    import { page } from "$app/stores";

    let pages = [
        { url: "/", title: "Iterative Graph" },
        { url: "/autores", title: "Authors" },
        { url: "/minard", title: "Original Minard" },
        {
            url: "https://github.com/FGV-VIS-2025/tarefa-4-interactive_minard",
            title: "Github",
        },
    ];
</script>

<div class="layout">
    <nav>
        {#each pages as p (p.url)}
            <a
                href={p.url.startsWith("http") ? p.url : `${base}${p.url}`}
                class:current={$page.url.pathname.replace(/\/$/, '') === p.url.replace(/\/$/, '')}
                target={p.url.startsWith("http") ? "_blank" : undefined}
            >
                {p.title}
            </a>
        {/each}
    </nav>
    <main>
        <slot />
    </main>
    {#if $page.url.pathname === '/'}
        <footer>
            <div class="footer-inner">
                <div class="footer-row">
                    <div class="footer-block">
                        <h4>Inspiration</h4>
                        <a href="https://www.masswerk.at/minard/" target="_blank">
                            Norbert Landsteiner (2013)
                        </a>
                    </div>
                    <div class="footer-block">
                        <h4>Data Sources</h4>
                        <a href="https://github.com/stdlib-js/datasets-minard-napoleons-march" target="_blank">
                            Minard March Dataset
                        </a>
                    </div>
                    <div class="footer-block">
                        <h4>Event Info</h4>
                        <a href="https://www.masswerk.at/minard/" target="_blank">
                            Norbert Landsteiner (2013)
                        </a>
                    </div>
                    <div class="footer-block">
                        <h4>Geographic Data</h4>
                        <a href="https://github.com/topojson/world-atlas" target="_blank">
                            TopoJSON World Atlas
                        </a>
                    </div>
                    <div class="footer-block">
                        <h4>Images</h4>
                        <a href="https://pt.wikipedia.org/wiki/Wikip%C3%A9dia:P%C3%A1gina_principal" target="_blank">
                            Wikipedia (historical events)
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    {/if}
</div>

<style>
    .layout {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        background-color: #fdfdfd;
        font-family: "Helvetica Neue", Arial, sans-serif;
    }

    nav {
        display: flex;
        justify-content: center;
        gap: 10rem;
        padding: 1rem 0;
        background-color: #ffffff;
        border-bottom: 2px solid #e0e0e0;
    }

    nav a {
        color: #222;
        text-decoration: none;
        font-size: 1.05rem;
        padding: 0.3rem 0;
        position: relative;
    }

    nav a::after {
        content: "";
        display: block;
        width: 0%;
        height: 2px;
        background: #007acc;
        transition: width 0.3s;
        position: absolute;
        bottom: -4px;
        left: 0;
    }

    nav a:hover::after {
        width: 100%;
    }

    nav a.current {
        color: #007acc;
        font-weight: 600;
    }

    nav a.current::after {
        width: 100%;
    }

    main {
        flex-grow: 1;
        padding: 2rem 1.5rem;
        max-width: 1000px;
        margin: 0 auto;
    }

    footer {
    width: 100%;
    background-color: #fafafa;
    border-top: 2px solid #e0e0e0;
    font-size: 0.9rem;
    color: #333;
    padding: 1rem 0;
    }

    .footer-inner {
        max-width: 80%;
        margin: 0 auto;
    }

    .footer-row {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 2rem;
        align-items: flex-start;
    }

    .footer-block {
        min-width: 180px;
        max-width: 240px;
        flex: 1;
    }

    .footer-block h4 {
        margin-bottom: 0.3rem;
        font-size: 0.8rem;
        color: #444;
    }

    footer a {
        color: #007acc;
        text-decoration: none;
    }

    footer a:hover {
        text-decoration: underline;
    }


</style>
