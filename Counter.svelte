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
</script>

<div class="counter-container">
  <div class="number">
    <span>My number is {count}!</span>
  </div>
  <button on:click={increment}>
    Increment
  </button>
</div>

<style>
  .counter-container {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .number {
    color: red;
    font-size: 1.2rem;
  }

  button {
    padding: 0.5rem 1rem;
    background-color: var(--interactive-accent);
    color: var(--text-on-accent);
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: var(--interactive-accent-hover);
  }
</style> 