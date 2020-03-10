export enum SystemState {
    STARTED,
    STOPPED
}

export interface RegisteredEvent {
    name: string,
    callback: (event: Event) => void
};

export interface ISystem {
    onInit() : void;
    onUpdate(elapsedTime : number) : void;
    onClose() : void;
    getName() : string;
    getState() : SystemState;
    setState(newState : SystemState) : void;
    registerEvent(eventName: string, callback: (event: Event) => void);
    getRegisteredEvents(): RegisteredEvent[];
}
