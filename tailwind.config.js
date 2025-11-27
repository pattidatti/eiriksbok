/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            colors: {
                'bg-dark': 'var(--bg-dark)',
                'text-main': 'var(--text-main)',
                'text-muted': 'var(--text-muted)',
                'neon-accent': 'var(--neon-accent)',
            },
        },
    },
    plugins: [],
}
