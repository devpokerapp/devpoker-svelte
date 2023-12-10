<script lang="ts">
	import { getContext } from 'svelte';
	import { get, type Writable } from 'svelte/store';
	import { closeModal } from '../../../util/modal';

	const pokerContext = getContext<IPokerContext>('poker');
	const { current: currentPoker }: { current: Writable<Poker | undefined> } = pokerContext;

	let votePattern = '';

	currentPoker.subscribe((value) => {
		votePattern = value?.votePattern || '';
	});

	const handlePokerUpdate = async (event: SubmitEvent) => {
		event.preventDefault();

		const current = get(currentPoker);
		if (current === undefined) {
			return;
		}

		try {
			const poker = await pokerContext.update(current.id, {
				...current,
				votePattern: votePattern
			});

			if (poker) {
				pokerContext.retrieve(poker?.id);
			}

			closeModal('modal-poker-config');
		} catch (error) {
			console.log(error);
		}
	};
</script>

<!-- Config Poker -->
<dialog id="modal-poker-config" class="modal modal-bottom sm:modal-middle">
	<form method="dialog" class="modal-box flex flex-col gap-4" on:submit={handlePokerUpdate}>
		<h3 class="font-bold text-xl pb-2">Editar sessão de Planning Poker</h3>
		<div class="form-control w-full">
			<div class="label">
				<span class="label-text">Padrão de votos válidos</span>
			</div>
			<input
				type="text"
				placeholder="0,1,2,3,5,8"
				class="input input-bordered w-full max-w-xs"
				bind:value={votePattern}
			/>
		</div>
		<div class="modal-action">
			<div class="flex flex-row gap-4">
				<button class="btn" on:click={() => closeModal('modal-poker-config')}> Cancelar </button>
				<button type="submit" class="btn btn-primary"> Confirmar </button>
			</div>
		</div>
	</form>
</dialog>
