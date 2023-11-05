<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import Deck from './Deck.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let poker: Poker | undefined = undefined;

	const votes = ['1', '2', '3', '4'];
	const comments = [
		'Acho que seria importante considerar os testes para a estimativa de esforços.',
		'Precisa definir bem quais tipos de ingredientes poderão estar na checklist.'
	];

	const websocket = getContext<IWebSocketContext>('websocket');

	websocket.listen('poker_retrieved', (message) => {
		const retrieved = message.data as Poker;
		poker = retrieved;
	})

	onMount(() => {
		websocket.asap(() => {
			// auto register
			websocket.send({
				service: 'poker_service',
				method: 'join',
				data: {
					channel: data.id
				}
			});
			websocket.send({
				service: 'poker_service',
				method: 'retrieve',
				data: {
					entity_id: data.id
				}
			});
		});
	})
</script>

<section style="padding-bottom: 10em;">
	<div class="flex flex-row justify-center">
		<div id="poker-main" class="flex flex-col gap-6 max-w-lg">
			<h3>Sessão de planning poker #{poker?.id || ''}</h3>
			<div class="text-[2.3rem] lg:text-5xl leading-9 font-bold text-center">
				<h2>Adicionar checklist de ingredientes</h2>
			</div>
			<p class="text-gray-500">
				Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolorem reprehenderit quasi
				possimus facere nostrum voluptates eligendi quo? Laborum vero corporis, quam est, similique
				nulla officiis mollitia placeat praesentium ipsum iste?
			</p>
			<div id="poker-voting" class="flex gap-2">
				{#each votes as vote}
					<div class="btn btn-circle btn-info">
						{vote}
					</div>
				{/each}
				<div class="flex-grow" />
				<button class="btn btn-circle btn-accent"> 👁️ </button>
				<button class="btn btn-circle btn-accent"> ✅ </button>
			</div>
			<div id="poker-comment-area">
				<input type="text" placeholder="Adicionar comentário" class="input input-bordered w-full" />
			</div>
			{#each comments as comment}
				<div class="card border-2">
					<div class="card-body flex flex-row gap-8">
						<button class="btn btn-circle btn-info" />
						<div>
							<p>
								{comment}
							</p>
							<div class="text-right">
								<p class="text-gray-500">01/10/2023, 18:27</p>
							</div>
						</div>
					</div>
				</div>
			{/each}
			<p class="text-center">
				Estimativa definida como <strong>5</strong> story points
			</p>
		</div>
		<div class="fixed bottom-0 pb-8">
			<Deck />
		</div>
	</div>
</section>