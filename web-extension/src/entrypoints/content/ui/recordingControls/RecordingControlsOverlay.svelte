<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import Move from '@lucide/svelte/icons/move';
	import Square from '@lucide/svelte/icons/square';
	import { onDestroy, onMount } from 'svelte';

	interface RecordingControlsOverlayProps {
		onClose: () => void;
		recordStartDate: Date;
	}

	let { onClose, recordStartDate }: RecordingControlsOverlayProps = $props();

	let secondsSinceStart = $state(computeSecondSinceStart());
	let position = $state({ x: 0, y: 0 });
	let isDragging = $state(false);
	let startDragPos = $state({ x: 0, y: 0 });
	let startOverlayPos = $state({ x: 0, y: 0 });
	let overlayRef: HTMLDivElement | null = $state(null);

	let dragBounds = $state({ minX: 0, maxX: 0, minY: 0, maxY: 0 });

	onMount(() => {
		const interval = setInterval(() => {
			secondsSinceStart = computeSecondSinceStart();
		}, 1000);
		return () => clearInterval(interval);
	});

	function computeSecondSinceStart(): number {
		const now = new Date();
		const startTime = recordStartDate instanceof Date ? recordStartDate.getTime() : Date.now();
		return Math.max(0, Math.floor((now.getTime() - startTime) / 1000));
	}

	function prettyPrintTime(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
	}

	async function handleStop() {
		onClose();
	}

	function handleMouseDown(event: MouseEvent) {
		if (event.button !== 0 || (event.target as Element)?.closest('button')) {
			return;
		}
		if (!overlayRef) return;

		isDragging = true;
		startDragPos = { x: event.clientX, y: event.clientY };
		startOverlayPos = { ...position };

		const rect = overlayRef.getBoundingClientRect();
		const winWidth = window.innerWidth;
		const winHeight = window.innerHeight;

		dragBounds = {
			minX: -rect.left + startOverlayPos.x,
			maxX: winWidth - rect.right + startOverlayPos.x,
			minY: -rect.top + startOverlayPos.y,
			maxY: winHeight - rect.bottom + startOverlayPos.y
		};

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('mouseleave', handleMouseUp);
		event.preventDefault();
	}

	function handleMouseMove(event: MouseEvent) {
		if (!isDragging) return;

		const dx = event.clientX - startDragPos.x;
		const dy = event.clientY - startDragPos.y;

		let targetX = startOverlayPos.x + dx;
		let targetY = startOverlayPos.y + dy;

		const clampedX = Math.max(dragBounds.minX, Math.min(targetX, dragBounds.maxX));
		const clampedY = Math.max(dragBounds.minY, Math.min(targetY, dragBounds.maxY));

		position = {
			x: clampedX,
			y: clampedY
		};
	}

	function handleMouseUp() {
		if (!isDragging) return;
		isDragging = false;
		window.removeEventListener('mousemove', handleMouseMove);
		window.removeEventListener('mouseup', handleMouseUp);
		window.removeEventListener('mouseleave', handleMouseUp);
	}

	onDestroy(() => {
		window.removeEventListener('mousemove', handleMouseMove);
		window.removeEventListener('mouseup', handleMouseUp);
		window.removeEventListener('mouseleave', handleMouseUp);
	});

	let transformStyle = $derived(`translate(${position.x}px, ${position.y}px)`);
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<div
	bind:this={overlayRef}
	class={cn(
		'border-border fixed bottom-5 left-1/2 z-[2147483647] flex -translate-x-1/2 transform items-center gap-3 rounded-lg border bg-neutral-900/90 p-2 text-white shadow-lg backdrop-blur-sm transition-shadow',
		isDragging ? 'cursor-grabbing shadow-xl' : 'cursor-grab shadow-sm'
	)}
	style:transform={transformStyle}
	onmousedown={handleMouseDown}
	role="dialog"
	aria-label="Recording Controls"
	aria-describedby="recording-timer"
>
	<!-- Drag Handle -->
	<div class="text-muted-foreground flex items-center px-1" aria-hidden="true">
		<Move class="size-4" />
	</div>

	<!-- Recording Indicator & Timer -->
	<div class="flex items-center gap-2">
		<span class="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" aria-label="Recording active"
		></span>
		<span
			id="recording-timer"
			class="font-mono text-sm tabular-nums"
			aria-label="Recording duration">{prettyPrintTime(secondsSinceStart)}</span
		>
	</div>

	<!-- Stop Button -->
	<Button
		variant="destructive"
		size="sm"
		onclick={handleStop}
		class="h-auto cursor-pointer px-3 py-1"
	>
		<Square class="mr-1 size-3.5 fill-current" />
	</Button>
</div>
