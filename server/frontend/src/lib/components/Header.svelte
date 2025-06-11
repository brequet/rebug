<script>
	import { authStore } from '$lib/stores/auth.svelte';
	import { Button } from './ui/button';
</script>

<header class="border-border bg-card border-b">
	<div class="mx-auto flex items-center justify-between px-4 py-4">
		<a
			href="/"
			class="text-foreground focus-visible:ring-primary rounded text-xl font-semibold focus:outline-none focus-visible:ring-2"
			aria-label="Go to homepage"
		>
			Rebug
		</a>

		<div class="flex items-center gap-4">
			<span class="text-muted-foreground text-sm">
				Welcome, {authStore.user?.email}
			</span>
			<Button variant="outline" onclick={() => authStore.logout()}>Logout</Button>
		</div>
	</div>
</header>
