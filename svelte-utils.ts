import type { SvelteComponent } from 'svelte';
// import type { CounterProps } from './types';

export function mount<T extends SvelteComponent>(
    Component: new (options: { target: HTMLElement; props?: Record<string, any> }) => T,
    options: { target: HTMLElement; props?: Record<string, any> }
): T {
    const target = options.target;
    target.innerHTML = ''; // Nettoyer le conteneur
    target.style.display = 'block'; // S'assurer que le conteneur est visible
    target.style.height = '100%'; // Utiliser toute la hauteur disponible
    
    // S'assurer que les props sont définies
    const props = options.props || {};
    
    return new Component({
        target,
        props
    });
}

export function unmount(component: SvelteComponent | undefined) {
    if (component && typeof component.$destroy === 'function') {
        component.$destroy();
    }
} 