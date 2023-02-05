// Run migrations first.
await import("./migrator/main.ts");

// Run API and worker in parallel.
const api = import("./api/main.ts");
const worker = import("./worker/main.ts");
await Promise.all([api, worker]);
