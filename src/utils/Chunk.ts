import * as THREE from 'three';

import PerlinGenerator from './PerlinGenerator';

export default class Chunk {

    public size : number;
    /* Pos of the mesh if all mesh were in a two dimensionnal array */
    public HeightOffset : number;
    public WidthOffset : number;
    public data;

    constructor(size : number, HeightOffset : number, WidthOffset : number, generator : PerlinGenerator |  null, data?: any) {
        this.size = size;
        this.HeightOffset = HeightOffset;
        this.WidthOffset = WidthOffset;
        this.data = data || generator.createMesh();
    }
    public getMeshSize() {
        return this.size;
    }
    public getHeightOffset() {
        return this.HeightOffset;
    }
    public getWidthOffset() {
        return this.WidthOffset;
    }
    public getMeshData() {
        return this.data;
    }
};
