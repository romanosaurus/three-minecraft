interface ItemTuple {
    information: Item,
    name: string,
    texture: string
};

const ItemList: ItemTuple[] = [
    {
        information: { id: 1, attribute: 0 },
        name: "Stone",
        texture: "../../assets/items/stone.png"
    }
];

export default ItemList;