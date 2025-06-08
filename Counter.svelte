<script lang="ts">
  // import type { CounterProps } from './types';

  // let {
  //   startCount
  // }: CounterProps = $props();

  export let startCount = 0; // Valeur par défaut à 0
  let count = startCount;

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