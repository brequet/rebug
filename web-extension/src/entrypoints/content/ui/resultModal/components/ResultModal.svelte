<script lang="ts">
	import { modalStore } from '../modal.store';
	import ModalContent from './ModalContent.svelte';
</script>

{#if $modalStore.isOpen}
	<div
		class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		onkeydown={(event) => event.key === 'Escape' && close()}
		role="dialog"
		tabindex="0"
	>
		<ModalContent />
	</div>
{/if}
