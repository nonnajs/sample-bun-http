import {Inject, Injectable} from "@nonnajs/di";
import {BUN_HTTP_CONFIG, type BunHttpConfig} from "./config";
import {ItemController} from "./item.controller";
import {BunHttpRequestContext} from "./request-context";

@Injectable({scope: "request"})
export class HttpRouter {
    constructor(
        @Inject(ItemController) private readonly controller: ItemController,
        @Inject(BunHttpRequestContext) private readonly ctx: BunHttpRequestContext,
        @Inject(BUN_HTTP_CONFIG) private readonly config: BunHttpConfig,
    ) {}

    async handle(req: Request): Promise<Response> {
        const url = new URL(req.url);
        const method = req.method;
        const pathname = url.pathname;

        const headers = new Headers({
            "Content-Type": "application/json",
            "X-Request-Id": this.ctx.requestId,
        });

        if (method === "GET" && pathname === "/health") {
            return new Response(
                JSON.stringify({status: "ok", app: this.config.appName, requestId: this.ctx.requestId}),
                {status: 200, headers},
            );
        }

        if (method === "GET" && pathname === "/items") {
            const result = this.controller.listItems();
            return new Response(JSON.stringify(result), {status: 200, headers});
        }

        if (method === "GET" && pathname.startsWith("/items/")) {
            const id = pathname.substring("/items/".length);
            const result = this.controller.getItem(id);
            if (!result) {
                return new Response(JSON.stringify({error: "Item not found", requestId: this.ctx.requestId}), {
                    status: 404,
                    headers,
                });
            }
            return new Response(JSON.stringify(result), {status: 200, headers});
        }

        if (method === "POST" && pathname === "/items") {
            const body = (await req.json()) as {name: string; price: number};
            const result = this.controller.createItem(body.name, body.price);
            return new Response(JSON.stringify(result), {status: 201, headers});
        }

        return new Response(JSON.stringify({error: "Not Found", requestId: this.ctx.requestId}), {
            status: 404,
            headers,
        });
    }
}
