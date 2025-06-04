<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import X from '@lucide/svelte/icons/x';
	import { onDestroy } from 'svelte';
	import { modalStore } from '../modalStore.svelte';
	import ActionPanel from './ActionPanel.svelte';
	import MediaPreview from './MediaPreview.svelte';

	let videoUrl: string | null = $state(null);

	$effect(() => {
		if (modalStore.props.videoBlob) {
			videoUrl = URL.createObjectURL(modalStore.props.videoBlob);
		}
	});

	onDestroy(() => {
		if (videoUrl) {
			URL.revokeObjectURL(videoUrl);
		}
	});

	function close() {
		modalStore.close();
	}
</script>

<Card class="flex h-[85vh] max-h-[800px] w-[95vw] max-w-[1200px] flex-col overflow-hidden">
	<CardHeader class="flex h-16 shrink-0 flex-row items-center justify-between border-b p-4">
		<h2 class="text-lg font-semibold">Rebug Capture</h2>
		<Button variant="ghost" onclick={close}>
			<X class="size-4" />
		</Button>
	</CardHeader>

	<CardContent class="flex min-h-0 flex-1 p-0">
		<div class="flex h-full flex-1">
			<MediaPreview props={modalStore.props} />
			<ActionPanel props={modalStore.props} {videoUrl} />
		</div>
	</CardContent>
</Card>
