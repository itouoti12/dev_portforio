// @see origenaly https://github.com/tamani-coding/threejs-character-controls-example/blob/main/src/index.ts
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import placeholderImg from '$lib/assets/three/textures/placeholder/placeholder.png';
import sandBaseImg from '$lib/assets/three/textures/sand/002_COLOR.jpg';
import sandNormalImg from '$lib/assets/three/textures/sand/002_NRM.jpg';
import sandHeightImg from '$lib/assets/three/textures/sand/002_DISP.jpg';
import sandAmbientImg from '$lib/assets/three/textures/sand/002_OCC.jpg';
import soldierModel from '$lib/assets/three/models/Soldier.glb';
import fbxModel from '$lib/assets/three/animationWithSkin/neutral_Idle.fbx';
import { CharacterControls } from './characterControls';
import { loadMixamoAnimationToGLTF } from './loadMixamoAnimationToGLTF';
import idle from '$lib/assets/three/animation/Idle.fbx';
import walk from '$lib/assets/three/animation/Walking.fbx';
import run from '$lib/assets/three/animation/Run.fbx';
import dance from '$lib/assets/three/animation/Hip_Hop_Dancing.fbx';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

// SCENE
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xa8def0);

// HELPER
const gridHelper = new THREE.GridHelper(50, 10);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(180);
scene.add(axesHelper);

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
light();

// FLOOR
// generateFloor();

// MODEL WITH ANIMATIONS
let characterControls: CharacterControls;
function gltfload() {
  new GLTFLoader().load(soldierModel, async function (gltf) {
    const model = gltf.scene;
    model.traverse(function (object: any) {
      if (object.isMesh) object.castShadow = true;
    });

    // scene.add(model);
    const group = new THREE.Group();
    group.rotateX(Math.PI/2);
    group.add(model);
    scene.add(group);


    // HELPER
    const helper = new THREE.SkeletonHelper(model);
    scene.add(helper);

    const rigName = gltf.parser.json.skins[0].name;
    const joints = gltf.parser.json.skins[0].joints;
    console.log(`Rig名: ${rigName}`);
    console.log('関数の一覧:');
    joints.forEach((jointIndex: number) => {
      const joint = gltf.parser.json.nodes[jointIndex];
      const jointname = joint.name;
      console.log(`- ${jointname}`);
    });

    const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
    const mixer = new THREE.AnimationMixer(model);
    const animationsMap: Map<string, THREE.AnimationAction> = new Map();
    // gltfAnimations.filter(animation=>animation.name != 'TPose').forEach((animation)=>{
    //     animationsMap.set(animation.name, mixer.clipAction(animation));
    // });

    // FIXME: mixamoから読み込んだファイルをボーンとマッピングする必要あり
    const idleClip = await loadMixamoAnimationToGLTF(idle, 'Idle', gltf as any);
    animationsMap.set(idleClip.name, mixer.clipAction(idleClip));
    const walkClip = await loadMixamoAnimationToGLTF(walk, 'Walk', gltf as any);
    animationsMap.set(walkClip.name, mixer.clipAction(walkClip));
    const runClip = await loadMixamoAnimationToGLTF(run, 'Run', gltf as any);
    animationsMap.set(runClip.name, mixer.clipAction(runClip));
    // model.rotateX(Math.PI/2);

    characterControls = new CharacterControls(model, mixer, animationsMap, camera, 'Idle', orbitControls);

    console.log(gltf);
  });
}
gltfload();

function fbxload() {
  new FBXLoader().load(fbxModel, async function (fbx: THREE.Group) {
    fbx.scale.set(0.01,0.01,0.01)
    fbx.traverse((child:any)=>{
        if(child.isMesh){
            child.castShadow = true;
            child.receiveShadow = true;
        }
    })
    scene.add(fbx);

    fbx.traverse((child:any)=>{
        if(child.isBone){
            console.log('Bone Name:',child.name);
        }
    })

    const mixer = new THREE.AnimationMixer(fbx);
    const fbxAnimations: THREE.AnimationClip[] = fbx.animations;
    const animationMap: Map<string, THREE.AnimationAction> = new Map();
    fbxAnimations.filter(animation=>animation.name != 'TPose')
    .forEach((animation,i)=>{
        if(i === 0){
            // animationMap.set('Idle',mixer.clipAction(animation))
        }else {
            animationMap.set('Idle',mixer.clipAction(animation))
        }
    });


    characterControls = new CharacterControls(fbx, mixer, animationMap, camera, 'Idle', orbitControls);

    console.log(fbx);
  });
}
// fbxload();


function gltfWithFbxAnimation(){
    new GLTFLoader().load(soldierModel, async function (gltf) {
        new FBXLoader().load(fbxModel, async function (fbx: THREE.Group) {

            const model = gltf.scene;

            // model.rotateX(Math.PI/2);
            

            scene.add(gltf.scene);

            const mixer = new THREE.AnimationMixer(model);
            const animationsMap: Map<string, THREE.AnimationAction> = new Map();

            animationsMap.set('Idle',mixer.clipAction(fbx.animations[1]))
            characterControls = new CharacterControls(model, mixer, animationsMap, camera, 'Idle', orbitControls);


        });
    });
}
// gltfWithFbxAnimation();


// CONTROL KEYS
const keysPressed: { [key: string]: any } = {};
document.addEventListener(
  'keydown',
  (event) => {
    if (event.shiftKey && characterControls) {
      characterControls.switchRunToggle();
    } else {
      keysPressed[event.key.toLowerCase()] = true;
    }
  },
  false
);

document.addEventListener(
  'keyup',
  (event) => {
    keysPressed[event.key.toLowerCase()] = false;
  },
  false
);

// ANIMATE
const clock = new THREE.Clock();
const animate = () => {
  const mixerUpdateDelta = clock.getDelta();
  if (characterControls) {
    characterControls.update(mixerUpdateDelta, keysPressed);
  }
  requestAnimationFrame(animate);

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

function light() {
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

function generateFloor() {
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
  // const material = new THREE.MeshStandardMaterial({
  //     map:sandBaseColor, normalMap:sandNormalMap,
  //     displacementMap:sandHeightMap, displacementScale: 0.1,
  //     aoMap: sandAmbientOcclusion
  // });
  // !!material.map && wrapAndRepeatTexture(material.map);
  // !!material.normalMap && wrapAndRepeatTexture(material.normalMap);
  // !!material.displacementMap && wrapAndRepeatTexture(material.displacementMap);
  // !!material.aoMap && wrapAndRepeatTexture(material.aoMap);
  const material = new THREE.MeshPhongMaterial({ map: placeholder });

  const floor = new THREE.Mesh(geometry, material);
  floor.receiveShadow = true;
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
}

function wrapAndRepeatTexture(map: THREE.Texture) {
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.x = map.repeat.y = 10;
}
