/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				pixelify:['Pixelify Sans', 'sans-serif']

			}
		}
	},
	purge: ['./index.html', './src/**/*.{svelte,js,ts}'], // for unused CSS
	plugins: [],
	darkMode: 'class' // or 'media' or 'class'
}

