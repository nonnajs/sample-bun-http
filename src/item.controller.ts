import {Inject, Injectable} from "@nonnajs/di";
import {BUN_HTTP_CONFIG, type BunHttpConfig} from "./config";
import {Item, ItemRepository} from "./item.repository";
import {LoggerService} from "./logger.service";
import {BunHttpRequestContext} from "./request-context";

@Injectable({scope: "request"})
export class ItemController {
    constructor(
        @Inject(ItemRepository) private readonly itemRepo: ItemRepository,
        @Inject(LoggerService) private readonly logger: LoggerService,
        @Inject(BunHttpRequestContext) private readonly ctx: BunHttpRequestContext,
        @Inject(BUN_HTTP_CONFIG) private readonly config: BunHttpConfig,
    ) {}

    listItems(): {data: Item[]; requestId: string} {
        this.logger.log(`[${this.ctx.requestId}] Listing items on ${this.config.appName}`);
        return {
            data: this.itemRepo.findAll(),
            requestId: this.ctx.requestId,
        };
    }

    getItem(id: string): {data: Item; requestId: string} | null {
        this.logger.log(`[${this.ctx.requestId}] Fetching item id=${id}`);
        const item = this.itemRepo.findById(id);
        if (!item) return null;
        return {
            data: item,
            requestId: this.ctx.requestId,
        };
    }

    createItem(name: string, price: number): {data: Item; requestId: string} {
        const id = String(this.itemRepo.findAll().length + 1);
        const item = this.itemRepo.save({id, name, price});
        this.logger.log(`[${this.ctx.requestId}] Created item id=${id} (${name})`);
        return {
            data: item,
            requestId: this.ctx.requestId,
        };
    }
}
