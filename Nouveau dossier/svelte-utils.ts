// svelte-utils.ts
// Utility for mounting and unmounting Svelte components, Svelte 4 compatible.
import type { SvelteComponent } from 'svelte';

// Type for the constructor options Svelte 4 components expect
interface Svelte4ComponentOptions<Props extends Record<string, any>> {
  target: Element; // Svelte 4 components are typically mounted to an Element
  props?: Props;
  anchor?: Node;
  intro?: boolean;
}

// Type for a Svelte 4 component constructor
// It should accept Svelte4ComponentOptions and return a SvelteComponent instance
// We also ensure $set is available for prop updates.
export type Svelte4Constructor<Props extends Record<string, any>> = new (
  options: Svelte4ComponentOptions<Props>
) => SvelteComponent & { $set: (props: Partial<Props>) => void };

export function mount<Props extends Record<string, any>>(
  Component: Svelte4Constructor<Props>,
  options: { 
    target: Element | Document | ShadowRoot; // Allow flexible input for target
    props?: Props;
    anchor?: Node; 
    intro?: boolean;
  }
): SvelteComponent & { $set: (props: Partial<Props>) => void } {
  
  if (!(options.target instanceof Element)) {
    // Obsidian's contentEl is HTMLElement, which is an Element.
    // Throw an error if the target is not an Element, as Svelte 4 expects this.
    console.error("Svelte mount target must be an Element. Received:", options.target);
    throw new Error("Svelte mount target must be an Element for Svelte 4 compatibility.");
  }
  
  const constructorOptions: Svelte4ComponentOptions<Props> = {
    target: options.target, // Target is now confirmed to be an Element
    props: options.props || ({} as Props), 
    anchor: options.anchor instanceof Node ? options.anchor : undefined, 
    intro: options.intro ?? false, 
  };
  
  return new Component(constructorOptions);
}

export function unmount(component: SvelteComponent | undefined | null): void {
  if (component && typeof component.$destroy === 'function') {
    component.$destroy();
  }
}