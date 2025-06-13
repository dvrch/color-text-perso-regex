import sveltePreprocess from 'svelte-preprocess';

/** @type {import('svelte/types/compiler/config').Config} */
const config = {
  preprocess: sveltePreprocess(),
  compilerOptions: {
    css: 'injected',
    dev: process.env.NODE_ENV !== 'production'
  }
};

export default config; 