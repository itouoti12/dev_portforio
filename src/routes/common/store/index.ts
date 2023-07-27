import { writable } from 'svelte/store';

export const isDarkmode = writable(false);

export const storemap = writable<mapboxgl.Map | null>(null);
