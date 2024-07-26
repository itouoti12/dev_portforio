export function initState() {
  return {
    lat: 0,
    lng: 0,
    elevation: 0,
    direction: 0,
    timestamp: 0,
    moving: false,
    isRunning: false,
    color: '#000000',
    id: '',
    name: ''
  };
}

export function initOtherState(id: string, color?: string) {
  const initial = initState();
  initial.id = id;
  if (!color) return initial;

  initial.color = color;
  return initial;
}

// NOTE: otherModelInformation
export interface ModelProps {
  lat: number;
  lng: number;
  elevation: number;
  direction: number;
  timestamp: number;
  moving: boolean;
  isRunning: boolean;
  color: string;
  id: string;
  model?: string;
  modelType?:'vrm'|'gltf';
}

export interface SendLatLngProps {
  name:string;
  lat: number;
  lng: number;
  elevation: number;
  direction: number;
  timestamp: number;
  moving: boolean;
  isRunning: boolean;
}
export interface SendModelProps {
  name:string;
  model:ArrayBuffer;
  modelType:'vrm'|'gltf';
}

export function exchangeBlobToUrl(model:ArrayBuffer){
  const blob = new Blob([model], { type: 'application/octet-stream' });
  return URL.createObjectURL(blob);
}

export function generateRandomColor() {
  return '#' + [0, 1, 2, 3, 4, 5].map((_) => Math.floor(Math.random() * 0x10).toString(16)).join('');
}

