/** @type {import('svelte/config').Config} */
const config = {
  compilerOptions: {
    runes: true,
    css: 'injected',
    dev: process.env.NODE_ENV !== 'production'
  }
};

export default config; 