import * as THREE from 'three';

/**
 * @class Random used in the perlin noise
 * Needed to have a logical following in randomness
 */
export default class Random {

    /**
     * Private members
     */
    private max : number;
    private primRoot : number;
    private div : number;
    private mod : number;
    private seed : number;

    /**
     * Constuctor
     * @param None
     */
    constructor() {
        this.max = 2147483647; //2^31 - 1
        this.primRoot = 16807; //7^5; primitive root of m
        this.div = 127773; // m / a
        this.mod = 2836; // m % a
        this.seed = 1;
    }
    /**
     * Public member function to set the private seed to the sended value
     * @param seed : the seed to set
     */
    public setSeed(seed) {
        if (seed <= 0)
            seed = -(seed % (this.max - 1)) + 1;
        if (seed > this.max - 1)
            seed = this.max - 1;
        this.seed = seed;
    }
    /**
     * Private member method to have a logical following in randomness
     */
    private nextLong() {
        let res = this.primRoot * (this.seed % this.div) - this.mod * Math.floor(this.seed / this.div);

        if (res <= 0)
            res += this.max;
        this.seed = res;
        return res;
    }
    /**
     * Public member method to get a logical randomness number
     */
    public next() {
        let res = this.nextLong();
        return res / this.max;
    }
};