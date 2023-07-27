import mapbox from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapbox.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const key = Symbol();
const mapstyle = 'mapbox://styles/mapbox/streets-v9';

export { mapbox, key, mapstyle };
