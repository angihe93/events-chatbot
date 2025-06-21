import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// For more information on configuring Vitest, please refer to the Vitest Configuration docs  https://vitest.dev/config/#configuration
export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
        environment: 'jsdom',
    },
})