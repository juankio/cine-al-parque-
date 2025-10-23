// app.config.ts
export default defineAppConfig({
    ui: {
        primary: 'red',             // color principal pa’ botones, etc.
        gray: 'cool',
        strategy: 'override',       // forzar que mande el tema
        variables: {
            light: {
                background: '#ffffff',
                foreground: '#111827',  // tailwind gray-900
                primary: '#ef4444',     // red-500
            },
            dark: {
                background: '#111827',  // gris oscuro (tu theme_color)
                foreground: '#e5e7eb',  // gray-200
                primary: '#ef4444'
            }
        }
    }
})
