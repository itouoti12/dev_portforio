import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import type { mapbox } from './mapbox';
import mapboxgl from 'mapbox-gl';
import { CharacterControlsOnMapbox, type modelPositionProps } from '../three/characterControlsOnMapbox';
import { calcDirection } from '../three/function';
import { DIRECTIONS, W } from '../three/utils';
import type { Position } from 'geojson';
import * as turf from '@turf/turf';

export const SEND_PER_DURATION = 500;

interface ConstructorProps {
  url: string;
  movingOffset: number;
  origin: mapbox.LngLatLike;
  altitude: number;
  id: string;
  scale: number;
  bearing: number;
  isTrackingModel?: boolean;
  isMe:boolean;
  onLoad?: () => void;
  updateModelPositionOnMap?: ({ lngLat, directionOnMap, elevation, isTracking,isRun }: modelPositionProps) => void;
  onStopMove?:()=>void;
  color?:string;
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

export interface CustomLayer {
  updateLngLat?: ({ lngLat, altitude, deg }: { lngLat: mapboxgl.LngLatLike; altitude: number; deg: number }) => void;
  autoWakingChange?: (isAutoWalk: boolean) => void;
  trackingChange?: (isTracking: boolean) => void;
  walkMotionChange?: (isRun: boolean) => void;
  getModelLocation?: () => {
    origin: mapbox.LngLatLike;
    attidude: number;
  };
}
const modelRotate = [Math.PI / 2, 0, 0];

export function gltfModelLayer(props: ConstructorProps): mapbox.AnyLayer & CustomLayer {
  let camera: THREE.Camera;
  let scene: THREE.Scene;
  let layermap: mapboxgl.Map;
  let renderer: THREE.WebGLRenderer;
  let modelTransform: ModelTransformProps;
  const modelLocation = {
    origin: props.origin,
    attidude: props.altitude
  };
  let characterControls: CharacterControlsOnMapbox;
  let isAutoWalk = false;
  const bearing = props.bearing;
  const keysPressed: { [key: string]: any } = {};

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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
        const loadModel = gltf.scene;
        loadModel.traverse(function (object: any) {
          if(object.isMesh){
            object.castShadow = true;
            if(props.color && object.material.name === "Vanguard_VisorMat"){
              const material = new THREE.MeshBasicMaterial({color:props.color});
              object.material = material;
            } 
            object.material.needsUpdate = true;
          }
        });

        loadModel.scale.set(props.scale, props.scale, props.scale);
        scene.add(loadModel);

        const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
        const mixer = new THREE.AnimationMixer(loadModel);
        const animationsMap: Map<string, THREE.AnimationAction> = new Map();
        gltfAnimations
          .filter((animation) => animation.name != 'TPose')
          .forEach((animation) => {
            animationsMap.set(animation.name, mixer.clipAction(animation));
          });

        // NOTE: 初期描画時のviewから rotate model
        const addBearingDirectionOffset = calcDirection(0, bearing);
        const rotateQuarternion = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0), // NOTE: y軸をベースに回転
          addBearingDirectionOffset // 回転角
        );
        loadModel.quaternion.rotateTowards(rotateQuarternion, 1);

        characterControls = new CharacterControlsOnMapbox(
          loadModel,
          mixer,
          animationsMap,
          camera,
          'Idle',
          modelTransform,
          bearing,
          layermap,
          modelLocation,
          props.movingOffset,
          !props.isMe,
          props.isTrackingModel,
          props.updateModelPositionOnMap?props.updateModelPositionOnMap:undefined,
        );
      });

      // CONTROL KEYS
      let manualControlling = false;
      if(props.isMe){
        document.addEventListener(
          'keydown',
          (event) => {
            if (isAutoWalk && !manualControlling) {
              Object.keys(keysPressed).forEach((key) => (keysPressed[key] = false));
            }

            if (event.shiftKey && characterControls) {
              characterControls.switchRunToggle();
            } else {
              manualControlling = true;
              keysPressed[event.key.toLowerCase()] = true;
            }
          },
          false
        );

        document.addEventListener(
          'keyup',
          (event) => {
            keysPressed[event.key.toLowerCase()] = false;
            if (DIRECTIONS.every((key) => keysPressed[key] === false || keysPressed[key] === undefined)) {
              if(manualControlling){
                manualControlling = false;
              }
              if(!isAutoWalk){
                if(props.onStopMove)props.onStopMove();
              }
            }
          },
          false
        );
      }

      layermap = map;

      // RENDERER
      // threeJsで描画したオブジェクトをmapboxにマッピングする
      renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true
      });
      //NOTE: これ入れるとmapboxのりサイズに追従できない renderer.shadowMap.enabled = true;
      renderer.autoClear = false;

      if(props.isMe){
        // MAP rotate
        map.on('rotate', function () {
          const bearing = map.getBearing();
          if (characterControls) {
            characterControls.updateCameraRotation(bearing);
          }
        });
      }

      // ANIMATE
      const clock = new THREE.Clock();
      function animate() {
        if (isAutoWalk && !manualControlling && (keysPressed[W] === undefined || keysPressed[W] === false)) {
          keysPressed[W] = true;
        }
        if (!isAutoWalk && !manualControlling) {
          keysPressed[W] = undefined;
        }

        const mixerUpdateDelta = clock.getDelta();
        if (characterControls) {
          characterControls.update(mixerUpdateDelta, keysPressed);
        }
        requestAnimationFrame(animate);
      }

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
    },
    autoWakingChange: function (autoWalk: boolean) {
      isAutoWalk = autoWalk;
    },
    trackingChange: function (isTracking: boolean) {
      if (characterControls) {
        characterControls.changeTracking(isTracking);
      }
    },
    getModelLocation: function () {
      return modelLocation;
    },
    walkMotionChange: function(isRun: boolean){
      if (characterControls) {
        characterControls.switchRunToggle(isRun);
      }

    },
    updateLngLat: function ({ lngLat, altitude, deg }: { lngLat: mapbox.LngLatLike; altitude: number; deg: number }) {
      // NOTE: 与えられた情報を元に更新

      if(characterControls){
        characterControls.changeDirection(deg);
      }

      const updateMercator = mapboxgl.MercatorCoordinate.fromLngLat(lngLat);

      const moveStartPoint:Position = [modelTransform.translateX,modelTransform.translateY];
      const moveEndPoint:Position = [updateMercator.x,updateMercator.y];

      const path = turf.lineString([moveStartPoint,moveEndPoint]);
      const pathDistance = turf.lineDistance(path);
      let start = 0;
      function frame(time:number){
        if(!start)start = time;
        const animationPhase = (time - start) / SEND_PER_DURATION;
        if(animationPhase > 1){
          return;
        }
        const alongPath = turf.along(path,pathDistance * animationPhase).geometry.coordinates;
        modelTransform.translateX = alongPath[0];
        modelTransform.translateY = alongPath[1];

        const mercatorCoordinate = new mapboxgl.MercatorCoordinate(
          modelTransform.translateX,
          modelTransform.translateY,
          layermap.getZoom()
        );
        const pointLngLat = mercatorCoordinate.toLngLat();
        const elevation = layermap.queryTerrainElevation(pointLngLat,{exaggerated:false}) || 0;
        const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(pointLngLat,elevation);
        modelTransform.translateZ = modelAsMercatorCoordinate.z;

        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);

      modelLocation.origin = lngLat;
      modelLocation.attidude = altitude;

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
