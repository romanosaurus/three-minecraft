import * as THREE from 'three';

export default class PerlinImage
{
    private texture;
    private array;
    private loader : THREE.TextureLoader;
    constructor()
    {
        this.loader = new THREE.TextureLoader();
        this.array = null;
    }
    private load() {
        return new Promise((resolve, reject) => {
            this.loader.load("src/components/utils/noiseTexture.png", function(texture) {
            }, onprogress, reject);
        });
    }
    private loadTexture(path) {
        return new Promise(resolve => {
            new THREE.TextureLoader().load(path, resolve);
        });
    }
    public getTexture() {
        return this.texture;
    }
    public computePerlinCalculation() {
        var canvas = document.createElement("canvas");
        canvas.width = this.texture.image.width;
        canvas.height = this.texture.image.height;
        canvas.getContext('2d').drawImage(this.texture.image,0,0,this.texture.image.width,this.texture.image.height);
        var colors = [];
        // geometry of choice
        for (var i = 0; i < this.texture.image.height; i++) {
            for (var j = 0; j < this.texture.image.width; j++) {
                // pd - pixeldata array in the format of rgba. example: [53, 53, 130, 255]
                var pd = canvas.getContext('2d').getImageData(i,j,1,1).data;
                // not pretty, but works
                colors.push([pd[0], pd[1], pd[2]]);
            }
        }
        this.array = colors;
    }
    public async getArray() {
        if (this.array === null) {
            this.texture = await this.loadTexture("src/components/utils/perlin.png");
            console.log(this.texture);
            this.computePerlinCalculation();
        }
        return this.array;
    }
}
