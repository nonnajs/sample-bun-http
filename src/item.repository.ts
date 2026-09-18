import {Injectable} from "@nonnajs/di";

export interface Item {
    id: string;
    name: string;
    price: number;
}

@Injectable()
export class ItemRepository {
    private readonly items = new Map<string, Item>([
        ["1", {id: "1", name: "Keyboard", price: 99.99}],
        ["2", {id: "2", name: "Mouse", price: 49.99}],
    ]);

    findAll(): Item[] {
        return [...this.items.values()];
    }

    findById(id: string): Item | undefined {
        return this.items.get(id);
    }

    save(item: Item): Item {
        this.items.set(item.id, item);
        return item;
    }
}
