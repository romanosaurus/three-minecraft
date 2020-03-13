export default class Euler {
    public x: number;
    public y: number;
    public z: number;
    public order: string;
    readonly isEuler: boolean;

    constructor(x: number = 0, y: number = 0, z: number = 0, order: string = 'XYZ') {
        this.x = x;
        this.y = y;
        this.z = z;
        this.order = order;
        this.isEuler = true;
    }
}