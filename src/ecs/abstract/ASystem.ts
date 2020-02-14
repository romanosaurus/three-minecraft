import { ISystem, SystemState, RegisteredEvent } from "../interfaces/ISystem";

const events = require('events');

export default class ASystem implements ISystem {
    private readonly name : string;
    private state : SystemState;
    private emitter: NodeJS.EventEmitter;
    private _registeredEvents: RegisteredEvent[];

    constructor(name : string) {
        this.name = name;
        this.state = SystemState.STOPPED;
        this.emitter = new events();
        this._registeredEvents = [];
    }

    public onInit(): void {}

    public onUpdate(elapsedTime: number): void {}

    public onClose(): void {}

    public getName(): string {
        return this.name;
    }

    public getState(): SystemState {
        return this.state;
    }

    public setState(newState: SystemState): void {
        this.state = newState;
    }

    public registerEvent(eventName: string, callback: (event: Event) => void) {
        const eventTuple: RegisteredEvent = { name: eventName, callback: callback };

        this._registeredEvents.push(eventTuple);
        this.emitter.on(eventName, callback);
    }

    public getRegisteredEvents(): RegisteredEvent[] {
        return this._registeredEvents;
    }
}
