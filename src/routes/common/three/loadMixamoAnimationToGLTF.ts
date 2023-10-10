import * as THREE from 'three';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { mixamoGLTFRigMap } from './mixamoGLTFRigMap';

export function loadMixamoAnimationToGLTF(path:string,motionName:string, model:GLTF) {

    const loader = new FBXLoader();
    return loader.loadAsync(path).then((asset) => {


        const clip = THREE.AnimationClip.findByName(asset.animations, 'mixamo.com');
        const tracks:THREE.KeyframeTrack[] = [];

        const restRotationInverse = new THREE.Quaternion();
        const parentRestWorldRotation = new THREE.Quaternion();
        const _quatA = new THREE.Quaternion();
        const _vec3 = new THREE.Vector3();

        // NOTE: Adjust with reference to hips height.
        const motionHipsHeight = asset.getObjectByName('mixamorigHips')?.position.y;
        const hipsY = model.scene.getObjectByName('mixamorigHips')?.getWorldPosition(_vec3).y;
        const rootY = model.scene.getWorldPosition(_vec3).y;
        let hipsPositionScale = 0;
        if(hipsY !== undefined && motionHipsHeight !== undefined){
            const hipsHeight = Math.abs(hipsY - rootY);
            hipsPositionScale = hipsHeight / motionHipsHeight;
        }

        clip.tracks.forEach((track)=>{
            // NOTE: Convert each tracks for GLTF use, and push to `tracks`
            const trackSplitted = track.name.split('.');
            const mixamoRigName = trackSplitted[0];
            const gltfBoneName = mixamoGLTFRigMap[mixamoRigName];
            const gltfNodeName = model.scene.getObjectByName(gltfBoneName)?.name;
            const mixamoRigNode = asset.getObjectByName(mixamoRigName);

            console.log(gltfNodeName)
            if(gltfNodeName != null){
                const propertyName = trackSplitted[1];
                // NOTE: Store rotations of rest-pose.
                mixamoRigNode?.getWorldQuaternion(restRotationInverse).invert();
                mixamoRigNode?.parent?.getWorldQuaternion(parentRestWorldRotation);

                if(track instanceof THREE.QuaternionKeyframeTrack) {
                    // NOTE: Retarget rotation of mixamoRig to NormalizedBone.
                    // for (let i = 0; i < track.values.length; i += 4) {
                    //     const flatQuaternion = track.values.slice(i,i + 4);
                    //     _quatA.fromArray(flatQuaternion);
                    //     // NOTE: 親のレスト時ワールド回転 * トラックの回転 * レスト時ワールド回転の逆 = ベクトルV
                    //     // FIXME: ここで回転軸をどうにかしないといけない
                    //     // .premultiply(parentRestWorldRotation)
                    //     // .multiply(restRotationInverse);
                    //     // parentRestWorldRotation
                    //     // .setFromAxisAngle(new THREE.Vector3(0,1,0).normalize(), Math.PI/2);
                    //     // _quatA
                    //     // .multiply(parentRestWorldRotation);
                    //     _quatA.toArray(flatQuaternion);
                    //     flatQuaternion.forEach((val,index)=>{
                    //         track.values[index + i] = val;
                    //     });
                    // };

                    tracks.push(
                        new THREE.QuaternionKeyframeTrack(
                            `${gltfNodeName}.${propertyName}`,
                            track.times,
                            track.values
                        )
                    );
                } else if (track instanceof THREE.VectorKeyframeTrack){
                    const value = track.values.map((val,i)=>(i % 3 !== 1 ? -val : val) * hipsPositionScale);
                    // const value = track.values.map((val,i)=> val * hipsPositionScale);
                    tracks.push(new THREE.VectorKeyframeTrack(`${gltfNodeName}.${propertyName}`, track.times,value));
                }
            }
        });
        return new THREE.AnimationClip(motionName, clip.duration, tracks);
    })
}
