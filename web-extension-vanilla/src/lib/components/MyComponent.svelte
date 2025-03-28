<script>
	let count = $state(0);
	let doubled = $derived(count * 2);

	function increment() {
		count++;
	}
</script>

<div class="my-injected-component text-red-500">
	<h2>Injected Svelte 5 Component</h2>
	<p>Count: {count}</p>
	<p>Doubled: {doubled}</p>
	<button onclick={increment}>Increment</button>
</div>

<style>
	.my-injected-component {
		position: fixed;
		bottom: 20px;
		right: 20px;
		background: white;
		padding: 15px;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
		z-index: 9999;
	}
</style>
