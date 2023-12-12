<script lang="ts">
	import type { KeyboardEventHandler } from 'svelte/elements';
	import VoteLabel from '../../../components/VoteLabel.svelte';

	export let options: string[] = [];

	let focusedIndex: number = 0;
	let inputValue = '0';
	let inputRef: HTMLInputElement;

	const focusOption = (index: number) => {
		focusedIndex = index;
		inputValue = options[focusedIndex];
		inputRef.focus();
	};

	const handleInputChange: KeyboardEventHandler<HTMLInputElement> = (ev) => {
		const value = ev.currentTarget.value;
		options[focusedIndex] = value;
	};
</script>

<div class="card-body flex-row">
	<div class="flex-grow flex flex-row flex-wrap gap-2">
		{#each options as vote, index}
			<button
				type="button"
				class="btn btn-secondary h-14 w-10 rounded-xl"
				class:btn-active={index === focusedIndex}
				on:click={() => focusOption(index)}
			>
				<VoteLabel value={vote} />
			</button>
		{/each}
		<button
			type="button"
			class="btn btn-primary h-14 w-10 rounded-xl"
			on:click={() => options.push('')}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				class="w-6 h-6"
			>
				<path
					fill-rule="evenodd"
					d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
	</div>
	<div class="btn btn-secondary h-28 w-20 rounded-xl p-0">
		<input
			type="text"
			class="input w-full h-full text-center bg-transparent p-0"
			bind:value={inputValue}
			bind:this={inputRef}
			on:keyup={handleInputChange}
		/>
	</div>
	<div class="join join-vertical">
		<button type="button" class="btn btn-sm btn-circle btn-ghost text-error join-item">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-6 h-6"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
		<button type="button" class="btn btn-sm btn-circle btn-ghost join-item">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-6 h-6"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
			</svg>
		</button>
		<button type="button" class="btn btn-sm btn-circle btn-ghost join-item">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-6 h-6"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
			</svg>
		</button>
	</div>
</div>
