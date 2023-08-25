import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { A, D, DIRECTIONS, S, W } from './utils';
import type { ModelTransformProps } from '../map/GltfModelLayer';
import { calcDirection } from './function';
import mapboxgl from 'mapbox-gl';
export class CharacterControlsOnMapbox {
  model: THREE.Group;
  mixer: THREE.AnimationMixer;
  animationsMap: Map<string, THREE.AnimationAction> = new Map(); // Walk, Run, Idle
  camera: THREE.Camera;

  // STATE
  toggleRun = true;
  currentAction: string;

  // TEMPORARY DATA
  walkDirection = new THREE.Vector3();
  rotateAngle = new THREE.Vector3(0, 1, 0);
  rotateQuarternion: THREE.Quaternion = new THREE.Quaternion();
  cameraTarget = new THREE.Vector3();

  // CONSTANTS
  fadeDuration = 0.2;
  runVelocity = 5;
  walkVelocity = 2;

  // MAPBOX POSITION
  modelTransform: ModelTransformProps;
  bearing: number;
  map: mapboxgl.Map;
  isTrackingModel: boolean;
  movingOffset: number;
  modelLocation: { origin: mapboxgl.LngLatLike; attidude: number; };

  constructor(
    model: THREE.Group,
    mixer: THREE.AnimationMixer,
    animationsMap: Map<string, THREE.AnimationAction>,
    camera: THREE.Camera,
    currentAction: string,
    modelTransform: ModelTransformProps,
    bearing: number,
    map: mapboxgl.Map,
    modelLocation: {
      origin: mapboxgl.LngLatLike;
      attidude: number;
    },
    movingOffset: number,
    isTrackingModel?: boolean
  ) {
    this.model = model;
    this.mixer = mixer;
    this.animationsMap = animationsMap;
    this.currentAction = currentAction;
    this.animationsMap.forEach((val, key) => {
      if (key === currentAction) {
        val.play();
      }
    });
    this.camera = camera;
    this.modelTransform = modelTransform;
    this.bearing = bearing;
    this.map = map;
    this.isTrackingModel = isTrackingModel ?? false;
    this.movingOffset = movingOffset;
    this.modelLocation = modelLocation;
  }

  public switchRunToggle() {
    this.toggleRun = !this.toggleRun;
  }

  public update(delta: number, keysPressed: any) {
    const directionPressed = DIRECTIONS.some((key) => keysPressed[key] == true);

    let play = '';
    if (directionPressed && this.toggleRun) {
      play = 'Run';
    } else if (directionPressed) {
      play = 'Walk';
    } else {
      play = 'Idle';
    }

    if (this.currentAction !== play) {
      const toPlay = this.animationsMap.get(play);
      const current = this.animationsMap.get(this.currentAction);

      current?.fadeOut(this.fadeDuration);
      toPlay?.reset().fadeIn(this.fadeDuration).play();

      this.currentAction = play;
    }

    this.mixer.update(delta);

    if (this.currentAction === 'Run' || this.currentAction === 'Walk') {
      const directionOffset = this.directionOffset(keysPressed);
      const addBearingDirectionOffset = calcDirection(directionOffset, this.bearing);
      // rotate model
      this.rotateQuarternion.setFromAxisAngle(
        this.rotateAngle, // NOTE: y軸をベースに回転
        addBearingDirectionOffset // 回転角
      );

      this.model.quaternion.rotateTowards(this.rotateQuarternion, 1);
      // calculate direction
      this.camera.getWorldDirection(this.walkDirection);
      this.walkDirection.y = 0;
      this.walkDirection.normalize();

      this.walkDirection.applyAxisAngle(this.rotateAngle, addBearingDirectionOffset);

      // run/walk velocity
      const velocity = this.currentAction === 'Run' ? this.runVelocity : this.walkVelocity;
      // move model & camera
      const distance = velocity * delta;

      const moveX = this.walkDirection.x * distance;
      const moveZ = this.walkDirection.z * distance;

      this.model.position.x += moveX;
      this.model.position.z += moveZ;

      this.modelTransform.translateX += moveX * this.movingOffset;
      this.modelTransform.translateY += moveZ * this.movingOffset;

      // NOTE: 更新後の位置から地図上の座標と高さを求める 高さはモデルに反映する
      const mercatorCoordinate = new mapboxgl.MercatorCoordinate(
        this.modelTransform.translateX,
        this.modelTransform.translateY,
        this.map.getZoom()
      );
      const lngLat = mercatorCoordinate.toLngLat();
      const elevation = this.map.queryTerrainElevation(lngLat, { exaggerated: false }) || 0;
      const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(lngLat, elevation);
      this.model.position.y = modelAsMercatorCoordinate.z || 0;
      this.modelTransform.translateZ = modelAsMercatorCoordinate.z;
      this.modelLocation.origin = lngLat;
      this.modelLocation.attidude = elevation;

      // NOTE: 視点更新
      this.updateCameraTarget(moveX, moveZ, lngLat);
    }
  }

  public updateCameraRotation(bearing: number) {
    this.bearing = bearing;
  }
  public changeTracking(isTrack: boolean) {
    this.isTrackingModel = isTrack;
  }

  private updateCameraTarget(moveX: number, moveZ: number, lngLat: mapboxgl.LngLat) {
    // move camera
    this.camera.position.x += moveX;
    this.camera.position.z += moveZ;
    // update camera target
    this.cameraTarget.x = this.model.position.x;
    this.cameraTarget.y = this.model.position.y + 1;
    this.cameraTarget.z = this.model.position.z;

    // const originPosition = this.map.getCenter();

    if (this.isTrackingModel) {
      // const mercatorCoordinate = new mapboxgl.MercatorCoordinate(
      //   this.modelTransform.translateX,
      //   this.modelTransform.translateY,
      //   this.map.getZoom()
      // );
      // const lngLat = mercatorCoordinate.toLngLat();
      // const elevation = Math.floor(this.map.queryTerrainElevation(lngLat,{exaggerated:false}) || 0);
      // console.log(elevation)

      if (-180 <= lngLat.lng && lngLat.lng <= 180 && -90 <= lngLat.lat && lngLat.lat <= 90) {
        // NOTE:移動後の 経度と緯度の座標
        if (!this.map.isMoving()) {
          this.map.panTo(lngLat, {
            duration: 100,
            animate: false
          });
        }
      }
    }
  }

  private directionOffset(keysPressed: any) {
    let directionOffset = 0; // w

    if (keysPressed[W]) {
      if (keysPressed[A]) {
        directionOffset = Math.PI / 4; // w+a
      } else if (keysPressed[D]) {
        directionOffset = -Math.PI / 4; // w+d
      }
    } else if (keysPressed[S]) {
      if (keysPressed[A]) {
        directionOffset = Math.PI / 4 + Math.PI / 2; // s+a
      } else if (keysPressed[D]) {
        directionOffset = -Math.PI / 4 - Math.PI / 2; // s+d
      } else {
        directionOffset = Math.PI; // s
      }
    } else if (keysPressed[A]) {
      directionOffset = Math.PI / 2; // a
    } else if (keysPressed[D]) {
      directionOffset = -Math.PI / 2; // d
    }

    return directionOffset;
  }
}
