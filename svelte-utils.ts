import type { SvelteComponent } from 'svelte';
// import type { CounterProps } from './types';

export function mount<T extends SvelteComponent, P extends Record<string, any>>(
  Component: new (options: { target: HTMLElement; props?: P }) => T,
  options: { target: HTMLElement; props?: P }
): T {
  return new Component(options);
}

export function unmount(component: SvelteComponent) {
  component.$destroy();
} 