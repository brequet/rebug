<script lang="ts">
	interface Props {
		userName?: string;
	}

	let { userName = 'Anonymous User' }: Props = $props();

	const currentDate = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(new Date());
</script>

<div class="flex items-center gap-3 border-b p-4">
	<div
		class="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium"
	>
		{userName.charAt(0).toUpperCase()}
	</div>
	<div class="min-w-0 flex-1">
		<p class="truncate text-sm font-medium">{userName}</p>
		<p class="text-muted-foreground text-xs">{currentDate}</p>
	</div>
</div>
