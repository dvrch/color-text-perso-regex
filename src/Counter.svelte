<script lang="ts">
  // import type { CounterProps } from './types';

  // let {
  //   startCount
  // }: CounterProps = $props();

  export let startCount = 0; // Valeur par défaut à 0
  let count = startCount;

  function increment() {
    count += 1;
  }

  function decrement() {
    count -= 1;
  }
</script>

<div class="counter-container">
  <div class="number">{count}</div>
  <div class="button-group">
    <button on:click={decrement}>-</button>
    <button on:click={increment}>+</button>
  </div>
</div>

<style>
  .counter-container {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    background-color: var(--background-primary);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin: 1rem;
  }

  .number {
    color: var(--text-normal);
    font-size: 1.2rem;
    font-weight: bold;
  }

  button {
    padding: 0.5rem 1rem;
    background-color: var(--interactive-accent);
    color: var(--text-on-accent);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  button:hover {
    background-color: var(--interactive-accent-hover);
  }
</style> 