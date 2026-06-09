import adapter from '@sveltejs/adapter-cloudflare'; // 'auto' yerine 'cloudflare'

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter()
    }
};

export default config;