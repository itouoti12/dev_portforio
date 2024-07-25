import mapbox from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapbox.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const key = Symbol();
const mapstyle = 'mapbox://styles/itouoti12/clyzksvr500ds01r7a7s9ax3i';

export { mapbox, key, mapstyle };
