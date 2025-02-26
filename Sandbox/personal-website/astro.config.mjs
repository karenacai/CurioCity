// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
// import icon from 'astro-icon';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
    integrations: [tailwind()],
    output: 'server',
    adapter: vercel(),
    devToolbar: {
        enabled: false
    }
}); 
