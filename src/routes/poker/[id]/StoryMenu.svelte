<script lang="ts">
	import { getContext } from 'svelte';
	import { get, type Writable } from 'svelte/store';
	import { closeModal, openModal } from '../../../util/modal';

	const SMALL_DELAY_TO_ALLOW_CLICKS = 100;

	const pokerContext = getContext<IPokerContext>('poker');
	const storyContext = getContext<IStoryContext>('story');
	const {
		entities: stories,
		activeStoryId
	}: { entities: Writable<Story[]>; activeStoryId: Writable<string> } = storyContext;

	export let pokerId: string;
	export let maxListHeight: string = '100px';

	let name: string = '';
	let description: string | undefined;
	let loading = false;
	let updating: Story | undefined = undefined;
	let deleting: Story | undefined = undefined;
	let focusing: Story | undefined = undefined;
	let showFocused = false;
	let focusMenuHeight = 0;
	let scrollingContainer: HTMLDivElement;

	const exportAsCSV = () => {
		const content = get(stories)
			.map((story) => `${story.name},${story.value || ''}`)
			.join('\n');
		const csv = `User story,Valor\n${content}`;
		console.log(csv);
	};

	const handleCreateStory = async (event: SubmitEvent) => {
		event.preventDefault();
		loading = true;

		const wasEmptyBefore = get(stories).length < 1;

		try {
			const story = await storyContext.create({
				name: name,
				description: description,
				pokerId,
				id: '',
				createdAt: '',
				updatedAt: '',
				value: undefined,
				events: [],
				pollings: []
			});

			if (story === undefined) {
				throw Error('Failed to create story!');
			}

			name = '';
			description = undefined;

			if (wasEmptyBefore) {
				// auto activates if is the first story added
				pokerContext.selectStory(story.id);
			}
		} catch (error) {
			console.error(error);
		} finally {
			loading = false;
			closeModal('modal-story-create');
		}
	};

	const handleStartUpdateStory = (entity: Story) => {
		updating = entity;
		openModal('modal-story-update');
	};

	const handleUpdateStory = async (event: SubmitEvent) => {
		event.preventDefault();
		loading = true;

		try {
			if (updating === undefined) {
				throw Error('Unable to locate updated story!');
			}

			const story = await storyContext.update(updating.id, updating);

			if (story === undefined) {
				throw Error('Failed to update story!');
			}

			updating = undefined;
		} catch (error) {
			console.error(error);
		} finally {
			loading = false;
			closeModal('modal-story-update');
			closeModal('modal-story-options');
		}
	};

	const handleStartDeleteStory = (entity: Story) => {
		deleting = entity;
		openModal('modal-story-delete');
	};

	const handleDeleteStory = async (event: SubmitEvent) => {
		event.preventDefault();
		loading = true;

		try {
			if (deleting === undefined) {
				throw Error('Unable to locate deleted story!');
			}

			if (get(activeStoryId) === deleting.id) {
				await pokerContext.selectStory(undefined);
			}

			await storyContext.remove(deleting.id);
		} catch (error) {
			console.error(error);
		} finally {
			loading = false;
			closeModal('modal-story-delete');
			closeModal('modal-story-options');
		}
	};

	const handleSelectStory = async (entity: Story) => {
		loading = true;
		try {
			await pokerContext.selectStory(entity.id);
		} catch (error) {
			console.error(error);
		} finally {
			loading = false;
			closeModal('modal-story-options');
		}
	};

	const handleExport = async () => {
		exportAsCSV();
	};
</script>

<div id="story-menu" class="card-body p-0">
	<div class="flex flex-row px-8 pt-8 pb-2">
		<h3 class="card-title text-2xl flex-grow">User Stories</h3>
		<div class="dropdown dropdown-end">
			<button tabindex="0" class="btn btn-circle btn-sm">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="w-5 h-5"
				>
					<path
						d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z"
					/>
				</svg>
			</button>
			<ul tabindex="-1" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
				<li>
					<button on:click={() => openModal('modal-story-create')}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							class="w-5 h-5"
						>
							<path
								d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"
							/>
						</svg>
						Adicionar
					</button>
				</li>
				<li>
					<button on:click={() => openModal('modal-story-export')}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							class="w-5 h-5"
						>
							<path
								d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z"
							/>
							<path
								d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z"
							/>
						</svg>
						Exportar
						<div class="badge badge-primary">CSV</div>
					</button>
				</li>
			</ul>
		</div>
	</div>
	<div
		id="story-menu-list"
		class="overflow-y-auto"
		style="max-height: {maxListHeight}; min-height: 6rem;"
		bind:this={scrollingContainer}
		on:scroll={() => {
			showFocused = false;
		}}
	>
		{#if $stories.length < 1}
			<div class="px-8 py-4">
				<p class="text-gray-500">Você ainda não criou nenhuma User Story.</p>
			</div>
		{/if}
		{#each $stories as story, index}
			{#if index !== 0}
				<div class="divider my-0 px-8" />
			{/if}
			<div class="flex flex-row px-8">
				<button
					title={story.name}
					class="flex-grow truncate py-3 text-left {$activeStoryId === story.id ? 'font-bold' : ''}"
					on:click={() => pokerContext.selectStory(story.id)}
				>
					<span class="pr-1">
						{story.name}
					</span>
				</button>
				{#if story.value !== null}
					<span class="badge badge-accent">
						{story.value}
					</span>
				{/if}
				<div>
					<button
						tabindex="0"
						class="btn btn-sm btn-circle btn-ghost"
						on:click={(ev) => {
							focusMenuHeight = ev.currentTarget.offsetTop - scrollingContainer.scrollTop;
							focusing = story;
							openModal('modal-story-options');
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							class="w-5 h-5"
						>
							<path
								fill-rule="evenodd"
								d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
								clip-rule="evenodd"
							/>
						</svg>
					</button>
				</div>
			</div>
		{/each}
	</div>
	<div class="card-actions px-8 pt-2 pb-8">
		<button class="btn btn-primary w-full" on:click={() => openModal('modal-story-create')}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="w-5 h-5"
			>
				<path
					d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"
				/>
			</svg>
			Adicionar
		</button>
	</div>
	<!-- Create Modal -->
	<dialog id="modal-story-create" class="modal modal-bottom sm:modal-middle">
		<form method="dialog" class="modal-box flex flex-col gap-4" on:submit={handleCreateStory}>
			<h3 class="font-bold text-xl pb-2">Adicionar User Story</h3>
			<input type="text" placeholder="Nome" class="input input-bordered w-full" bind:value={name} />
			<textarea
				class="textarea textarea-bordered"
				placeholder="Descrição"
				bind:value={description}
			/>
			<div class="modal-action">
				<div class="flex flex-row gap-4">
					<button type="reset" class="btn" on:click={() => closeModal('modal-story-create')}>
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
	<!-- Update Modal -->
	<dialog id="modal-story-update" class="modal modal-bottom sm:modal-middle">
		<form method="dialog" class="modal-box flex flex-col gap-4" on:submit={handleUpdateStory}>
			<h3 class="font-bold text-xl pb-2">Atualizar User Story</h3>
			{#if updating !== undefined}
				<input
					type="text"
					placeholder="Nome"
					class="input input-bordered w-full"
					bind:value={updating.name}
				/>
				<textarea
					class="textarea textarea-bordered"
					placeholder="Descrição"
					bind:value={updating.description}
				/>
				<!-- TODO: updating.value -->
			{/if}
			<div class="modal-action">
				<div class="flex flex-row gap-4">
					<button type="reset" class="btn" on:click={() => closeModal('modal-story-update')}>
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
	<!-- Delete Modal -->
	<dialog id="modal-story-delete" class="modal modal-bottom sm:modal-middle">
		<form method="dialog" class="modal-box flex flex-col gap-4" on:submit={handleDeleteStory}>
			<h3 class="font-bold text-xl pb-2">Remover "{deleting?.name}"</h3>
			<p>Tem certeza que deseja remover esse user story?</p>
			<div class="">
				<div class="flex flex-row gap-4">
					<button
						type="reset"
						class="btn flex-grow"
						on:click={() => closeModal('modal-story-delete')}
					>
						Cancelar
					</button>
					<button type="submit" class="btn btn-error flex-grow" disabled={loading}>
						Confirmar
					</button>
				</div>
			</div>
		</form>
		<form method="dialog" class="modal-backdrop">
			<button>close</button>
		</form>
	</dialog>
	<!-- Story context menu -->
	<dialog id="modal-story-options" class="modal modal-bottom sm:modal-middle">
		<ul
			class="modal-box p-2 menu sm:rounded-box sm:w-52 sm:absolute sm:left-20"
			style="top: {focusMenuHeight + 32}px;"
		>
			<li>
				<button on:click={() => focusing !== undefined && handleSelectStory(focusing)}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-5 h-5"
					>
						<path
							fill-rule="evenodd"
							d="M10 1a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 1zM5.05 3.05a.75.75 0 011.06 0l1.062 1.06A.75.75 0 116.11 5.173L5.05 4.11a.75.75 0 010-1.06zm9.9 0a.75.75 0 010 1.06l-1.06 1.062a.75.75 0 01-1.062-1.061l1.061-1.06a.75.75 0 011.06 0zM3 8a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 013 8zm11 0a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 0114 8zm-6.828 2.828a.75.75 0 010 1.061L6.11 12.95a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zm3.594-3.317a.75.75 0 00-1.37.364l-.492 6.861a.75.75 0 001.204.65l1.043-.799.985 3.678a.75.75 0 001.45-.388l-.978-3.646 1.292.204a.75.75 0 00.74-1.16l-3.874-5.764z"
							clip-rule="evenodd"
						/>
					</svg>
					Selecionar
				</button>
			</li>
			<li>
				<button on:click={() => focusing !== undefined && handleStartUpdateStory(focusing)}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-5 h-5"
					>
						<path
							d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z"
						/>
						<path
							d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z"
						/>
					</svg>
					Editar
				</button>
			</li>
			<li>
				<button
					class="text-error"
					on:click={() => focusing !== undefined && handleStartDeleteStory(focusing)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-5 h-5"
					>
						<path
							fill-rule="evenodd"
							d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
							clip-rule="evenodd"
						/>
					</svg>
					Remover
				</button>
			</li>
		</ul>
		<form method="dialog" class="modal-backdrop bg-transparent">
			<button>close</button>
		</form>
	</dialog>
	<!-- Export Modal -->
	<dialog id="modal-story-export" class="modal modal-bottom sm:modal-middle">
		<form method="dialog" class="modal-box flex flex-col gap-4 p-0" on:submit={handleExport}>
			<h3 class="font-bold text-xl p-6 pb-2">Exportar User Stories</h3>
			<p class="px-6">Os valores serão exportado em formato de arquivos CSV.</p>
			<div class="max-h-44 overflow-x-auto">
				<table class="table table-zebra table-pin-rows">
					<thead>
						<tr>
							<th class="pl-6"> Story </th>
							<th class="pr-6"> Valor </th>
						</tr>
					</thead>
					<tbody>
						{#each $stories as story, index}
							<tr>
								<td class="pl-6">
									{story.name}
								</td>
								<td class="pr-6">
									{story.value || ''}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div class="modal-action p-6 pt-0">
				<div class="flex flex-row gap-4">
					<button type="reset" class="btn" on:click={() => closeModal('modal-story-export')}>
						Cancelar
					</button>
					<button type="submit" class="btn btn-info" disabled={loading}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							class="w-5 h-5"
						>
							<path
								d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z"
							/>
							<path
								d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z"
							/>
						</svg>
						Baixar
					</button>
				</div>
			</div>
		</form>
		<form method="dialog" class="modal-backdrop">
			<button>close</button>
		</form>
	</dialog>
</div>

<style>
	@media (min-width: 640px) {
		#modal-story-options::backdrop {
			background-color: transparent;
		}
	}
</style>
