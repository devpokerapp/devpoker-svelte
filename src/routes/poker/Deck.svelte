<script lang="ts">
	import { getContext } from 'svelte';
	import type { IWebSocketContext } from '../../context/websocket';

	const cards = ['0', '1', '2', '3', '5', '8', '13', '?', '☕'];

	const websocket = getContext<IWebSocketContext>('websocket');

	const sendVote = (value: string) => {
        websocket.send({
            correlation_id: 'story_service',
            method: 'create',
            data: {
                channel: 'test_',
                vote: value
            },
        });
    };
</script>

<div class="flex flex-row flex-wrap justify-center align-bottom">
	{#each cards as card}
		<button
			class="poker-card btn btn-secondary shadow-xl w-20 rounded-xl relative"
			on:click={() => sendVote(card)}
		>
			{card}
		</button>
	{/each}
</div>

<style>
	.poker-card {
		min-height: 8em;
		z-index: 100;
		scale: 1;
		margin-right: -1em;
		transition-property: -moz-filter, -ms-filter, -o-filter, -webkit-filter, filter, bottom,
			margin-right, scale;
		transition-duration: 0.25s;
	}
	.poker-card:hover {
		z-index: 101;
		scale: 1.15;
		margin-right: 0.25em;
	}
</style>
