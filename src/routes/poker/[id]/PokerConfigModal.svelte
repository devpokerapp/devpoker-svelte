<script lang="ts">
	import { getContext } from 'svelte';
	import { get, type Writable } from 'svelte/store';
	import VoteLabel from '../../../components/VoteLabel.svelte';
	import { closeModal } from '../../../util/modal';

	interface VotePattern {
		type: string;
		name: string;
		value?: string;
	}

	const PATTERNS: VotePattern[] = [
		{
			type: 'fibo',
			name: 'Fibonacci',
			value: '0,1,2,3,5,8,13,?,__coffee'
		},
		{
			type: 'tshirt',
			name: 'T-Shirt sizing',
			value: 'PP,P,M,G,GG,?,__coffee'
		},
		{
			type: 'custom',
			name: 'Customizado',
			value: undefined
		}
	];

	const pokerContext = getContext<IPokerContext>('poker');
	const { current: currentPoker }: { current: Writable<Poker | undefined> } = pokerContext;

	let votePattern = '0,1,2,3,5,8,13,?,__coffee';
	let voteType = 'fibo';

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

			closeModal('modal-poker-config');
		} catch (error) {
			console.log(error);
		}
	};

	const switchVotePattern = (pattern: VotePattern) => {
		voteType = pattern.type;
		if (pattern.value !== undefined) {
			votePattern = pattern.value;
		}
		// TODO: show editing interface
	};
</script>

<!-- Config Poker -->
<dialog id="modal-poker-config" class="modal modal-bottom sm:modal-middle">
	<form method="dialog" class="modal-box flex flex-col gap-4" on:submit={handlePokerUpdate}>
		<h3 class="font-bold text-xl pb-2">Editar sessão de Planning Poker</h3>
		<!-- <div class="form-control w-full">
			<div class="label">
				<span class="label-text">Padrão de votos válidos</span>
			</div>
			<input
				type="text"
				placeholder="0,1,2,3,5,8"
				class="input input-bordered w-full max-w-xs"
				bind:value={votePattern}
			/>
		</div> -->
		<div class="form-control w-full">
			<div class="label">
				<span class="label-text">Padrão de votação</span>
			</div>
			<div class="join join-vertical">
				{#each PATTERNS as pattern}
					<button
						type="button"
						class="card text-start join-item border"
						on:click={() => switchVotePattern(pattern)}
					>
						<div class="card-body flex flex-row">
							<div class="flex-grow">
								<div>
									{pattern.name}
								</div>
								{#if pattern.value}
									<div class="flex flex-row gap-1 pt-2">
										{#each pattern.value.split(',') as value}
											<div class="badge badge-secondary">
												<VoteLabel {value} />
											</div>
										{/each}
									</div>
								{/if}
							</div>
							<input
								id="votetype-{pattern.type}"
								type="radio"
								name="voteType"
								class="radio"
								value={pattern.type}
								bind:group={voteType}
							/>
						</div>
					</button>
				{/each}
			</div>
		</div>
		<div class="modal-action">
			<div class="flex flex-row gap-4">
				<button class="btn" on:click={() => closeModal('modal-poker-config')}> Cancelar </button>
				<button type="submit" class="btn btn-primary"> Confirmar </button>
			</div>
		</div>
	</form>
</dialog>
