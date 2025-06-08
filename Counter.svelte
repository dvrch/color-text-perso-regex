<script lang="ts">
  // import type { CounterProps } from './types';

  // let {
  //   startCount
  // }: CounterProps = $props();

  let count = $state(0); // Initialisation à 0 pour le test

  export function increment() {
    count += 1;
  }
</script>

<div class="number">
  <span>My number is {count}!</span>
</div>

<style>
  .number {
    color: red;
  }
</style> 