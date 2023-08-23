import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import type { mapbox } from './mapbox';
import mapboxgl from 'mapbox-gl';
import { CharacterControlsOnMap } from '../three/characterControlsOnMap';

interface ConstructorProps {
  url: string;
  origin: mapbox.LngLatLike;
  altitude: number;
  id: string;
  scale: number;
  bearing:number;
  isTrackingModel?:boolean;
  onLoad?: () => void;
}
export interface ModelTransformProps {
  translateX: number;
  translateY: number;
  translateZ: number | undefined;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
}

interface CustomLayer {
  updateLngLat?: ({ lngLat, altitude, deg }: { lngLat?: mapboxgl.LngLatLike; altitude?: number; deg?: number }) => void;
}
const modelRotate = [Math.PI / 2, 0, 0];

export function gltfModelLayer(props: ConstructorProps): mapbox.AnyLayer & CustomLayer {
  let camera: THREE.Camera;
  let scene: THREE.Scene;
  let layermap: mapboxgl.Map;
  let renderer: THREE.WebGLRenderer;
  let modelTransform: ModelTransformProps;
  let modelOrigin: mapboxgl.LngLatLike;
  let modelAttitude: number;
  let characterControls: CharacterControlsOnMap;
  const bearing = props.bearing;

  return {
    id: props.id,
    renderingMode: '3d',
    type: 'custom',

    // レイヤーがマップに追加されたときに呼び出されるオプションのメソッド
    onAdd: function (map, gl) {
      const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(props.origin, props.altitude);

      modelTransform = {
        translateX: modelAsMercatorCoordinate.x,
        translateY: modelAsMercatorCoordinate.y,
        translateZ: modelAsMercatorCoordinate.z,
        rotateX: modelRotate[0],
        rotateY: modelRotate[1],
        rotateZ: modelRotate[2],
        scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
      };

      layermap = map;

      // NOTE: 以下Three.js実装
      // SCENE
      scene = new THREE.Scene();

      // CAMERA
      camera = new THREE.Camera();

      // LIGHTS
      light(scene);

      // MODEL WITH ANIMATIONS
      const gltfLoader = new GLTFLoader();
      gltfLoader.load(props.url, function (gltf) {
        const model = gltf.scene;
        model.traverse(function (object: any) {
          if (object.isMesh) object.castShadow = true;
          if (object.isMesh) object.material.needsUpdate = true;
        });

        model.scale.set(props.scale,props.scale,props.scale);
        scene.add(model);

        const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
        const mixer = new THREE.AnimationMixer(model);
        const animationsMap: Map<string, THREE.AnimationAction> = new Map();
        gltfAnimations
          .filter((animation) => animation.name != 'TPose')
          .forEach((animation) => {
            animationsMap.set(animation.name, mixer.clipAction(animation));
          });
        characterControls = new CharacterControlsOnMap(model, mixer, animationsMap, camera, 'Idle', modelTransform,bearing,layermap,props.isTrackingModel);
        characterControls.updateCameraRotation(bearing);
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


      // RENDERER
      // threeJsで描画したオブジェクトをmapboxにマッピングする
      renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true
      });
      renderer.shadowMap.enabled = true;
      renderer.autoClear = false;

      // MAP rotate
      map.on('rotate',function(){
        const bearing = map.getBearing();
        if(characterControls){
            characterControls.updateCameraRotation(bearing);
        }
      })

      // ANIMATE
      const clock = new THREE.Clock();
      function animate()  {
        const mixerUpdateDelta = clock.getDelta();
        if (characterControls) {
          characterControls.update(mixerUpdateDelta, keysPressed);
        }
        requestAnimationFrame(animate);
      };

      animate();

    },
    // レンダー フレーム中に呼び出され、レイヤが GL コンテキストに描画できるようにします
    render: function (_gl, matrix) {
      // マップにマッピングしたときの座標を求める
      const rotateX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), modelTransform.rotateX);
      const rotateY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), modelTransform.rotateY);
      const rotateZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), modelTransform.rotateZ);
      const m = new THREE.Matrix4().fromArray(matrix);
      const l = new THREE.Matrix4()
        .makeTranslation(modelTransform.translateX, modelTransform.translateY, modelTransform.translateZ || 0)
        .scale(new THREE.Vector3(modelTransform.scale, -modelTransform.scale, modelTransform.scale))
        .multiply(rotateX)
        .multiply(rotateY)
        .multiply(rotateZ);

      camera.projectionMatrix.elements = matrix;
      camera.projectionMatrix = m.multiply(l);


      renderer.resetState();
      renderer.render(scene, camera);
      layermap.triggerRepaint();
    }
  };
}

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
