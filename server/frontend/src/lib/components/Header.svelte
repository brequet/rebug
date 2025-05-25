<script>
	import { authStore } from '$lib/stores/auth.svelte';
	import { Button } from './ui/button';
</script>

<header class="border-border bg-card border-b">
	<div class="mx-auto flex items-center justify-between px-4 py-4">
		<h1 class="text-foreground text-xl font-semibold">Rebug</h1>

		<div class="flex items-center gap-4">
			<span class="text-muted-foreground text-sm">
				Welcome, {authStore.user?.email}
			</span>
			<Button variant="outline" onclick={() => authStore.logout()}>Logout</Button>
		</div>
	</div>
</header>
