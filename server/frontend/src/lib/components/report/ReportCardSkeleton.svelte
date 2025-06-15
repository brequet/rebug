<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<div class="flex h-full flex-col overflow-hidden rounded-lg border">
	<Skeleton class="aspect-video w-full rounded-b-none" />
	<div class="flex-1 space-y-3 p-4">
		<Skeleton class="h-4 w-4/5" />
		<div class="flex justify-between">
			<Skeleton class="h-4 w-1/3" />
			<Skeleton class="h-4 w-4" />
		</div>
	</div>
</div>
