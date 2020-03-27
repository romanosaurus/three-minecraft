import AComponent from "../ecs/abstract/AComponent";

class Inventory extends AComponent {
    private _items: Item[][];

    get items(): Item[][] {
        return this._items;
    }

    public getItemsAtPos(pos: number): Item[] {
        return this._items[pos];
    }

    public setItem(newItem: Item): void {
        for (let i = 0; i < this._items.length; i++) {
            if (this._items[i][0] && this._items[i][0] === newItem && this._items[i].length < 64) {
                this._items[i].push(newItem);
                return;
            }
        }

        if (this._items.length < 36)
            this._items.push([]);
            this._items[this._items.length - 1].push(newItem);
    }
}

export default Inventory;