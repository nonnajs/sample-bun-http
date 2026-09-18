import assert from "node:assert/strict";
import {describe, it} from "node:test";

import {LoggerService} from "../src/logger.service";
import {createBunHttpApp} from "../src/server";

describe("Sample Bun HTTP App - @nonnajs/di", () => {
    it("handles GET /health and returns custom appName and unique request ID in header and body", async () => {
        const {injector, fetch} = await createBunHttpApp({
            appName: "TestBunHttpApp",
            port: 3000,
            environment: "test",
        });

        const req = new Request("http://localhost:3000/health");
        const res = await fetch(req);

        assert.equal(res.status, 200);
        const body = (await res.json()) as {status: string; app: string; requestId: string};
        assert.equal(body.status, "ok");
        assert.equal(body.app, "TestBunHttpApp");
        assert.ok(res.headers.get("x-request-id"));
        assert.equal(body.requestId, res.headers.get("x-request-id"));

        await injector.destroy();
    });

    it("handles GET /items, POST /items, and GET /items/:id via request-scoped controller", async () => {
        const {injector, fetch} = await createBunHttpApp({
            appName: "TestBunHttpApp",
            port: 3000,
            environment: "test",
        });

        // Initial items
        const listRes = await fetch(new Request("http://localhost:3000/items"));
        assert.equal(listRes.status, 200);
        const listBody = (await listRes.json()) as {data: Array<{id: string; name: string; price: number}>};
        assert.equal(listBody.data.length, 2);

        // Create item
        const createRes = await fetch(
            new Request("http://localhost:3000/items", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({name: "Monitor", price: 299.99}),
            }),
        );
        assert.equal(createRes.status, 201);
        const createdBody = (await createRes.json()) as {data: {id: string; name: string; price: number}};
        assert.equal(createdBody.data.name, "Monitor");
        const newId = createdBody.data.id;

        // Fetch by id
        const getRes = await fetch(new Request(`http://localhost:3000/items/${newId}`));
        assert.equal(getRes.status, 200);
        const getBody = (await getRes.json()) as {data: {id: string; name: string; price: number}};
        assert.equal(getBody.data.name, "Monitor");

        // 404
        const notFoundRes = await fetch(new Request("http://localhost:3000/items/999"));
        assert.equal(notFoundRes.status, 404);

        await injector.destroy();
    });

    it("isolates request-scoped context across concurrent requests", async () => {
        const {injector, fetch} = await createBunHttpApp({
            appName: "TestBunHttpApp",
            port: 3000,
            environment: "test",
        });

        const [res1, res2] = await Promise.all([
            fetch(new Request("http://localhost:3000/health")),
            fetch(new Request("http://localhost:3000/health")),
        ]);

        const id1 = res1.headers.get("x-request-id");
        const id2 = res2.headers.get("x-request-id");
        assert.ok(id1 && id2);
        assert.notEqual(id1, id2, "Request IDs must be unique across concurrent requests");

        await injector.destroy();
    });

    it("invokes onDestroy on singleton LoggerService when injector is destroyed", async () => {
        const {injector, fetch} = await createBunHttpApp({
            appName: "TestBunHttpApp",
            port: 3000,
            environment: "test",
        });

        await fetch(new Request("http://localhost:3000/health"));
        const logger = injector.get(LoggerService);
        assert.equal(logger.isDestroyed, false);

        await injector.destroy();
        assert.equal(logger.isDestroyed, true);
        assert.ok(logger.logs.some((l: string) => l.includes("LoggerService destroyed")));
    });
});
