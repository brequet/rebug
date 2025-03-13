import '../app.css';
import { mount } from 'svelte';
import Popup from './Popup.svelte';

const target = document.getElementById('app');
if (!target) {
	throw new Error('Could not find app container');
}

mount(Popup, { target });
