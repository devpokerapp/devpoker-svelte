<script lang="ts">
	import { getOptionsFromPattern, PATTERN_FIBONACCI, PATTERNS } from '$lib/pattern';
	import { getContext } from 'svelte';
	import type { KeyboardEventHandler } from 'svelte/elements';
	import { get, type Writable } from 'svelte/store';
	import VoteLabel from '../../../components/VoteLabel.svelte';
	import { closeModal } from '../../../util/modal';

	const pokerContext = getContext<IPokerContext>('poker');
	const { current: currentPoker }: { current: Writable<Poker | undefined> } = pokerContext;

	let votePattern = PATTERN_FIBONACCI;
	let voteType: VotePatternType = 'fibo';
	let voteOptions = getOptionsFromPattern(votePattern);

	let anonymousVoting: boolean = false;

	const changePattern = (pattern: VotePattern) => {
		voteType = pattern.type;
		if (pattern.value !== undefined) {
			votePattern = pattern.value;
			voteOptions = getOptionsFromPattern(votePattern);
		}
	};

	const updatePatternFromPoker = () => {
		votePattern = get(currentPoker)?.votePattern || PATTERN_FIBONACCI;

		// tries to recognize which pattern was chosen
		const currentUsedPattern = PATTERNS.find((pattern) => votePattern === pattern.value);
		if (currentUsedPattern !== undefined) {
			changePattern(currentUsedPattern);
		} else {
			changePattern({
				name: 'Customizado',
				type: 'custom',
				value: votePattern
			});
		}
	};

	currentPoker.subscribe((value) => {
		updatePatternFromPoker();
		anonymousVoting = value?.anonymousVoting || false;
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
				votePattern: votePattern,
				anonymousVoting: anonymousVoting
			});

			closeModal('modal-poker-config');
		} catch (error) {
			console.log(error);
		}
	};

	const handleCustomPatternKeydown: KeyboardEventHandler<HTMLInputElement> = async (event) => {
		voteOptions = getOptionsFromPattern(votePattern);
	};

	const handleCancel = () => {
		updatePatternFromPoker();
		closeModal('modal-poker-config');
	};
</script>

<!-- Config Poker -->
<dialog id="modal-poker-config" class="modal modal-bottom sm:modal-middle">
	<form method="dialog" class="modal-box flex flex-col gap-4" on:submit={handlePokerUpdate}>
		<h3 class="font-bold text-xl pb-2">Configurar sessão de Planning Poker</h3>
		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="label-text"> Votação anônima </span>
				<input type="checkbox" bind:checked={anonymousVoting} class="checkbox checkbox-primary" />
			</label>
		</div>
		<!-- TODO -->
		<!-- <div class="form-control w-full">
			<div class="label">
				<span class="label-text"> Senha de acesso </span>
			</div>
			<label class="input input-bordered flex items-center gap-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="w-4 h-4"
				>
					<path
						fill-rule="evenodd"
						d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
						clip-rule="evenodd"
					/>
				</svg>
				<input type="text" class="grow" placeholder="Senha de acesso" />
			</label>
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
						on:click={() => changePattern(pattern)}
					>
						<div class="card-body flex flex-row">
							<div class="flex-grow">
								<div>
									{pattern.name}
								</div>
								<div class="flex flex-row flex-wrap gap-1 pt-2">
									{#if pattern.value}
										{#each getOptionsFromPattern(pattern.value) as value}
											<div class="badge badge-secondary">
												<VoteLabel {value} />
											</div>
										{/each}
									{/if}
									{#if pattern.type == 'custom' && voteType == 'custom'}
										{#each voteOptions as value}
											<div class="badge badge-secondary">
												<VoteLabel {value} />
											</div>
										{/each}
									{/if}
								</div>
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
						{#if pattern.type == 'custom' && voteType == 'custom'}
							<div class="card-body pt-0">
								<div class="form-control w-full">
									<div class="label">
										<span class="label-text">Padrão de votos válidos</span>
									</div>
									<input
										type="text"
										class="input input-bordered w-full"
										placeholder="Exemplo: 0,1,2,3,5,8,?"
										bind:value={votePattern}
										on:keyup={handleCustomPatternKeydown}
										on:focus={() => changePattern(pattern)}
									/>
									<div class="label">
										<span class="label-text"> Valores separados por vírgula (",") </span>
									</div>
								</div>
							</div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
		<div class="modal-action">
			<div class="flex flex-row gap-4">
				<button type="button" class="btn" on:click={handleCancel}> Cancelar </button>
				<button type="submit" class="btn btn-primary"> Confirmar </button>
			</div>
		</div>
	</form>
</dialog>
