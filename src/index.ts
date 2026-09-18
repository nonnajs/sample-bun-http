import {createBunHttpApp} from "./server";

async function main() {
    const port = Number(process.env["PORT"] ?? 3000);
    const app = await createBunHttpApp({
        appName: "Nonna-BunHttp-Sample",
        port,
        environment: process.env["NODE_ENV"] ?? "development",
    });

    if (typeof (globalThis as any).Bun !== "undefined") {
        (globalThis as any).Bun.serve({
            port,
            fetch: app.fetch,
        });
        console.info(`Bun HTTP server running on http://localhost:${port}`);
    } else {
        console.info(`App initialized. Use app.fetch(request) to handle requests.`);
    }
}

if (typeof require !== "undefined" && require.main === module) {
    main().catch(console.error);
}
