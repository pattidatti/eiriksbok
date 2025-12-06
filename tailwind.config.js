/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Disable automatic dark mode based on system preference
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            colors: {
                'bg-dark': 'var(--bg-main)', // Kept for compatibility, mapped to light main
                'bg-main': 'var(--bg-main)',
                'bg-card': 'var(--bg-card)',
                'text-main': 'var(--text-main)',
                'text-muted': 'var(--text-muted)',
                'neon-accent': 'var(--neon-accent)',
            },
        },
    },
    plugins: [],
}
