// @see origenaly https://github.com/tamani-coding/threejs-character-controls-example/blob/main/src/index.ts
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import placeholderImg from '$lib/assets/three/textures/placeholder/placeholder.png';
import sandBaseImg from '$lib/assets/three/textures/sand/Sand 002_COLOR.jpg';
import sandNormalImg from '$lib/assets/three/textures/sand/Sand 002_NRM.jpg';
import sandHeightImg from '$lib/assets/three/textures/sand/Sand 002_DISP.jpg';
import sandAmbientImg from '$lib/assets/three/textures/sand/Sand 002_OCC.jpg';
import soldierModel from '$lib/assets/three/models/Soldier.glb';
import { CharacterControls } from './characterControls';


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
light();

// FLOOR
generateFloor();

// MODEL WITH ANIMATIONS
let characterControls: CharacterControls;
new GLTFLoader().load(soldierModel,function(gltf){
    const model = gltf.scene;
    model.traverse(function (object:any){
        if(object.isMesh) object.castShadow = true;
    });
    scene.add(model);

    const gltfAnimations : THREE.AnimationClip[] = gltf.animations;
    const mixer = new THREE.AnimationMixer(model);
    const animationsMap: Map<string,THREE.AnimationAction> = new Map();
    gltfAnimations.filter(animation=>animation.name != 'TPose').forEach((animation)=>{
        animationsMap.set(animation.name, mixer.clipAction(animation));
    });

    characterControls = new CharacterControls(model,mixer,animationsMap,camera,'Idle',orbitControls);

});

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
        keysPressed[event.key.toLowerCase()] = false;
},false);



// ANIMATE
const clock = new THREE.Clock();
const animate = () => {
    const mixerUpdateDelta = clock.getDelta();
    if(characterControls){
        characterControls.update(mixerUpdateDelta, keysPressed)
    }
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

// RESIZE HANDLER
const resize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
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
  orbitControls.enablePan =false;
  orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
  orbitControls.update();
  resize();
  animate();
}

window.addEventListener('resize', resize);


function light(){
    scene.add(new THREE.AmbientLight(0xffffff,2.0));

    const dirLight = new THREE.DirectionalLight(0xffffff,2);
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

function generateFloor(){
    // TEXTURES
    const textureLoader = new THREE.TextureLoader();
    const placeholder = textureLoader.load(placeholderImg);
    const sandBaseColor = textureLoader.load(sandBaseImg);
    const sandNormalMap = textureLoader.load(sandNormalImg);
    const sandHeightMap = textureLoader.load(sandHeightImg);
    const sandAmbientOcclusion = textureLoader.load(sandAmbientImg);

    const WIDTH = 80;
    const LENGTH = 80;

    const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH,512,512);
    const material = new THREE.MeshStandardMaterial({
        map:sandBaseColor, normalMap:sandNormalMap,
        displacementMap:sandHeightMap, displacementScale: 0.1,
        aoMap: sandAmbientOcclusion
    });
    // const material = new THREE.MeshPhongMaterial({map:placeholder});
    !!material.map && wrapAndRepeatTexture(material.map);
    !!material.normalMap && wrapAndRepeatTexture(material.normalMap);
    !!material.displacementMap && wrapAndRepeatTexture(material.displacementMap);
    !!material.aoMap && wrapAndRepeatTexture(material.aoMap);

    const floor = new THREE.Mesh(geometry,material);
    floor.receiveShadow = true;
    floor.rotation.x = - Math.PI / 2;
    scene.add(floor);
}

function wrapAndRepeatTexture(map:THREE.Texture){
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.x = map.repeat.y = 10;
}


