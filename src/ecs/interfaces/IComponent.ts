import IEntity from "./IEntity";

export default interface IComponent {
    getEntity?() : IEntity;
    enable?(): void;
    disable?(): void;
    isEnable?(): boolean;
};

