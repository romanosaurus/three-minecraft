export default class Vector2D {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    static ZERO = new Vector2D;

    public set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}