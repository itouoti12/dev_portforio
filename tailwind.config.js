/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	purge: ['./index.html', './src/**/*.{svelte,js,ts}'], // for unused CSS
	plugins: [],
	darkMode: 'class' // or 'media' or 'class'
}

