<script lang="ts">
	import { getContext } from 'svelte';
	import { get, type Writable } from 'svelte/store';
	import { closeModal, openModal } from '../../../util/modal';

	const storyContext = getContext<IStoryContext>('story');
	const {
		entities,
		activeStoryId
	}: { entities: Writable<Story[]>; activeStoryId: Writable<string> } = storyContext;

	export let pokerId: string;

	let name: string = '';
	let description: string | undefined;
	let loading = false;
	let deleting: Story | undefined = undefined;

	const handleCreateStory = async (event: SubmitEvent) => {
		event.preventDefault();
		loading = true;

		const wasEmptyBefore = get(entities).length < 1;

		try {
			const story = await storyContext.create({
				name: name,
				description: description,
				pokerId,
				id: '',
				createdAt: '',
				updatedAt: '',
				value: undefined
			});

			if (story === undefined) {
				throw Error('Failed to create story!');
			}

			name = '';
			description = undefined;

			if (wasEmptyBefore) {
				// auto activates if is the first story added
				storyContext.activate(story.id);
			}
		} catch (error) {
			console.error(error);
		} finally {
			loading = false;
			closeModal('modal-story-create');
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

			const originalId = deleting.id;

			await storyContext.remove(deleting.id);

			if (get(activeStoryId) === originalId) {
				storyContext.activate(undefined);
			}
		} catch (error) {
			console.error(error);
		} finally {
			loading = false;
			closeModal('modal-story-delete');
		}
	};
</script>

<div id="story-menu" class="card border border-base-200 shadow w-72 bg-white">
	<div class="card-body">
		<h3 class="card-title text-center text-2xl">User Stories</h3>
		<div class="py-6">
			{#if $entities.length < 1}
				<p class="text-gray-500">Você ainda não criou nenhuma User Story.</p>
			{/if}
			{#each $entities as entity, index}
				{#if index !== 0}
					<div class="divider my-0" />
				{/if}
				<div class="flex flex-row">
					<button
						class="flex-grow py-3 text-left {$activeStoryId === entity.id ? 'font-bold' : ''}"
						on:click={() => storyContext.activate(entity.id)}
					>
						{entity.name}
					</button>
					<div>
						<!-- buttons -->
						<!-- <button class="btn btn-sm btn-circle btn-info">5</button> -->
						<div class="dropdown dropdown-end">
							<button tabindex="-1" class="btn btn-sm btn-circle btn-ghost">...</button>
							<ul
								tabindex="-1"
								class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
							>
								<li>
									<button on:click={() => storyContext.activate(entity.id)}>Selecionar</button>
								</li>
								<li>
									<button>Editar</button>
								</li>
								<li>
									<button class="text-error" on:click={() => handleStartDeleteStory(entity)}>
										Remover
									</button>
								</li>
							</ul>
						</div>
					</div>
				</div>
			{/each}
		</div>
		<div class="card-actions">
			<button class="btn btn-primary w-full" on:click={() => openModal('modal-story-create')}>
				+ Adicionar
			</button>
		</div>
		<!-- Create Modal -->
		<dialog id="modal-story-create" class="modal modal-bottom sm:modal-middle">
			<form method="dialog" class="modal-box flex flex-col gap-4" on:submit={handleCreateStory}>
				<h3 class="font-bold text-xl pb-2">Adicionar User Story</h3>
				<input
					type="text"
					placeholder="Nome"
					class="input input-bordered w-full"
					bind:value={name}
				/>
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
						<button type="submit" class="btn btn-primary flex-grow" disabled={loading}>
							Confirmar
						</button>
					</div>
				</div>
			</form>
			<form method="dialog" class="modal-backdrop">
				<button>close</button>
			</form>
		</dialog>
	</div>
</div>
