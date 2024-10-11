<script>
	import '../app.postcss';
	import { goto } from '$app/navigation';

	function clearChat() {
		// Clear the chat history (you might need to implement this logic)
		// For now, we'll just reload the page
		goto('/', { invalidateAll: true });
	}
</script>

<div class="flex flex-col min-h-screen">
	<header class="bg-primary text-primary-content shadow-lg">
		<div class="container mx-auto px-4 py-3 flex justify-between items-center">
			<h1 class="text-2xl font-bold">RUTBOT</h1>
			<button class="btn btn-secondary btn-sm" on:click={clearChat}> Clear Chat </button>
		</div>
	</header>

	<main class="flex-grow container mx-auto px-4 py-8">
		<slot />
	</main>

	<footer class="bg-neutral text-neutral-content">
		<div class="container mx-auto px-4 py-3 text-center">
			<p>&copy; 2023 RUTBOT. All rights reserved.</p>
		</div>
	</footer>
</div>
