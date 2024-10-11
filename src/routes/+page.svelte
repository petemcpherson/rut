<script>
	import { onMount, afterUpdate, tick } from 'svelte';

	let messages = [];
	let newMessage = '';
	let isLoading = false;
	let chatContainer;
	let inputField; // New variable to reference the input field
	let currentStreamingMessage = ''; // New variable to hold the current streaming message
	let selectedModel = 'gpt-4o'; // Default model

	const models = [
		{ value: 'gpt-4o', label: 'GPT-4O' },
		{ value: 'gpt-4o-mini', label: 'GPT-4O Mini' }
	];

	onMount(() => {
		scrollToBottom();
	});

	afterUpdate(() => {
		scrollToBottom();
	});

	function scrollToBottom() {
		if (chatContainer) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	}

	async function sendMessage() {
		if (newMessage.trim()) {
			const userMessage = { role: 'user', content: newMessage };
			messages = [...messages, userMessage];
			newMessage = '';
			isLoading = true;
			currentStreamingMessage = ''; // Reset the streaming message

			try {
				const response = await fetch('/api/chat', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ messages: messages, model: selectedModel }) // Include selected model
				});

				if (!response.ok) {
					throw new Error('Failed to get response from RUTBOT');
				}

				const reader = response.body.getReader();
				const decoder = new TextDecoder();

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value);
					currentStreamingMessage += chunk;
					await tick(); // Wait for the UI to update
					scrollToBottom();
				}

				const botMessage = { role: 'assistant', content: currentStreamingMessage };
				messages = [...messages, botMessage];
			} catch (error) {
				console.error('Error:', error);
				messages = [
					...messages,
					{ role: 'assistant', content: "Sorry, I'm having trouble responding right now." }
				];
			} finally {
				isLoading = false;
				currentStreamingMessage = ''; // Reset the streaming message
				await tick(); // Wait for the UI to update
				inputField.focus(); // Focus on the input field
				scrollToBottom();
			}
		}
	}

	function clearChat() {
		messages = [];
		currentStreamingMessage = '';
	}
</script>

<div class="container mx-auto p-4 max-w-3xl">
	<div class="flex justify-between items-center mb-4">
		<h1 class="text-3xl font-bold">RUT AI Chat App</h1>
		<div class="flex items-center gap-2">
			<select bind:value={selectedModel} class="select select-bordered select-sm">
				{#each models as model}
					<option value={model.value}>{model.label}</option>
				{/each}
			</select>
			<button on:click={clearChat} class="btn btn-sm btn-outline">Clear Chat</button>
		</div>
	</div>

	<div class="bg-base-200 rounded-lg shadow-xl p-4 h-[60vh] flex flex-col">
		<svelte:element this="div" bind:this={chatContainer} class="flex-1 overflow-y-auto mb-4">
			{#each messages as message}
				<div class="chat {message.role === 'user' ? 'chat-end' : 'chat-start'}">
					<div class="chat-header">
						{message.role === 'user' ? 'You' : 'RUTBOT'}
					</div>
					<div
						class="chat-bubble {message.role === 'user'
							? 'chat-bubble-primary'
							: 'chat-bubble-secondary'}"
					>
						{message.content}
					</div>
				</div>
			{/each}
			{#if currentStreamingMessage}
				<div class="chat chat-start">
					<div class="chat-header">RUTBOT</div>
					<div class="chat-bubble chat-bubble-secondary">
						{currentStreamingMessage}
					</div>
				</div>
			{:else if isLoading}
				<div class="chat chat-start">
					<div class="chat-header">RUTBOT</div>
					<div class="chat-bubble chat-bubble-secondary">Thinking...</div>
				</div>
			{/if}
		</svelte:element>

		<form on:submit|preventDefault={sendMessage} class="flex gap-2">
			<input
				type="text"
				bind:value={newMessage}
				bind:this={inputField}
				placeholder="Ask RUTBOT something..."
				class="input input-bordered flex-1"
				disabled={isLoading}
			/>
			<button type="submit" class="btn btn-primary" disabled={isLoading}>Send</button>
		</form>
	</div>
</div>
