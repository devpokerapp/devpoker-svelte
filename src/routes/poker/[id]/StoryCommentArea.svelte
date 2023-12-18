<script lang="ts">
	import { getContext } from 'svelte';
	import { get, type Writable } from 'svelte/store';

	const storyContext = getContext<IStoryContext>('story');
	const eventContext = getContext<IEventContext>('event');

	const { activeStoryId }: { activeStoryId: Writable<string> } = storyContext;

	let text: string = '';

	const handleSubmit = async (event: SubmitEvent) => {
		event.preventDefault();
		try {
			const result = await eventContext.create({
				id: '',
				type: 'comment',
				content: text,
				revealed: true,
				storyId: get(activeStoryId),
				creator: '',
				createdAt: '',
				updatedAt: ''
			});
			text = '';
		} catch (error) {}
	};
</script>

<div id="poker-comment-area">
	<form on:submit={handleSubmit}>
		<div class="join w-full">
			<input
				type="text"
				placeholder="Adicionar comentário"
				class="input input-bordered w-full join-item"
				bind:value={text}
			/>
			<button class="btn border-base-300 join-item">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="w-5 h-5"
				>
					<path
						d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z"
					/>
				</svg>
			</button>
		</div>
	</form>
</div>
