<script lang="ts">
	let {
		onClose,
		recordStartDate
	}: {
		onClose: () => void;
		recordStartDate: Date | undefined;
	} = $props();

	let secondSinceStart = $state(computeSecondSinceStart());

	onMount(() => {
		const interval = setInterval(() => {
			secondSinceStart++;
		}, 1000);

		return () => clearInterval(interval);
	});

	function computeSecondSinceStart(): number {
		if (!recordStartDate) return 0;
		const now = new Date();
		return Math.floor((now.getTime() - recordStartDate.getTime()) / 1000);
	}

	function prettyPrintTime(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
	}

	async function handleStop() {
		console.log('Stopping tab capture...');
		onClose();
	}
</script>

<div class="recording-controls">
	<div class="recording-indicator">
		<span class="recording-dot"></span>
		<span>{prettyPrintTime(secondSinceStart)}</span>
	</div>
	<button class="stop-button" onclick={handleStop}> Stop Recording </button>
</div>

<style>
	.recording-controls {
		position: fixed;
		top: 20px;
		right: 20px;
		background: #333;
		color: white;
		padding: 10px 15px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		gap: 15px;
		z-index: 10000;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.recording-indicator {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.recording-dot {
		width: 12px;
		height: 12px;
		background: red;
		border-radius: 50%;
		animation: pulse 1.5s infinite;
	}

	.stop-button {
		background: #ff3e3e;
		border: none;
		color: white;
		padding: 5px 10px;
		border-radius: 4px;
		cursor: pointer;
		font-weight: bold;
	}

	@keyframes pulse {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
		100% {
			opacity: 1;
		}
	}
</style>
