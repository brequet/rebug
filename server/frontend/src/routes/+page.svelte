<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	let count = $state(0);
</script>

<main class="p-4">
	<h1 class="text-3xl">Welcome to SvelteKit</h1>
	<p>
		Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation
	</p>

	<div class="flex flex-col">
		<a href="about" class="text-blue-500">About</a>
		<a href="dynamic-route" class="text-blue-500">Dynamic route</a>
	</div>

	<Button onclick={() => count++}>
		Click: {count}
	</Button>
</main>
