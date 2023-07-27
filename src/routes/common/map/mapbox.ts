import mapbox from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapbox.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const key = Symbol();
const mapstyle = 'mapbox://styles/itouoti12/clkkx56je006p01pmg4d3fc5z';

export { mapbox, key, mapstyle };
