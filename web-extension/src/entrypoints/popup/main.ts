import { mount } from 'svelte';
import Popup from './Popup.svelte';
import './popup.css';


const popup = mount(Popup, {
  target: document.getElementById('app')!,
});

export default popup;
