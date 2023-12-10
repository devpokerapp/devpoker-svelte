<script lang="ts">
	export let value: string;
</script>

<span>
	{#if value === '__coffee'}
		☕
	{:else}
		{value}
	{/if}
</span>
