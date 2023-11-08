<script lang="ts">
	import { getContext } from 'svelte';

	const websocket = getContext<IWebSocketContext>('websocket');
	const { connected, initiated } = websocket;
</script>

<div class="absolute top-0 left-0 w-full p-4" style="z-index: 500;">
	{#if initiated && !$connected}
		<div class="alert alert-error shadow-md">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="stroke-current shrink-0 h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
				/></svg
			>
			<span> Conexão perdida! Por favor, tente novamente mais tarde. </span>
			<div>
				<button class="btn btn-sm btn-accent" on:click={websocket.restart}>Tentar novamente</button>
			</div>
		</div>
	{/if}
</div>
