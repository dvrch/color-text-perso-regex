
// svelte-utils.ts
// A basic utility for mounting and unmounting Svelte components.
// Your actual svelte-utils might be more complex depending on your setup.

import type { SvelteComponent, SvelteComponentTyped } from 'svelte';

interface ComponentProps {
  target: Element | DocumentFragment;
  props?: Record<string, any>;
  anchor?: Node;
  intro?: boolean;
}

// A generic mount function.
// Svelte components are typically classes, so `new Component({...})` is the core.
export function mount<
  Props extends Record<string, any> = any,
  Events extends Record<string, any> = any,
  Slots extends Record<string, any> = any
>(
  Component: new (...args: any[]) => SvelteComponentTyped<Props, Events, Slots>,
  options: ComponentProps
): SvelteComponentTyped<Props, Events, Slots> {
  return new Component({
    target: options.target,
    props: options.props || {},
    anchor: options.anchor,
    intro: options.intro,
  });
}

// A generic unmount function.
// Svelte components have a $destroy method.
export function unmount(component: SvelteComponent | SvelteComponentTyped | undefined | null): void {
  if (component && component.$destroy) {
    component.$destroy();
  }
}
