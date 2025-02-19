/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/**/*.{html,ts}",
	],
	theme: {
		screens: {
			'sm': '576px',
			'md': '768px',
			'lg': '992px',
			'xl': '1200px',
			'2xl': '1200px',
		},
		extend: {
			spacing: {
				'toolbar-subtracted': 'calc(100% - 60px)',
			},
			textColor:
			{
				muted:'#a1a1aa'
			},
			backgroundColor:{
				'dark':'#1f1f1f'
			},
			fontFamily:{
				'inter':'Inter, sans-serif',
				'poppins':'Poppins, sans-serif'
			},
			container: {
				center: true,
				padding: '1rem',
				screens: {
					'sm': '540px',
					'md': '720px',
					'lg': '960px',
					'xl': '1140px',
					'2xl': '1320px',
				}
			}
		},
	},
	plugins: [],
}