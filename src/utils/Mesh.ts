import * as THREE from 'three';

import PerlinGenerator from './PerlinGenerator';

export default class MyMesh {

    private size : number;
    /* Pos of the mesh if all mesh were in a two dimensionnal array */
    private HeightOffset : number;
    private WidthOffset : number;
    private data;

    constructor(size : number, HeightOffset : number, WidthOffset : number, generator : PerlinGenerator) {
        this.size = size;
        this.HeightOffset = HeightOffset;
        this.WidthOffset = WidthOffset;
        this.data = generator.createMesh(size, WidthOffset, HeightOffset)
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