<script lang="ts">
	import { getContext } from 'svelte';
	import type { KeyboardEventHandler } from 'svelte/elements';
	import { get, type Writable } from 'svelte/store';
	import VoteLabel from '../../../components/VoteLabel.svelte';
	import { closeModal } from '../../../util/modal';

	type VotePatternType = 'fibo' | 'tshirt' | 'custom';
	interface VotePattern {
		type: VotePatternType;
		name: string;
		value?: string;
	}

	const PATTERN_FIBONACCI = '0,1,2,3,5,8,13,?,__coffee';
	const PATTERN_TSHIRT = 'PP,P,M,G,GG,?,__coffee';
	const PATTERNS: VotePattern[] = [
		{
			type: 'fibo',
			name: 'Fibonacci',
			value: PATTERN_FIBONACCI
		},
		{
			type: 'tshirt',
			name: 'T-Shirt sizing',
			value: PATTERN_TSHIRT
		},
		{
			type: 'custom',
			name: 'Customizado',
			value: undefined
		}
	];

	const pokerContext = getContext<IPokerContext>('poker');
	const { current: currentPoker }: { current: Writable<Poker | undefined> } = pokerContext;

	const getOptionsFromPattern = (textPattern: string) => {
		return textPattern.split(',');
	};

	let votePattern = PATTERN_FIBONACCI;
	let voteType: VotePatternType = 'fibo';
	let voteOptions = getOptionsFromPattern(votePattern);

	const changePattern = (pattern: VotePattern) => {
		voteType = pattern.type;
		if (pattern.value !== undefined) {
			votePattern = pattern.value;
			voteOptions = getOptionsFromPattern(votePattern);
		}
	};

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

	const handleCustomPatternKeydown: KeyboardEventHandler<HTMLInputElement> = async (event) => {
		voteOptions = getOptionsFromPattern(votePattern);
	};

	currentPoker.subscribe((value) => {
		votePattern = value?.votePattern || PATTERN_FIBONACCI;

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
	});
</script>

<!-- Config Poker -->
<dialog id="modal-poker-config" class="modal modal-bottom sm:modal-middle">
	<form method="dialog" class="modal-box flex flex-col gap-4" on:submit={handlePokerUpdate}>
		<h3 class="font-bold text-xl pb-2">Configurar sessão de Planning Poker</h3>
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
								<div class="flex flex-row gap-1 pt-2">
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
				<button type="button" class="btn" on:click={() => closeModal('modal-poker-config')}>
					Cancelar
				</button>
				<button type="submit" class="btn btn-primary"> Confirmar </button>
			</div>
		</div>
	</form>
</dialog>
