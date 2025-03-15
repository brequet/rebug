import { mount } from 'svelte';
import Popup from '../popup/Popup.svelte';
import Screenshot from '../screenshot/Screenshot.svelte';
import Dev from './Dev.svelte';
import '../app.css';

const urlParams = new URLSearchParams(window.location.search);
const component = urlParams.get('component');

let app;

const target = document.getElementById('app');
if (!target) {
	throw new Error('Could not find app container');
}

if (component === 'popup') {
	mount(Popup, { target });
} else if (component === 'screenshot') {
	mount(Screenshot, { target });
} else {
	mount(Dev, { target });
}

export default app;
