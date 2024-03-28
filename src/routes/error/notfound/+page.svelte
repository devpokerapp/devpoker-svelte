<script>
	import AuthButton from '../../../components/AuthButton.svelte';
</script>

<svelte:head>
	<title>Erro - Não encontrado</title>
</svelte:head>

<section class="bg-base-200">
	<div class="absolute top-2 right-2">
		<AuthButton />
	</div>
	<div class="hero min-h-screen">
		<div class="hero-content text-left">
			<div class="max-w-lg">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="w-6 h-6"
				>
					<path
						fill-rule="evenodd"
						d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
						clip-rule="evenodd"
					/>
				</svg>

				<h1 class="text-5xl font-bold">Não encontrado!</h1>
				<p class="py-6">
					Não foi possível encontrar o recurso. Por favor, verifique o método de acesso e tente
					novamente.
				</p>
				<a class="btn btn-primary" href="/">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="w-4 h-4"
					>
						<path
							d="M8.543 2.232a.75.75 0 0 0-1.085 0l-5.25 5.5A.75.75 0 0 0 2.75 9H4v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V9h1.25a.75.75 0 0 0 .543-1.268l-5.25-5.5Z"
						/>
					</svg>
					Voltar para o início
				</a>
			</div>
		</div>
	</div>
</section>
