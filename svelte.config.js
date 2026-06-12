import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        // adapter() fonksiyonunun içine ayarları gönderiyoruz
        adapter: adapter({
            pages: 'build',
            assets: 'build',
            fallback: '404.html', // 404 hatasını önlemek için önemli
            precompress: false,
            strict: true
        })
    }
};

export default config;