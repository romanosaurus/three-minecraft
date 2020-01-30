import * as THREE from 'three';

class Random {
    private m : number;
    private a : number;
    private q : number;
    private r : number;
    private seed : number;
    constructor() {
        this.m = 2147483647; //2^31 - 1
        this.a = 16807; //7^5; primitive root of m
        this.q = 127773; // m / a
        this.r = 2836; // m % a
        this.seed = 1;
    }
    public setSeed(seed) {
        if (seed <= 0) {
            seed = -(seed % (this.m - 1)) + 1;
        }
        if (seed > this.m - 1) {
            seed = this.m - 1;
        }
        this.seed = seed;
    }
    private nextLong() {
        let res = this.a * (this.seed % this.q) - this.r * Math.floor(this.seed / this.q);
        if (res <= 0) {
            res += this.m;
        }
        this.seed = res;
        return res;
    }
    public next() {
        let res = this.nextLong();
        return res / this.m;
    }
};

export default class PerlinGenerator {
    private width : number;
    private height : number;
    private data;
    private spec;
    constructor(width : number, height : number) {
        this.width = width;
        this.height = height;
        this.data = new Array(width * height * 4);
        this.spec = {};
        this.spec.randseed = 1;
        this.spec.period = 32;
        this.spec.levels = 3;
        this.spec.atten = 0.1;
        this.spec.absolute = false;
        this.spec.color = false;
        this.spec.alpha = false;
        this.createTurbulence(this.spec);
    }
    public getWidth() {
        return this.width;
    }
    public getHeight() {
        return this.height;
    }
    public async getData() {
        return this.data;
    }
    private setColor(x, y, color) {
        var offset = ((y * this.width) + x) * 4;
        
        this.data[offset] = color.r;
        this.data[offset + 1] = color.g;
        this.data[offset + 2] = color.b;
        this.data[offset + 3] = color.a;
    }

    private setRgba = function(x, y, r, g, b, a) {
        var offset = ((y * this.width) + x) * 4;
        
        this.data[offset] = r;
        this.data[offset + 1] = g;
        this.data[offset + 2] = b;
        this.data[offset + 3] = a;
    }
    private createPerlinNoise(period, randseed) {
        var sampler = new PerlinSampler2D(Math.ceil(this.width / period), Math.ceil(this.height / period), randseed);
        
        for (var j = 0; j < this.height; ++j)
        {
            for (var i = 0; i < this.width; ++i)
            {
                var val = sampler.getValue(i / period, j / period);
                var b = (val + 1) / 2 * 256;
                
                this.setRgba(i, j, 
                b, b, b, 0xff);
            }
        }
    }
    public createTurbulence(spec) {
        var numChannels = spec.color ? 3 : 1 + spec.alpha ? 1 : 0;
        var raster = new Array(this.width * this.height * numChannels);
        
        for (var i = 0; i < raster.length; ++i)
        {
            raster[i] = 0;
        }

        for (var k = 0; k < numChannels; ++k)
        {
//            var localPeriod = spec.period;
            var localPeriodInv = 1 / spec.period;
            var freqInv = 1;
            var atten = 1;
            var weight = 0;
            for (var lvlIdx = 0; lvlIdx < spec.levels; ++lvlIdx)
            {
                var sampler = new PerlinSampler2D(Math.ceil(this.width * localPeriodInv), Math.ceil(this.height * localPeriodInv), spec.randseed + k + lvlIdx);

                for (var j = 0; j < this.height; ++j)
                {
                    for (var i = 0; i < this.width; ++i)
                    {
                        var val = sampler.getValue(i * localPeriodInv, j * localPeriodInv);
                        raster[(i + j * this.width) * numChannels + k] += val * Math.pow(freqInv, spec.atten);
                    }
                }
                weight += Math.pow(freqInv, spec.atten);
                freqInv *= .5;
                localPeriodInv *= 2;
//                atten /= 2;
                atten *= spec.atten;
            }

			var weightInv = 1 / weight;            
			for (var j = 0; j < this.height; ++j)
			{
				for (var i = 0; i < this.width; ++i)
				{
					raster[(i + j * this.width) * numChannels + k] *= weightInv;
				}
			}
            
        }
                
        for (var j = 0; j < this.height; ++j)
        {
            for (var i = 0; i < this.width; ++i)
            {
                var offset = (i + j * this.width) * numChannels;
//                var val = raster[offset];
                var r, g, b, a;
                
                if (spec.color)
                {
                    r = raster[offset];
                    g = raster[offset + 1];
                    b = raster[offset + 2];
                    a = spec.alpha ? raster[offset + 3] : 1;
                }
                else
                {
                    r = g = b = raster[offset];
                    a = spec.alpha ? raster[offset + 1] : 1;
                }
                
                if (spec.absolute)
                {
                    r = Math.abs(r) * 255;
                    g = Math.abs(g) * 255;
                    b = Math.abs(b) * 255;
                    a = Math.abs(a) * 255;
                }
                else
                {
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
    private createChecker(period) {
        for (var j = 0; j < this.height; ++j)
        {
            for (var i = 0; i < this.width; ++i)
            {
                if ((Math.floor(j / period) + Math.floor(i / period)) % 2 === 0)
                {
                    this.setRgba(i, j, 0, 0, 0, 0xff);
                }
                else
                {
                    this.setRgba(i, j, 0xff, 0xff, 0xff, 0xff);
                }
            }
        }
    }
    /*
    private toImageContext(ctx) {
        var imgData = ctx.createImageData(this.width, this.height);

        for (var i = 0, len = width * height * 4; i < len; i++)
        {
            imgData.data[i] = this.data[i];
        }
        
        return imgData;
    }*/
};
/*
function Color(r, g, b, a)
{
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
}*/

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
            let angle = rand.next() * Math.PI * 2;
            x = Math.sin(angle);
            y = Math.cos(angle);
            this.gradients[i] = x;
            this.gradients[i + 1] = y;
        }
    }
    private dot = function(cellX, cellY, vx, vy)
    {
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
    public getValue(x, y)
    {
        var xCell = Math.floor(x);
        var yCell = Math.floor(y);
        var xFrac = x - xCell;
        var yFrac = y - yCell;
        
        var x0 = xCell;
        var y0 = yCell;
        var x1 = xCell === this.width - 1 ? 0 : xCell + 1;
        var y1 = yCell === this.height - 1 ? 0 : yCell + 1;
        
        
        
        var v00 = this.dot(x0, y0, xFrac, yFrac);
        var v10 = this.dot(x1, y0, xFrac - 1, yFrac);
        var v01 = this.dot(x0, y1, xFrac, yFrac - 1);
        var v11 = this.dot(x1, y1, xFrac - 1, yFrac - 1);
        
        var vx0 = this.lerp(v00, v10, this.sCurve(xFrac));
        var vx1 = this.lerp(v01, v11, this.sCurve(xFrac));
        
        return this.lerp(vx0, vx1, this.sCurve(yFrac));
    };
};