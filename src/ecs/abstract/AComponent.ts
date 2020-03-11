import IComponent from "../interfaces/IComponent";
import IEntity from "../interfaces/IEntity";

export default class AComponent implements IComponent {
    private readonly entity : IEntity;
    private enabled: boolean;

    constructor(entity : IEntity) {
        this.entity = entity;
        this.enabled = true;
    }

    getEntity(): IEntity {
        return this.entity;
    }

    enable(): void {
        this.enabled = true;
    }

    disable(): void {
        this.enabled = false;
    }

    isEnable(): boolean {
        return this.enabled;
    }
}
