<script lang="ts">
import ModalContent from '$lib/components/ModalContent.svelte';
import { modalStore } from '$lib/stores/modal.store';

function close() {
	modalStore.close();
}
</script>

{#if $modalStore.isOpen}
	<div
		class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		onkeydown={(event) => event.key === "Escape" && close()}
		role="dialog"
		tabindex="0"
	>
		<ModalContent imageString={$modalStore.props.imageString || ""} close={close} />
	</div>
{/if}
