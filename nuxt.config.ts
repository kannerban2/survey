// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },

    modules: [
        '@nuxt/eslint',
        '@nuxt/image',
        '@nuxt/scripts',
        '@nuxt/ui',
        '@prisma/nuxt',
        'nuxt-charts'

    ],
    runtimeConfig: {
        jwtSecret: process.env.JWT_SECRET, // server only
    },
    app: {
        head: {
            link: [
                // Core Boxicons (for regular/solid icons)
                { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/boxicons@2.1.4/css/boxicons.min.css' },
                // Brands (as provided)
                { rel: 'stylesheet', href: 'https://cdn.boxicons.com/fonts/brands/boxicons-brands.min.css' }
            ],
            script: [
                {
                    src: 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.5.0/chart.umd.min.js',
                    crossorigin: 'anonymous',
                    referrerpolicy: 'no-referrer',
                    defer: true
                }
            ]
        }
    }
})