/**
 * model sample
 * @see https://github.com/madjin/vrm-samples
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import placeholderImg from '$lib/assets/three/textures/placeholder/placeholder.png';
import sandBaseImg from '$lib/assets/three/textures/sand/002_COLOR.jpg';
import sandNormalImg from '$lib/assets/three/textures/sand/002_NRM.jpg';
import sandHeightImg from '$lib/assets/three/textures/sand/002_DISP.jpg';
import sandAmbientImg from '$lib/assets/three/textures/sand/002_OCC.jpg';
import defaultVrmModel from '$lib/assets/three/models/AvatarSample_A.vrm';
import { CharacterControls } from './characterControls';
import { VRMCore, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { loadMixamoAnimationToVRM } from './loadMixamoAnimationToVRM';
import idle from '$lib/assets/three/animation/Idle.fbx';
import walk from '$lib/assets/three/animation/Walking.fbx';
import run from '$lib/assets/three/animation/Run.fbx';
import jump from '$lib/assets/three/animation/Jump.fbx';
import dance from '$lib/assets/three/animation/Hip_Hop_Dancing.fbx';
import { SPACE } from './utils';

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8def0);

// CAMERA
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 5;
camera.position.z = 5;
camera.position.x = 0;

// RENDERER
let renderer: THREE.WebGLRenderer;

// CONTROLS
let orbitControls: OrbitControls;

// LIGHTS
light(scene);

// FLOOR
generateFloor(scene);

// MODEL WITH ANIMATIONS
// gltf and vrm
let currentVrm: VRMCore | undefined = undefined;

let characterControls: CharacterControls;
const loader = new GLTFLoader();
loader.crossOrigin = 'anonymous';
loader.register((parser) => {
  return new VRMLoaderPlugin(parser);
});

function load(url:string){
    loader.load(
      url,
      async function (gltf) {
        const vrm = gltf.userData.vrm as VRMCore;

        const joints = gltf.parser.json.skins[0].joints;
        console.log('関数の一覧:');
        joints.forEach((jointIndex: number) => {
          const joint = gltf.parser.json.nodes[jointIndex];
          const jointname = joint.name;
          console.log(`- ${jointname}`);
        });

        // calling these functions greatly improves the performance
        VRMUtils.removeUnnecessaryVertices( gltf.scene );
        VRMUtils.removeUnnecessaryJoints( gltf.scene );

        if( currentVrm ){
            scene.remove(currentVrm.scene);
            VRMUtils.deepDispose(currentVrm.scene);
        }

        vrm.scene.traverse(function (object:any){
            if(object.isMesh) object.castShadow = true;
            object.frustumCulled = false;
        });


        // const helper = new THREE.SkeletonHelper( vrm.scene );
        // scene.add( helper );

        // NOTE: loadMixamoAnimation
        const animationsMap: Map<string,THREE.AnimationAction> = new Map();
        const mixer = new THREE.AnimationMixer(vrm.scene);
        const idleClip = await loadMixamoAnimationToVRM(idle,'Idle',vrm);
        animationsMap.set(idleClip.name, mixer.clipAction(idleClip));
        const walkClip = await loadMixamoAnimationToVRM(walk,'Walk',vrm);
        animationsMap.set(walkClip.name, mixer.clipAction(walkClip));
        const runClip = await loadMixamoAnimationToVRM(run,'Run',vrm);
        animationsMap.set(runClip.name, mixer.clipAction(runClip));
        const danceClip = await loadMixamoAnimationToVRM(dance,'Dance',vrm);
        animationsMap.set(danceClip.name, mixer.clipAction(danceClip));
        const jumpClip = await loadMixamoAnimationToVRM(jump,'Jump',vrm);
        const jumpAction = mixer.clipAction(jumpClip);
        jumpAction.clampWhenFinished = true;
        jumpAction.setLoop(THREE.LoopOnce,1);
        animationsMap.set(jumpClip.name, jumpAction);

        characterControls = new CharacterControls(vrm.scene,mixer,animationsMap,camera,'Idle',orbitControls);

        currentVrm = vrm;
        scene.add(vrm.scene);

        // HELPER
        const helper = new THREE.SkeletonHelper(vrm.scene);
        scene.add(helper);

        // rotate if the VRM is VRM0.0
    	  VRMUtils.rotateVRM0( vrm );

        console.log(vrm);
      },
      (progress) => console.log('Loading model...', 100.8 * (progress.loaded / progress.total), '%'),
      (error) => console.error(error)
    );
}
load(defaultVrmModel);

// CONTROL KEYS
const keysPressed: {[key:string]:any} = {};
document.addEventListener('keydown', (event)=>{
    if(event.shiftKey && characterControls){
        characterControls.switchRunToggle();
    } else{
        keysPressed[event.key.toLowerCase()] = true;
    }

},false);

document.addEventListener('keyup', (event)=>{
    if(event.key.toLowerCase() === SPACE){
        return
    }
    keysPressed[event.key.toLowerCase()] = false;
},false);

// Drag&Drop Handler
document.addEventListener('dragover',(event)=>{
    event.preventDefault();
});
document.addEventListener('drop',(event)=>{
    event.preventDefault();
    // read given file then convert it to blob url
    const files = event.dataTransfer?.files;
    if(!files || !files[0]) return;

    const blob = new Blob([files[0]],{type:"application/octet-stream"});
    const url = URL.createObjectURL(blob);
    load(url);
});

// ANIMATE
const clock = new THREE.Clock();
const animate = () => {
  const mixerUpdateDelta = clock.getDelta();
  if(characterControls){
      characterControls.update(mixerUpdateDelta, keysPressed)
  }
  requestAnimationFrame(animate);

  if(currentVrm){
    currentVrm.update(mixerUpdateDelta);
  }

  renderer.render(scene, camera);
};

// RESIZE HANDLER
const resize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

export const createScene = (el: any) => {
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;
  orbitControls.minDistance = 5;
  orbitControls.maxDistance = 15;
  orbitControls.enablePan = false;
  orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
  orbitControls.update();
  resize();
  animate();
};

window.addEventListener('resize', resize);

function light(scene: THREE.Scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 2.0));

  const dirLight = new THREE.DirectionalLight(0xffffff, 2);
  dirLight.position.set(-60, 100, -10);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 50;
  dirLight.shadow.camera.bottom = -50;
  dirLight.shadow.camera.left = -50;
  dirLight.shadow.camera.right = 50;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 200;
  dirLight.shadow.mapSize.width = 4096;
  dirLight.shadow.mapSize.height = 4096;
  scene.add(dirLight);
  // scene.add(new THREE.CameraHelper(dirLight.shadow.camera));
}

function generateFloor(scene: THREE.Scene) {
  // TEXTURES
  const textureLoader = new THREE.TextureLoader();
  const placeholder = textureLoader.load(placeholderImg);
  const sandBaseColor = textureLoader.load(sandBaseImg);
  const sandNormalMap = textureLoader.load(sandNormalImg);
  const sandHeightMap = textureLoader.load(sandHeightImg);
  const sandAmbientOcclusion = textureLoader.load(sandAmbientImg);

  const WIDTH = 80;
  const LENGTH = 80;

  const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 512, 512);
  const material = new THREE.MeshStandardMaterial({
    map: sandBaseColor,
    normalMap: sandNormalMap,
    displacementMap: sandHeightMap,
    displacementScale: 0.1,
    aoMap: sandAmbientOcclusion
  });
  // const material = new THREE.MeshPhongMaterial({map:placeholder});
  !!material.map && wrapAndRepeatTexture(material.map);
  !!material.normalMap && wrapAndRepeatTexture(material.normalMap);
  !!material.displacementMap && wrapAndRepeatTexture(material.displacementMap);
  !!material.aoMap && wrapAndRepeatTexture(material.aoMap);

  const floor = new THREE.Mesh(geometry, material);
  floor.receiveShadow = true;
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
}

function wrapAndRepeatTexture(map: THREE.Texture) {
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.x = map.repeat.y = 10;
}

