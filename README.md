# `@nonnajs/sample-bun-http`

Sample Bun HTTP server application demonstrating `@nonnajs/di` with Bun's native HTTP server (`Bun.serve`) and Web Standards Fetch API (`Request` / `Response`).

## Dependency Injection At A Glance

`ItemController` (`src/item.controller.ts`) is `scope: "request"`, injecting the shared
`ItemRepository`/`LoggerService` singletons, the per-request `BunHttpRequestContext`, and a
registered config value:

```ts
@Injectable({scope: "request"})
export class ItemController {
    constructor(
        @Inject(ItemRepository) private readonly itemRepo: ItemRepository,
        @Inject(LoggerService) private readonly logger: LoggerService,
        @Inject(BunHttpRequestContext) private readonly ctx: BunHttpRequestContext,
        @Inject(BUN_HTTP_CONFIG) private readonly config: BunHttpConfig,
    ) {}

    listItems() {
        this.logger.log(`[${this.ctx.requestId}] Listing items on ${this.config.appName}`);
        return {data: this.itemRepo.findAll(), requestId: this.ctx.requestId};
    }
}
```

`src/server.ts`'s `fetch` handler wraps every incoming `Request` in its own scope before resolving
the router (which itself constructor-injects `ItemController`):

```ts
const fetchHandler = async (req: Request): Promise<Response> => {
    return injector.runInScope(async () => {
        const ctx = injector.get(BunHttpRequestContext);
        ctx.method = req.method;
        ctx.url = req.url;
        const router = injector.get(HttpRouter);
        return router.handle(req);
    });
};
```

## Features Demonstrated

-   **Native Bun HTTP Server**: Web Standards `Request` and `Response` with zero external HTTP dependencies.
-   **Request-Scoped Isolation**: Wrapping each incoming HTTP request in `injector.runInScope()`, giving each request an isolated `BunHttpRequestContext`, `ItemController`, and `HttpRouter`.
-   **Singletons & Lifecycle**: `ItemRepository` and `LoggerService` shared across requests with `OnDestroy` lifecycle cleanup.
-   **Header Propagation**: Transparent `X-Request-Id` correlation across requests.

## Running the Sample

```sh
# Run server with Bun
bun run src/index.ts

# Run tests with Bun
bun test test/

# Or run via pnpm in the monorepo
pnpm test
pnpm build
```
