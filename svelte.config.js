/** @type {import('svelte/config').Config} */
const config = {
  compilerOptions: {
    css: 'injected',
    dev: process.env.NODE_ENV !== 'production'
  }
};

export default config; 