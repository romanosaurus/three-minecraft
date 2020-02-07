import * as THREE from 'three';
import Random from "../utils/Random";

export default class PerlinGenerator {

    private width : number;
    private height : number;
    private data;
    private spec;

    static fromData(json) {
        return new this(json.width, json.height, json.spec.randseed);
    }
    constructor(width : number, height : number, randseed : number) {
        this.width = width;
        this.height = height;
        this.data = new Array(width * height * 4);
        this.spec = {};
        this.spec.randseed = randseed;
        this.spec.period = 32;
        this.spec.levels = 2;
        this.spec.atten = 0.1;
        this.spec.absolute = false;
        this.spec.color = false;
        this.spec.alpha = false;
        this.createTurbulence(0, 0);
    }
    public createMesh(meshSize : number, offsetMeshWidth : number, offsetMeshHeight : number) {
        this.createTurbulence(offsetMeshWidth * meshSize, offsetMeshHeight * meshSize);
        return this.data;
    }
    public getWidth() {
        return this.width;
    }
    public getHeight() {
        return this.height;
    }
    public getData() {
        return this.data;
    }
    private setRgba(x, y, r, g, b, a) {
        let offset = ((y * this.width) + x) * 4;

        this.data[offset] = r;
        this.data[offset + 1] = g;
        this.data[offset + 2] = b;
        this.data[offset + 3] = a;
    }
    public createTurbulence(startingWidth : number, startingHeight : number) {
        let numChannels = this.spec.color ? 3 : 1 + this.spec.alpha ? 1 : 0;
        let raster = new Array(this.width * this.height * numChannels);

        for (let i = 0; i < raster.length; ++i)
            raster[i] = 0;
        for (let k = 0; k < numChannels; ++k) {
            let localPeriodInv = 1 / this.spec.period;
            let freqInv = 1;
            let atten = 1;
            let weight = 0;
            for (let lvlIdx = 0; lvlIdx < this.spec.levels; ++lvlIdx) {
                let sampler = new PerlinSampler2D(Math.ceil((this.width) * localPeriodInv), Math.ceil((this.height) * localPeriodInv), this.spec.randseed + k + lvlIdx);

                for (let j = 0; j < this.height; ++j) {
                    for (let i = 0; i < this.width; ++i) {
                        let val = sampler.getValue((i) * localPeriodInv, (j) * localPeriodInv);
                        raster[(i + j * this.width) * numChannels + k] += val * Math.pow(freqInv, this.spec.atten);
                    }
                }
                weight += Math.pow(freqInv, this.spec.atten);
                freqInv *= .5;
                localPeriodInv *= 2;
                atten *= this.spec.atten;
            }
			let weightInv = 1 / weight;
			for (let j = 0; j < this.height; ++j)
				for (let i = 0; i < this.width; ++i)
					raster[(i + j * this.width) * numChannels + k] *= weightInv;
        }


        for (let j = 0; j < this.height; ++j) {
            for (let i = 0; i < this.width; ++i) {
                let offset = (i + j * this.width) * numChannels;
                let r, g, b, a;

                if (this.spec.color) {
                    r = raster[offset];
                    g = raster[offset + 1];
                    b = raster[offset + 2];
                    a = this.spec.alpha ? raster[offset + 3] : 1;
                } else {
                    r = g = b = raster[offset];
                    a = this.spec.alpha ? raster[offset + 1] : 1;
                }
                if (this.spec.absolute) {
                    r = Math.abs(r) * 255;
                    g = Math.abs(g) * 255;
                    b = Math.abs(b) * 255;
                    a = Math.abs(a) * 255;
                } else {
                    r = ((r + 1) / 2) * 255;
                    g = ((g + 1) / 2) * 255;
                    b = ((b + 1) / 2) * 255;
                    a = ((a + 1) / 2) * 255;
                }
                this.setRgba(i, j,
                r, g, b, a);
            }
        }
    }
};

class PerlinSampler2D {

    private width : number;
    private height : number;
    private randseed : number;
    private gradients;

    constructor(width, height, randseed) {
        this.width = width;
        this.height = height;
        this.randseed = randseed;
        this.gradients = new Array(width * height * 2);
        this.sampler(randseed);
    }
    private sampler(randseed : number) {
        let rand = new Random();
        rand.setSeed(randseed);

        for (let i = 0; i < this.gradients.length; i += 2) {
            let x, y;
//            let angle = 2;
            let angle = rand.next() * Math.PI * 2;
            x = Math.sin(angle);
            y = Math.cos(angle);
            this.gradients[i] = x;
            this.gradients[i + 1] = y;
        }
    }
    private dot(cellX, cellY, vx, vy) {
        let offset = (cellX + cellY * this.width) * 2;
        let wx = this.gradients[offset];
        let wy = this.gradients[offset + 1];
        return wx * vx + wy * vy;
    }
    private lerp(a, b, t) {
        return a + t * (b - a);
    }

    private sCurve(t) {
        return t * t * (3 - 2 * t);
    }
    public getValue(x, y) {
        let xCell = Math.floor(x);
        let yCell = Math.floor(y);
        let xFrac = x - xCell;
        let yFrac = y - yCell;
        let x0 = xCell;
        let y0 = yCell;
        let x1 = xCell === this.width - 1 ? 0 : xCell + 1;
        let y1 = yCell === this.height - 1 ? 0 : yCell + 1;
        let v00 = this.dot(x0, y0, xFrac, yFrac);
        let v10 = this.dot(x1, y0, xFrac - 1, yFrac);
        let v01 = this.dot(x0, y1, xFrac, yFrac - 1);
        let v11 = this.dot(x1, y1, xFrac - 1, yFrac - 1);
        let vx0 = this.lerp(v00, v10, this.sCurve(xFrac));
        let vx1 = this.lerp(v01, v11, this.sCurve(xFrac));
        return this.lerp(vx0, vx1, this.sCurve(yFrac));
    };
};
