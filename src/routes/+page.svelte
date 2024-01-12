<script lang="ts">
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import AuthButton from '../components/AuthButton.svelte';

	let name: string = '';
	let loading = false;

	const websocket = getContext<IWebSocketContext>('websocket');

	const start = async () => {
		let loading = true;
		try {
			const response = await websocket.sendAndWait({
				service: 'poker_service',
				method: 'create',
				data: {
					payload: {
						creator: name
						// TODO: get a better source for the creator code
					}
				}
			});
			const poker = response.result as Poker;
			goto(`/poker/${poker.id}`);
		} catch (error) {
			console.error('REJECTED: ', error);
		} finally {
			loading = false;
		}
	};
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="bg-base-200">
	<div class="absolute top-2 right-2">
		<AuthButton />
	</div>
	<div class="hero min-h-screen">
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
