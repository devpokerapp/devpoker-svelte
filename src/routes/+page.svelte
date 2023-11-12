<script lang="ts">
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import { closeModal, openModal } from '../util/modal';

	let name: string = '';
	let loading = false;

	const websocket = getContext<IWebSocketContext>('websocket');

	const handleStartCreatePoker = () => {
		openModal('modal-poker-create')
	};

	const handleCreatePoker = async (event: SubmitEvent) => {
		event.preventDefault();
		let loading = false;

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
			loading = true;
		}
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
				<button class="btn btn-primary" on:click={handleStartCreatePoker} disabled={loading}>
					{#if loading}
						<span class="loading loading-spinner loading-xs" />
					{/if}
					Começar
				</button>
			</div>
		</div>
	</div>
	<!-- Create Poker -->
	<dialog id="modal-poker-create" class="modal modal-bottom sm:modal-middle">
		<form method="dialog" class="modal-box flex flex-col gap-4" on:submit={handleCreatePoker}>
			<h3 class="font-bold text-xl pb-2">Iniciar sessão de Planning Poker</h3>
			<input
				type="text"
				placeholder="Seu nome"
				class="input input-bordered w-full"
				bind:value={name}
			/>
			<div class="modal-action">
				<div class="flex flex-row gap-4">
					<button type="reset" class="btn" on:click={() => closeModal('modal-poker-create')}>
						Cancelar
					</button>
					<button type="submit" class="btn btn-primary" disabled={loading}> Confirmar </button>
				</div>
			</div>
		</form>
		<form method="dialog" class="modal-backdrop">
			<button>close</button>
		</form>
	</dialog>
</section>
