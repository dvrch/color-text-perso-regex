// svelte-utils.ts
// A basic utility for mounting and unmounting Svelte components.
import type { SvelteComponentTyped } from 'svelte';

// This interface describes the options Svelte components accept in their constructor.
interface SvelteComponentConstructorOptions<Props> {
  target: Element | DocumentFragment | ShadowRoot;
  anchor?: Node;
  props?: Props;
  context?: Map<any, any>;
  hydrate?: boolean;
  intro?: boolean;
  $$inline?: boolean;
}

export function mount<
  Props extends Record<string, any>,
  Events extends Record<string, any>,
  Slots extends Record<string, any>
>(
  Component: new (options: SvelteComponentConstructorOptions<Props>) => SvelteComponentTyped<Props, Events, Slots>,
  options: { // This is the options object passed to our mount util
    target: Element | DocumentFragment | ShadowRoot;
    props?: Props;
    anchor?: Node;
    intro?: boolean;
  }
): SvelteComponentTyped<Props, Events, Slots> {
  // Construct the options object for the Svelte component constructor,
  // applying defaults from the original JS logic.
  const constructorOptions: SvelteComponentConstructorOptions<Props> = {
    target: options.target,
    props: options.props || ({} as Props), // Default to empty object if props undefined
    anchor: options.anchor,
    intro: options.intro ?? false, // Default to false if intro undefined
  };
  
  return new Component(constructorOptions);
}

export function unmount(component: { $destroy: () => void } | undefined | null): void {
  if (component && typeof component.$destroy === 'function') {
    component.$destroy();
  }
}
