import * as THREE from 'three';

export default class PerlinGenerator
{
    private p : Array<number>;
    private permutation : Array<number>;
    constructor(size : number) {
        for (let i = 0; i < size * 2; i++)
            this.p.push(0);
        for (let i = 0; i < size; i++)
            this.permutation.push(i);
        for (let i = this.permutation.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * i);
            const temp = this.permutation[i];
            this.permutation[i] = this.permutation[j];
            this.permutation[j] = temp;
        }
        for (let i = 0; i < size; i++) {
            this.p[i] = this.permutation[i];
            this.p[size + 1] = this.permutation[i];
        }
    }
    private noiseTesting(x : number, y : number, z : number) {
        let X : number = Math.floor(x) & 255;                  // FIND UNIT CUBE THAT
        let Y : number= Math.floor(y) & 255;                  // CONTAINS POINT.
        let Z : number= Math.floor(z) & 255;
        x -= Math.floor(x);                                // FIND RELATIVE X,Y,Z
        y -= Math.floor(y);                                // OF POINT IN CUBE.
        z -= Math.floor(z);
        let u : number = this.fade(x);                                // COMPUTE FADE CURVES
        let v : number = this.fade(y);                                // FOR EACH OF X,Y,Z.
        let w : number = this.fade(z);
        let A : number = p[X] + Y;
        let AA : number = p[A] + Z;
        let AB : number = p[A + 1] + Z;      // HASH COORDINATES OF
        let B : number = p[X + 1] + Y;
        let BA : number = p[B]+Z;
        let BB : number= p[B + 1]+Z;      // THE 8 CUBE CORNERS,
 
       return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(p[AA  ], x  , y  , z   ),  // AND ADD
                                      this.grad(p[BA  ], x-1, y  , z   )), // BLENDED
                              this.lerp(u, this.grad(p[AB  ], x  , y-1, z   ),  // RESULTS
                                      this.grad(p[BB  ], x-1, y-1, z   ))),// FROM  8
                      this.lerp(v, this.lerp(u, this.grad(p[AA+1], x  , y  , z-1 ),  // CORNERS
                                      this.grad(p[BA+1], x-1, y  , z-1 )), // OF CUBE
                              this.lerp(u, this.grad(p[AB+1], x  , y-1, z-1 ),
                                      this.grad(p[BB+1], x-1, y-1, z-1 ))));
    }
    private fade(t : number) {
        return (t * t * t * (t * (t * 6 - 15) + 10));
    }
    private lerp(t : number, a : number, b : number) {
        return a + t * (b - a);
    }
    private grad(hash : number, x : number, y : number, z : number) {
        let h : number = hash & 15;                      // CONVERT LO 4 BITS OF HASH CODE
        let u : number = h < 8 ? x : y;                 // INTO 12 GRADIENT DIRECTIONS.
        let v : number = h < 4 ? y : h ===12 || h === 14 ? x : z;

        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
     }
    private Generate(size : number) {
        let testArray : Array<Array<number>>;
        let octaves : number = 8;
        let persistence : number = 0.8;
        let amplitude : number = 1.0;
        let maxamplitude : number = 1.0;
        for (let octave = 0; octave < octaves; octave++) {
            amplitude *= persistence;
            maxamplitude += amplitude;
        }
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                let sc = size / (size / 16);
                let frequency = 1.0;
                let amplitude = 1.0;
                let color = 0.0;
                for (let octave = 0; octave < octaves; octave++) {
                    sc *= frequency;
                    let grey = this.noiseTesting(sc * x / size, sc * y / size, 0.0);
                    grey = (grey + 1.0) / 2.0;
                    grey *= amplitude;
                    color += grey;
                    frequency *= 2.0;
                    amplitude *= persistence;
                }
                color /= maxamplitude;
                color = Math.round(color*255.0);
                testArray[x][y] = color;
//                surface.set_at((x,y),(color,color,color))
            }
        }
        return testArray;
    }
}