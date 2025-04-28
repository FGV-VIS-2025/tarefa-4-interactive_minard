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
            href={p.url.startsWith("http") ? p.url : `${base}${p.url}`}
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
        min-height: 100vh;
        background-color: #fdfdfd;
        font-family: 'Helvetica Neue', Arial, sans-serif;
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
        color: #555;
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
</style>

