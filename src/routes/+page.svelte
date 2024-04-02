<script lang="ts">
	import AuthButton from '../components/AuthButton.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="absolute top-2 right-2">
	<AuthButton />
</div>
<section class="bg-base-200">
	<div class="hero min-h-screen -mb-12">
		<div class="hero-content text-center">
			<div class="max-w-md">
				<h1 class="text-5xl font-bold">DevPoker</h1>
				<p class="py-6">
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste quaerat illo corrupti
					soluta. Unde itaque reprehenderit voluptatibus sed tempore? Inventore vel excepturi ab
					blanditiis laborum nulla itaque enim saepe deleniti.
				</p>
				<a class="btn btn-primary" href="/poker"> Começar </a>
			</div>
		</div>
	</div>
	<div class="min-h-12">
		<div class="flex flex-row justify-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-6 h-6"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
			</svg>
		</div>
	</div>
</section>
<section id="premium" class="bg-primary">
	<div class="hero py-32">
		<div class="hero-content">
			<div class="max-w-md">
				<h1 class="text-5xl font-bold">Plano premium</h1>
				<p class="py-6">
					Obtenha funcionalidades adicionais contratando o plano premium do DevPoker.
				</p>
				<ul class="list-disc pl-6 pb-6">
					<li>Número ilimitado de participantes;</li>
					<li>Organização de projetos;</li>
					<li>Sistemas de métricas;</li>
					<li>Integração com sistemas externos.</li>
				</ul>
				<a class="btn btn-info" href="/"> Contrate já </a>
			</div>
		</div>
	</div>
</section>
<footer class="footer p-12 bg-base-100 text-base-content">
	<aside>
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
		<p><span class="card-title text-3xl">DevPoker</span><br />Arthur Medeiros, 2024</p>
	</aside>
</footer>
