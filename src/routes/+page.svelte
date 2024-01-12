<script lang="ts">
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	let name: string = '';
	let loading = false;

	const websocket = getContext<IWebSocketContext>('websocket');
	const authContext = getContext<IAuthContext>('auth');

	const {
		loading: authLoading,
		authenticated
	}: { loading: Writable<boolean>; authenticated: Writable<boolean> } = authContext;

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
		{#if $authenticated}
			<div class="dropdown dropdown-bottom dropdown-end">
				<div tabindex="0" role="button" class="btn btn-secondary">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-5 h-5"
					>
						<path
							d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z"
						/>
					</svg>
					Perfil
				</div>
				<ul
					tabindex="0"
					class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
				>
					<li><a>Editar perfil</a></li>
					<li><a on:click={authContext.logout}>Logout</a></li>
				</ul>
			</div>
		{:else}
			<button class="btn btn-secondary" on:click={authContext.login} disabled={$authLoading}>
				{#if $authLoading}
					<span class="loading loading-spinner loading-xs" />
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-5 h-5"
					>
						<path
							d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z"
						/>
					</svg>
				{/if}
				Login
			</button>
		{/if}
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
