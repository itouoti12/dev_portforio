<script lang="ts">
  import { createEventDispatcher, getContext, afterUpdate, onMount } from 'svelte';
  import { mapbox, key } from './mapbox';

  const { getMap }: { getMap: () => mapbox.Map } = getContext(key);

  const dispatch = createEventDispatcher();
  const map = getMap();

  export let lat: number;
  export let lon: number;
  export let label: string;
  export let color = '#3FB1CE';

  const popup = new mapbox.Popup({
    anchor: 'bottom',
    offset: [0, -40],
    closeButton: false,
    closeOnClick: false,
  }).setText(label);

  const marker = new mapbox.Marker({ color, draggable: true }).setLngLat([lon, lat]).setPopup(popup).addTo(map);
  marker.getElement().addEventListener('mouseover', () => {
    marker.togglePopup();
  });
  marker.getElement().addEventListener('mouseout', () => {
    marker.togglePopup();
  });
  marker.on('dragend', (e: any) => {
    const position: { lat: number; lng: number } = e.target._lngLat;
    dispatch('onDragend', position);
  });

  let labelForCompare: string;
  onMount(() => {
    labelForCompare = label;
  });

  afterUpdate(() => {
    if (labelForCompare !== label) {
      popup.setText(label);
      labelForCompare = label;
    }

    if (-90 >= lat || lat >= 90) {
      console.log('緯度は-90から90の範囲')
      return;
    } 
    if (-180 >= lon || lon >= 180) {
      console.log('経度は-180から180の範囲')
      return;
    } 
    marker.setLngLat([lon, lat]);
  });
</script>
