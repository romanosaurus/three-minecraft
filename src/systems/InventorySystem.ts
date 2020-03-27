import ASystem from "../ecs/abstract/ASystem";

interface Slot {
    wrapper: Element;
    itemWrapper: Element;
    item: Element;
    count: Element;
};

class InventorySystem extends ASystem {
    private slots: Slot[] = [];

    private initInventoryWrapper() {
        const inventoryWrapper = document.createElement('div');

        inventoryWrapper.id = 'inventory';
        inventoryWrapper.style.backgroundColor = 'black';
        inventoryWrapper.style.width = '100px';
        inventoryWrapper.style.height = '100px';
        inventoryWrapper.style.top = '50%';
        inventoryWrapper.style.left = '50%';
        inventoryWrapper.style.transform = 'translate(-50%, -50%)';
        inventoryWrapper.style.position = 'fixed';
        inventoryWrapper.style.display = 'none';

        document.body.append(inventoryWrapper);
    }

    onInit() {
        this.registerEvent("keyDown", (event: any) => {
            if (event.key === "e") {
                const inventoryWrapper = document.getElementById('inventory');
                if (inventoryWrapper.style.display)
                    inventoryWrapper.style.display = '';
                else
                    inventoryWrapper.style.display = 'none';
            }

            this.initInventoryWrapper();
        });

    }

    onUpdate() {

    }

    onClose() {

    }
}

export default InventorySystem;