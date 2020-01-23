import * as THREE from 'three';

export default class PerlinImage
{
    private texture;
    private array;
    private loader : THREE.TextureLoader;
    private fileName : string;
    constructor(filename : string)
    {
        this.loader = new THREE.TextureLoader();
        this.array = null;
        this.fileName = filename;
    }
    private loadTexture() {
        return new Promise(resolve => {
            new THREE.TextureLoader().load(this.fileName, resolve);
        });
    }
    public getTexture() {
        return this.texture;
    }
    public computePerlinCalculation() {
        let canvas = document.createElement("canvas");
        canvas.width = this.texture.image.width;
        canvas.height = this.texture.image.height;
        canvas.getContext('2d').drawImage(this.texture.image, 0, 0, this.texture.image.width, this.texture.image.height);
        let colors = [];
        for (let i = 0; i < this.texture.image.height; i++) {
            for (let j = 0; j < this.texture.image.width; j++) {
                //pixeldata array in the format of rgba. example: [53, 53, 130, 255]
                let pd = canvas.getContext('2d').getImageData(i, j, 1, 1).data;
                colors.push([pd[0], pd[1], pd[2]]);
            }
        }
        this.array = colors;
    }
    public async getArray() {
        if (this.array === null) {
            this.texture = await this.loadTexture();
            console.log(this.texture);
            this.computePerlinCalculation();
        }
        return this.array;
    }
}
