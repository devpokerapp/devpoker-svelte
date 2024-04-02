<script lang="ts">
	import NavSidebar from '../NavSidebar.svelte';
</script>

<svelte:head>
	<title>Meus projetos - DevPoker</title>
</svelte:head>
<NavSidebar>
	<section>
		<div class="flex flex-row justify-center">
			<div id="projects-main" class="flex flex-col gap-6 max-w-lg">
				<div class="text-5xl leading-snug font-bold text-left pt-6 relative">Meus projetos</div>
				<p>Observe informações sobre seus projetos e sessões participadas.</p>
				<div class="card bg-info shadow-xl">
					<div class="card-body">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
							/>
						</svg>
						<h2 class="card-title">Você ainda não pode criar projetos!</h2>
						<p>
							Para acessar essa funcionalidade você precisa do
							<a class="link" href="/#premium">plano premium</a>.
						</p>
						<div class="card-actions justify-end pt-4">
							<a class="btn btn-block btn-primary" href="/#premium"> Obter acesso </a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</NavSidebar>
