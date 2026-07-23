// Vitest stub for the `server-only` package. The real package throws unless the bundler sets the
// `react-server` export condition (which Next does, but vitest does not), so we alias it to this
// no-op in tests. This does NOT weaken production: `import "server-only"` still guards the real
// client/server boundary at Next build time — see vitest.config.ts resolve.alias.
export {};
