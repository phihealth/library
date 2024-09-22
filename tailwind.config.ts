// Dependencies - Project
import ProjectSettings from './ProjectSettings'; // Use relative path here for tailwind.config.js

// Dependencies
import type { Config as TailwindConfiguration } from 'tailwindcss';
import { default as tailwindPlugin } from 'tailwindcss/plugin';
import TailwindCSSAnimate from 'tailwindcss-animate';
import { fontFamily as tailwindDefaultFontFamily } from 'tailwindcss/defaultTheme';

// Tailwind CSS configuration object
export const tailwindConfiguration = {
    darkMode: ['variant', ['&:not(.light *, .light):where(.dark *)']], // Dark mode will be applied based on the presence of the 'dark' class on the HTML element or its ancestors, but will exclude elements with the 'light' class or its ancestors
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './libraries/**/*.{js,ts,jsx,tsx,mdx}',
        './source/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: '1.5rem',
            },
            screens: {
                DEFAULT: '100%',
                sm: '100%',
                lg: '980px',
                xl: '980px',
                '2xl': '980px',
            },
        },
        extend: {
            colors: {
                white: '#FFFFFF',
                light: '#FFFFFF',
                'light-1': '#F6F6F6',
                'light-2': '#EEEEEE',
                'light-3': '#E5E5E5',
                'light-4': '#DDDDDD',
                'light-5': '#D4D4D4',
                'light-6': '#CCCCCC',

                black: '#000000',
                'dark+6': '#000000',
                'dark+5': '#090909',
                'dark+4': '#0B0B0B',
                'dark+3': '#0D0D0D',
                'dark+2': '#0F0F0F',
                'dark+1': '#101010',
                dark: '#111111',
                'dark-1': '#191919',
                'dark-2': '#222222',
                'dark-3': '#2A2A2A',
                'dark-4': '#333333',
                'dark-5': '#3B3B3B',
                'dark-6': '#444444',

                'neutral-6': '#4C4C4C',
                'neutral-5': '#565656',
                'neutral-4': '#606060',
                'neutral-3': '#6A6A6A',
                'neutral-2': '#747474',
                'neutral-1': '#7E7E7E',
                neutral: '#888888',
                'neutral+1': '#929292',
                'neutral+2': '#9C9C9C',
                'neutral+3': '#A6A6A6',
                'neutral+4': '#B0B0B0',
                'neutral+5': '#BABAAB',
                'neutral+6': '#C4C4C4',

                blue: '#0e73cc',

                theme: {
                    light: {
                        primary: {
                            DEFAULT: '#007AFF',
                            hover: '#0066d5',
                            active: '#3294ff',
                            disabled: '#888888',
                        },
                    },
                    dark: {
                        primary: {
                            DEFAULT: '#007AFF',
                            hover: '#3294ff',
                            active: '#0066d5',
                            disabled: '#747474',
                        },
                    },
                },

                // @shadcn/ui colors
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
            },
            fontSize: {
                base: ['16px', '24px'],
                ss: '13px', // Semi-small
            },
            spacing: {
                // Phi spacing -- Golden ratio spacing up each step starting with 1.618rem (var(--phi))
                phi: 'var(--phi)',

                // Phi multiples
                'phi-base-0.5': 'calc(var(--phi) * 0.5)',
                'phi-base-0.75': 'calc(var(--phi) * 0.75)',
                'phi-base-1.5': 'calc(var(--phi) * 1.5)',
                'phi-base-2': 'calc(var(--phi) * 2)',
                'phi-base-2.5': 'calc(var(--phi) * 2.5)',
                'phi-base-3': 'calc(var(--phi) * 3)',
                'phi-base-3.5': 'calc(var(--phi) * 3.5)',
                'phi-base-4': 'calc(var(--phi) * 4)',
                'phi-base-4.5': 'calc(var(--phi) * 4.5)',
                'phi-base-5': 'calc(var(--phi) * 5)',
                'phi-base-5.5': 'calc(var(--phi) * 5.5)',
                'phi-base-6': 'calc(var(--phi) * 6)',
                'phi-base-6.5': 'calc(var(--phi) * 6.5)',
                'phi-base-7': 'calc(var(--phi) * 7)',
                'phi-base-7.5': 'calc(var(--phi) * 7.5)',
                'phi-base-8': 'calc(var(--phi) * 8)',
                'phi-base-8.5': 'calc(var(--phi) * 8.5)',
                'phi-base-9': 'calc(var(--phi) * 9)',
                'phi-base-9.5': 'calc(var(--phi) * 9.5)',
                'phi-base-10': 'calc(var(--phi) * 10)',

                // Phi steps
                'phi-2': 'calc(var(--phi) * 1.618)',
                'phi-3': 'calc(var(--phi) * pow(1.618, 2))',
                'phi-4': 'calc(var(--phi) * pow(1.618, 3))',
                'phi-5': 'calc(var(--phi) * pow(1.618, 4))',
                'phi-6': 'calc(var(--phi) * pow(1.618, 5))',
                'phi-7': 'calc(var(--phi) * pow(1.618, 6))',
                'phi-8': 'calc(var(--phi) * pow(1.618, 7))',
                'phi-9': 'calc(var(--phi) * pow(1.618, 8))',
                'phi-10': 'calc(var(--phi) * pow(1.618, 9))',
            },
            backgroundImage: {
                logoLight: 'url(' + ProjectSettings.assets.logo.light.location + ')',
                logoDark: 'url(' + ProjectSettings.assets.logo.dark.location + ')',
            },
            blur: {
                'gradient-bg': '150px',
            },
            borderRadius: {
                lg: `var(--radius)`,
                md: `calc(var(--radius) - 2px)`,
                sm: 'calc(var(--radius) - 4px)',
            },
            fontFamily: {
                sans: ['system-ui', 'Arial', 'sans-serif', ...tailwindDefaultFontFamily.sans],
            },
            fontWeight: {
                base: '400',
                semibold: '500',
                bold: '600',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                // Do a blink of opacity to indicate an update
                blinkOnce: {
                    '0%': { opacity: '1' },
                    '50%': { opacity: '0.25' },
                    '100%': { opacity: '1' },
                },
                // Blink animation
                blink: {
                    '0%': {
                        opacity: '1',
                    },
                    '20%,50%': {
                        opacity: '0',
                    },
                    '70%,100%': {
                        opacity: '1',
                    },
                },
                // Shimmer
                shimmer: {
                    '0%': { transform: 'translateX(-50%)' },
                    '100%': { transform: 'translateX(75%)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                blinkOnce: 'blinkOnce 500ms linear',
                blink: 'blink 1.3s ease-in-out infinite',
                shimmer: 'shimmer 5s infinite',
            },
        },
    },
    plugins: [
        tailwindPlugin(function ({ addBase, theme }) {
            addBase({
                h1: {
                    fontSize: '2em',
                    fontWeight: theme('fontWeight.base'),
                    lineHeight: '1',
                },
                h2: {
                    fontSize: '1.75em',
                    fontWeight: theme('fontWeight.base'),
                    lineHeight: '1',
                },
                h3: {
                    fontSize: '1.35em',
                    fontWeight: theme('fontWeight.base'),
                    lineHeight: '1.25',
                },
                h4: {
                    fontSize: '1.2em',
                    fontWeight: theme('fontWeight.base'),
                    lineHeight: '1.25',
                },
                h5: {
                    fontSize: '1.1em',
                    fontWeight: theme('fontWeight.base'),
                    lineHeight: '1.25',
                },
                h6: {
                    fontSize: '1em',
                    fontWeight: theme('fontWeight.base'),
                    lineHeight: '1.25',
                },
            });
        }),
        TailwindCSSAnimate,
    ],
} satisfies TailwindConfiguration;

export default tailwindConfiguration;
