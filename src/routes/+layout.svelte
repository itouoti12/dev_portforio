

<script lang="ts">
  import Analytics from '$lib/analytics.svelte';
</script>

<Analytics />

<slot />

<style lang="postcss">
  :global(body.dark) {
    @apply text-white;
  }
</style>