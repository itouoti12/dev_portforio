/**
 * @see https://github.com/pixiv/three-vrm/blob/dev/packages/three-vrm/examples/humanoidAnimation/loadMixamoAnimation.js
 */
import type { VRMCore } from '@pixiv/three-vrm';
import * as THREE from 'three';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';
import { mixamoVRMRigMap } from './mixamoVRMRigMap';

export function loadMixamoAnimationToVRM(path:string,motionName:string, model:VRMCore) {

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
        console.log(model.humanoid?.getNormalizedBoneNode('hips')?.getWorldPosition(_vec3).y)
        console.log(model.scene.getObjectByName('J_Bip_C_Hips')?.getWorldPosition(_vec3).y)
        const vrmHipsY = model.humanoid?.getNormalizedBoneNode('hips')?.getWorldPosition(_vec3).y;
        const vrmRootY = model.scene.getWorldPosition(_vec3).y;
        let hipsPositionScale = 0;
        if(vrmHipsY !== undefined && motionHipsHeight !== undefined){
            const vrmHipsHeight = Math.abs(vrmHipsY - vrmRootY);
            hipsPositionScale = vrmHipsHeight / motionHipsHeight;
        }

        clip.tracks.forEach((track)=>{
            // NOTE: Convert each tracks for VRM use, and push to `tracks`
            const trackSplitted = track.name.split('.');
            const mixamoRigName = trackSplitted[0];
            const vrmBoneName = mixamoVRMRigMap[mixamoRigName];
            const vrmNodeName = model.humanoid?.getNormalizedBoneNode(vrmBoneName)?.name;
            const mixamoRigNode = asset.getObjectByName(mixamoRigName);

            if(vrmNodeName != null){
                const propertyName = trackSplitted[1];
                // NOTE: Store rotations of rest-pose.
                mixamoRigNode?.getWorldQuaternion(restRotationInverse).invert();
                mixamoRigNode?.parent?.getWorldQuaternion(parentRestWorldRotation);

                if(track instanceof THREE.QuaternionKeyframeTrack) {
                    // NOTE: Retarget rotation of mixamoRig to NormalizedBone.
                    for (let i = 0; i < track.values.length; i += 4) {
                        const flatQuaternion = track.values.slice(i,i + 4);
                        _quatA.fromArray(flatQuaternion);
                        // // NOTE: 親のレスト時ワールド回転 * トラックの回転 * レスト時ワールド回転の逆
                        _quatA
                            .premultiply(parentRestWorldRotation)
                            .multiply(restRotationInverse);
                        _quatA.toArray(flatQuaternion);
                        flatQuaternion.forEach((val,index)=>{
                            track.values[index + i] = val;
                        });
                    };

                    tracks.push(
                        new THREE.QuaternionKeyframeTrack(
                            `${vrmNodeName}.${propertyName}`,
                            track.times,
                            track.values.map((val,i)=>(model.meta.metaVersion === '0' && i % 2 === 0 ? -val : val))
                        )
                    );
                } else if (track instanceof THREE.VectorKeyframeTrack){
                    const value = track.values.map((val,i)=>(model.meta.metaVersion === '0' && i % 3 !== 1 ? -val : val) * hipsPositionScale);
                    tracks.push(new THREE.VectorKeyframeTrack(`${vrmNodeName}.${propertyName}`, track.times,value));
                }
            }
        });
        return new THREE.AnimationClip(motionName, clip.duration, tracks);
    })
}
