import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({ fallback: '404.html' }),
		paths: {
			base: dev ? '' : '/tarefa-4-interactive_minard'
		},
	},
};

export default config;
