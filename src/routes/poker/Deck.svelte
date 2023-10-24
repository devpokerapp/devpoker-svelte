<script>
	const cards = ['0', '1', '2', '3', '5', '8', '13', '?', '☕'];
</script>

<div class="flex flex-row flex-wrap justify-center align-bottom gap-4">
	{#each cards as card}
		<button class="btn btn-secondary shadow-xl w-20 rounded-xl relative" style="min-height: 8em;">
			{card}
		</button>
	{/each}
</div>
