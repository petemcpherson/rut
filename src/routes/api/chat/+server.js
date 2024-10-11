import { OPENAI_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const { messages, model } = await request.json();

	// Add console.log to show the selected model
	console.log('Selected model:', model);

	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${OPENAI_API_KEY}`
		},
		body: JSON.stringify({
			model: model, // Use the selected model
			messages,
			stream: true
		})
	});

	if (!response.ok) {
		throw new Error('Failed to fetch response from OpenAI');
	}

	// Set up Server-Sent Events
	const stream = new ReadableStream({
		async start(controller) {
			const reader = response.body.getReader();
			const decoder = new TextDecoder();

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split('\n');

				for (const line of lines) {
					if (line.startsWith('data: ') && line !== 'data: [DONE]') {
						const jsonData = JSON.parse(line.slice(6));
						const content = jsonData.choices[0].delta.content;
						if (content) {
							controller.enqueue(content);
						}
					}
				}
			}

			controller.close();
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
}
