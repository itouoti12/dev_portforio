// @see origenaly https://github.com/tamani-coding/threejs-character-controls-example/blob/main/src/index.ts
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import soldierModel from '$lib/assets/three/models/Soldier.glb';
import fbxModel from '$lib/assets/three/animationWithSkin/neutral_Idle.fbx';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

// SCENE
const scene = new THREE.Scene();

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

// MODEL WITH ANIMATIONS
let targetAnimation: THREE.AnimationAction;
let mixer: THREE.AnimationMixer;

// NOTE: step1 drawing fbxmodel
function fbxload() {
  new FBXLoader().load(fbxModel, async function (fbx: THREE.Group) {
    fbx.scale.set(0.01,0.01,0.01)
    scene.add(fbx);

    // display bone name
    fbx.traverse((child:any)=>{
        if(child.isBone){
            console.log('Bone Name:',child.name);
        }
    })

    mixer = new THREE.AnimationMixer(fbx);
    const fbxAnimations: THREE.AnimationClip[] = fbx.animations;
    targetAnimation = mixer.clipAction(fbxAnimations[1]);
    targetAnimation.play();
  });
}
// fbxload();

// NOTE: step2 drawing gltfmodel
function gltfload() {
  new GLTFLoader().load(soldierModel, async function (gltf) {
    const model = gltf.scene;
    model.traverse(function (object: any) {
      if (object.isMesh) object.castShadow = true;
    });
    scene.add(model);

    // display bone name
    const joints = gltf.parser.json.skins[0].joints;
    console.log('Bone Name::');
    joints.forEach((jointIndex: number) => {
      const joint = gltf.parser.json.nodes[jointIndex];
      const jointname = joint.name;
      console.log(`- ${jointname}`);
    });

    const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
    mixer = new THREE.AnimationMixer(model);
    const idle = gltfAnimations
    .find(animation=>animation.name === 'Idle');
    if(idle){
      targetAnimation = mixer.clipAction(idle);
      // targetAnimation.play();
    }

  });
}
// gltfload();


// NOTE: step3 drawing gltfmodel
// FIXME: Applying fbx animation to a gltf model causes the stance to be horizontal
function gltfWithFbxAnimation(){
    new GLTFLoader().load(soldierModel, async function (gltf) {
        new FBXLoader().load(fbxModel, async function (fbx: THREE.Group) {
            const model = gltf.scene;
            // 
            // model.rotateX(Math.PI/2)
            scene.add(gltf.scene);

            mixer = new THREE.AnimationMixer(model);
            targetAnimation = mixer.clipAction(fbx.animations[1]);
            targetAnimation.play();

        });
    });
}
gltfWithFbxAnimation();

// ANIMATE
const clock = new THREE.Clock();
const animate = () => {
  const mixerUpdateDelta = clock.getDelta();
  mixer?.update(mixerUpdateDelta);
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

// RESIZE HANDLER
const resize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

export const createGltfScene = (el: any) => {
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
}
