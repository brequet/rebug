<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { SelectionArea } from '$lib/types/capture';
	import { cn } from '$lib/utils';

	interface Props {
		onComplete: (selectionArea: SelectionArea) => void;
		onCancel: () => void;
	}

	let { onComplete, onCancel }: Props = $props();

	let startX = $state(0);
	let startY = $state(0);
	let endX = $state(0);
	let endY = $state(0);
	let isSelecting = $state(false);

	let selection = $state<HTMLDivElement | null>(null);

	let selectionStyle = $derived({
		left: `${Math.min(startX, endX)}px`,
		top: `${Math.min(startY, endY)}px`,
		width: `${Math.abs(endX - startX)}px`,
		height: `${Math.abs(endY - startY)}px`
	});

	function handleMouseDown(e: MouseEvent) {
		isSelecting = true;
		startX = e.clientX;
		startY = e.clientY;
		endX = e.clientX;
		endY = e.clientY;
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isSelecting) return;
		endX = e.clientX;
		endY = e.clientY;
	}

	async function handleMouseUp() {
		if (!isSelecting) return;
		isSelecting = false;

		if (Math.abs(endX - startX) < 10 || Math.abs(endY - startY) < 10) {
			// Selection too small, ignore
			return;
		}

		try {
			if (!selection) return;

			selection.style.visibility = 'hidden';

			const devicePixelRatio = window.devicePixelRatio || 1;

			onComplete({
				x: Math.min(startX, endX),
				y: Math.min(startY, endY),
				width: Math.abs(endX - startX),
				height: Math.abs(endY - startY),
				devicePixelRatio
			});
		} catch (error) {
			console.error('Screenshot capture failed:', error);
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			isSelecting = false;
			onCancel();
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="fixed inset-0 z-[2147483647] cursor-crosshair"
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	role="application"
	aria-label="Screenshot selection area"
>
	<!-- Background with hole -->
	<div
		class="background-with-hole"
		style:--selection-left={selectionStyle.left}
		style:--selection-top={selectionStyle.top}
		style:--selection-width={selectionStyle.width}
		style:--selection-height={selectionStyle.height}
	></div>

	<!-- Selection border -->
	<div
		class="border-primary pointer-events-none absolute border border-dashed bg-transparent"
		bind:this={selection}
		style:left={selectionStyle.left}
		style:top={selectionStyle.top}
		style:width={selectionStyle.width}
		style:height={selectionStyle.height}
	></div>

	<div class={cn('fixed bottom-5 right-5', isSelecting ? 'hidden' : '')}>
		<Button variant="destructive" onclick={onCancel} class="px-4 py-2">Cancel</Button>
	</div>
</div>

<style>
	.background-with-hole {
		position: absolute;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.3);
		clip-path: polygon(
			0% 0%,
			100% 0%,
			100% 100%,
			0% 100%,
			0% 0%,
			var(--selection-left) var(--selection-top),
			var(--selection-left) calc(var(--selection-top) + var(--selection-height)),
			calc(var(--selection-left) + var(--selection-width))
				calc(var(--selection-top) + var(--selection-height)),
			calc(var(--selection-left) + var(--selection-width)) var(--selection-top),
			var(--selection-left) var(--selection-top)
		);
	}
</style>
