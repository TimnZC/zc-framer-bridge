import { defineConfig } from 'tsup';

export default defineConfig([
  // Standard build — for npm consumers (Next.js, etc.)
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', 'keycloak-js'],
    treeshake: true,
    target: 'es2020',
  },
  // CDN build — for Framer (keycloak-js resolved via esm.sh URL)
  {
    entry: { 'cdn/index': 'src/index.ts' },
    format: ['esm'],
    dts: false,
    sourcemap: false,
    clean: false, // don't wipe the standard build output
    external: ['react', 'react-dom'],
    treeshake: true,
    target: 'es2020',
    esbuildOptions(options) {
      // Rewrite bare 'keycloak-js' import to the esm.sh CDN URL
      options.alias = {
        'keycloak-js': 'https://esm.sh/keycloak-js@26',
      };
    },
  },
]);
