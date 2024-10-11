/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	daisyui: {
		themes: ['light', 'dark', 'cupcake']
	},
	plugins: [require('daisyui')]
};
