import '../app.css';
import { mount } from 'svelte';
import Screenshot from './Screenshot.svelte';

const target = document.getElementById('app');
if (!target) {
	throw new Error('Could not find app container');
}

mount(Screenshot, { target });
