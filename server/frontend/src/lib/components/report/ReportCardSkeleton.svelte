<script lang="ts">
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<Card class="w-full flex-shrink-0">
	<CardHeader>
		<Skeleton class="h-4 w-4/5" />
	</CardHeader>
	<CardContent>
		<div class="space-y-2">
			<Skeleton class="h-32 w-full" />
			<Skeleton class="h-4 w-1/3" />
		</div>
	</CardContent>
</Card>
