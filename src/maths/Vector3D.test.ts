import { Vec3 } from 'cannon';
import { Vector3 } from 'three';

import Vector3D from "./Vector3D";

test('vector3d.zero', () => {
    let mutableVec = Vector3D.ZERO;

    expect(mutableVec.x === 0 && mutableVec.y === 0 && mutableVec.z === 0);
})

test('creation vector3d comparison threejs', () => {
    let mutableVec = new Vector3D;
    let threeVec = new Vector3;

    expect(mutableVec.x === threeVec.x && mutableVec.y === threeVec.y && mutableVec.z === threeVec.z);
});

test('creation vector3d comparison cannonjs', () => {
    let mutableVec = new Vector3D;
    let cannonVec = new Vec3;

    expect(mutableVec.x === cannonVec.x && mutableVec.y === cannonVec.y && mutableVec.z === cannonVec.z);
});

test('normalize vector3d comparison threejs', () => {
    let mutableVec = new Vector3D(10, 10, 10);
    let threeVec = new Vector3(10, 10, 10);

    mutableVec.normalize();
    threeVec.normalize();

    expect(mutableVec.x === threeVec.x && mutableVec.y === threeVec.y && mutableVec.z === threeVec.z);
});

test('normalize vector3d comparison cannonjs', () => {
    let mutableVec = new Vector3D(10, 10, 10);
    let cannonVec = new Vec3(10, 10, 10);

    mutableVec.normalize();
    cannonVec.normalize();

    expect(mutableVec.x === cannonVec.x && mutableVec.y === cannonVec.y && mutableVec.z === cannonVec.z);
});