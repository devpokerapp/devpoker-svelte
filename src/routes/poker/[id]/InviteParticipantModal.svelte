<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import QrCode from '../../../components/QrCode.svelte';
	import { closeModal } from '../../../util/modal';

	const websocket = getContext<IWebSocketContext>('websocket');

	export let pokerId: string;
	export let url: string;

	let inviteLink: string = '';
	let loading: boolean = false;

	const generateInviteLink = async () => {
		const oneDay = 86400000;
		const now = new Date().getTime();
		const expirationDate = new Date(now + oneDay).toISOString();
		const response = await websocket.sendAndWait({
			service: 'invite_service',
			method: 'create',
			data: {
				payload: {
					pokerId: pokerId,
					expiresAt: expirationDate
				}
			}
		});

		if (!response.success) {
			// TODO: show error
			return;
		}

		const invite = response.result as Invite;
		const inviteFullURL = new URL(url);
		inviteFullURL.searchParams.set('i', invite.code);

		inviteLink = inviteFullURL.toString();
	};

	onMount(() => {
		websocket.asap(() => {
			generateInviteLink(pokerId);
		});
	});

	const handleCopyInvite = async (event: SubmitEvent) => {
		event.preventDefault();
		navigator.clipboard.writeText(inviteLink);
		closeModal('modal-participant-invite');
	};
</script>

<dialog id="modal-participant-invite" class="modal modal-bottom sm:modal-middle">
	<form method="dialog" class="modal-box flex flex-col gap-4" on:submit={handleCopyInvite}>
		<h3 class="font-bold text-xl pb-2">Convidar participantes</h3>
		<p class="text-gray-500">Convide mais pessoas para a sessão através do QRCode:</p>
		{#if inviteLink.length > 0}
			<div class="px-4 lg:px-32">
				<QrCode uri={inviteLink} />
			</div>
		{/if}
		<p class="text-gray-500">Ou copie este link:</p>
		<textarea
			class="textarea textarea-bordered text-gray-500 resize-none"
			placeholder="Link de acesso"
			readonly
			value={inviteLink}
		/>
		<div class="modal-action">
			<div class="flex flex-row gap-4">
				<button class="btn" on:click={() => closeModal('modal-participant-invite')}>
					Cancelar
				</button>
				<button type="submit" class="btn btn-info">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-5 h-5"
					>
						<path
							fill-rule="evenodd"
							d="M13.887 3.182c.396.037.79.08 1.183.128C16.194 3.45 17 4.414 17 5.517V16.75A2.25 2.25 0 0114.75 19h-9.5A2.25 2.25 0 013 16.75V5.517c0-1.103.806-2.068 1.93-2.207.393-.048.787-.09 1.183-.128A3.001 3.001 0 019 1h2c1.373 0 2.531.923 2.887 2.182zM7.5 4A1.5 1.5 0 019 2.5h2A1.5 1.5 0 0112.5 4v.5h-5V4z"
							clip-rule="evenodd"
						/>
					</svg>
					Copiar
				</button>
			</div>
		</div>
	</form>
</dialog>
