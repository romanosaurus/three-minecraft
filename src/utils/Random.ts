import * as THREE from 'three';

export default class Random {

    private max : number;
    private primRoot : number;
    private div : number;
    private mod : number;
    private seed : number;

    constructor() {
        this.max = 2147483647; //2^31 - 1
        this.primRoot = 16807; //7^5; primitive root of m
        this.div = 127773; // m / a
        this.mod = 2836; // m % a
        this.seed = 1;
    }
    public setSeed(seed) {
        if (seed <= 0)
            seed = -(seed % (this.max - 1)) + 1;
        if (seed > this.max - 1)
            seed = this.max - 1;
        this.seed = seed;
    }
    private nextLong() {
        let res = this.primRoot * (this.seed % this.div) - this.mod * Math.floor(this.seed / this.div);

        if (res <= 0)
            res += this.max;
        this.seed = res;
        return res;
    }
    public next() {
        let res = this.nextLong();
        return res / this.max;
    }
};