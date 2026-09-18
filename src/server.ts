import {Injector} from "@nonnajs/di";
import {BUN_HTTP_CONFIG, BunHttpConfig} from "./config";
import {HttpRouter} from "./http-router";
import {BunHttpRequestContext} from "./request-context";

export interface BunHttpApp {
    injector: Injector;
    fetch: (req: Request) => Promise<Response>;
}

export async function createBunHttpApp(config: BunHttpConfig): Promise<BunHttpApp> {
    const injector = Injector.create();

    // Register config value
    injector.registerValue(BUN_HTTP_CONFIG, config);

    // Refresh decorated singletons & request-scoped services
    injector.refresh();

    // Initialize graph
    await injector.initialize();

    const fetchHandler = async (req: Request): Promise<Response> => {
        return injector.runInScope(async () => {
            const ctx = injector.get(BunHttpRequestContext);
            ctx.method = req.method;
            ctx.url = req.url;

            const router = injector.get(HttpRouter);
            return router.handle(req);
        });
    };

    return {
        injector,
        fetch: fetchHandler,
    };
}
