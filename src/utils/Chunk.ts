import PerlinGenerator from './PerlinGenerator';

/**
 * @class Chunk used to stock chunk's datas, like its position, its size, its raw generated data
 */
/*
    __________████████_____██████
    _________█░░░░░░░░██_██░░░░░░█
    ________█░░░░░░░░░░░█░░░░░░░░░█
    _______█░░░░░░░███░░░█░░░░░░░░░█
    _______█░░░░███░░░███░█░░░████░█
    ______█░░░██░░░░░░░░███░██░░░░██
    _____█░░░░░░░░░░░░░░░░░█░░░░░░░░███
    ____█░░░░░░░░░░░░░██████░░░░░████░░█
    ____█░░░░░░░░░█████░░░████░░██░░██░░█
    ___██░░░░░░░███░░░░░░░░░░█░░░░░░░░███
    __█░░░░░░░░░░░░░░█████████░░█████████
    _█░░░░░░░░░░█████_████___████_█████___█
    _█░░░░░░░░░░█______█_███__█_____███_█___█
    █░░░░░░░░░░░░█___████_████____██_██████
    ░░░░░░░░░░░░░█████████░░░████████░░░█
    ░░░░░░░░░░░░░░░░█░░░░░█░░░░░░░░░░░░█
    ░░░░░░░░░░░░░░░░░░░░██░░░░█░░░░░░██
    ░░░░░░░░░░░░░░░░░░██░░░░░░░███████
    ░░░░░░░░░░░░░░░░██░░░░░░░░░░█░░░░░█
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█
    ░░░░░░░░░░░█████████░░░░░░░░░░░░░░██
    ░░░░░░░░░░█▒▒▒▒▒▒▒▒███████████████▒▒█
    ░░░░░░░░░█▒▒███████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█
    ░░░░░░░░░█▒▒▒▒▒▒▒▒▒█████████████████
    ░░░░░░░░░░████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█
    ░░░░░░░░░░░░░░░░░░██████████████████
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█
    ██░░░░░░░░░░░░░░░░░░░░░░░░░░░██
    ▓██░░░░░░░░░░░░░░░░░░░░░░░░██
    ▓▓▓███░░░░░░░░░░░░░░░░░░░░█
    ▓▓▓▓▓▓███░░░░░░░░░░░░░░░██
    ▓▓▓▓▓▓▓▓▓███████████████▓▓█
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█
*/

export default class Chunk {

    /**
     * Public members
     */
    public size : number;
    /* Pos of the mesh if all mesh were in a two dimensionnal array */
    public HeightOffset : number;
    public WidthOffset : number;
    public data: number[];

    /**
     * Constructor of the Chunk class
     * @param size : the size to set to the Chunk
     * @param HeightOffset : the HeightOffset to set to the Chunk
     * @param WidthOffset : the WidthOffset to set to the Chunk
     * @param generator : an optionnal parameter, the generator that will be used to generate data if needed, if non it's null
     * @param data : an optionnal parameter, the data of the chunk if it already was generated. If this parameter is given, the CHunk class won't generated raw perlin data
     */
    constructor(size : number, HeightOffset : number, WidthOffset : number, generator : PerlinGenerator | null, data?: any) {
        this.size = size;
        this.HeightOffset = HeightOffset;
        this.WidthOffset = WidthOffset;
        this.data = data || generator.createMesh();
    }

    /**
     * Public getter of the Chunk mesh size
     * @return the size of the chunk
     */
    public getMeshSize() {
        return this.size;
    }

    /**
     * Public getter of the Chunk HeightOffset
     * @return the HeightOffset of the chunk
     */
    public getHeightOffset() {
        return this.HeightOffset;
    }

    /**
     * Public getter of the Chunk WidthOffset
     * @return the WidthOffset of the chunk
     */
    public getWidthOffset() {
        return this.WidthOffset;
    }

    /**
     * Public getter of the Chunk raw perlin data
     * @return the raw perlin data of the chunk
     */
    public getMeshData() {
        return this.data;
    }
};
