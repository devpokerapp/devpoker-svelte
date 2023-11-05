<script lang="ts">
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';

	let loading = false;

	const websocket = getContext<IWebSocketContext>('websocket');

	const start = () => {
		websocket
			.request({
				service: 'poker_service',
				method: 'create',
				data: {
					payload: {
						creator: ''
					}
				}
			})
			.then((response) => {
				const poker = response.result as Poker;
				goto(`/poker/${poker.id}`);
			})
			.catch((response) => {
				console.error('REJECTED: ', response);
			});
		loading = true;
	};
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<div class="hero min-h-screen bg-base-200">
		<div class="hero-content text-center">
			<div class="max-w-md">
				<h1 class="text-5xl font-bold">DevPoker</h1>
				<p class="py-6">
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste quaerat illo corrupti
					soluta. Unde itaque reprehenderit voluptatibus sed tempore? Inventore vel excepturi ab
					blanditiis laborum nulla itaque enim saepe deleniti.
				</p>
				<button class="btn btn-primary" on:click={start} disabled={loading}>
					{#if loading}
						<span class="loading loading-spinner loading-xs" />
					{/if}
					Começar
				</button>
			</div>
		</div>
	</div>
</section>
