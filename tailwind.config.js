/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}', './formkit.config.js'],
    theme: {
        extend: {
            colors: {
                unachBlue: '#00294F',
                unachGold: '#D4B012',
                backgroud: '#DDDDDD'
            }
        }
    },
    plugins: []
};
