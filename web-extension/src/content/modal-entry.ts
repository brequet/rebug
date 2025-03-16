// modal-entry.ts - Build this as a separate bundle with all dependencies included
(() => {
    // Define your modal as a web component
    class ScreenshotModal extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
        }

        connectedCallback() {
            // Create your modal UI here
            this.render();
        }

        render() {
            // Render your modal content
        }
    }

    // Register the component
    customElements.define('screenshot-modal', ScreenshotModal);

    console.log('modal-entry.ts loaded');
    window.addEventListener('message', (event) => {
        // Verify the message is from your extension
        if (event.data && event.data.type === 'SHOW_SCREENSHOT_MODAL') {
            const modal = document.createElement('screenshot-modal');
            // Set properties based on event.data
            modal.setAttribute('screenshot-url', event.data.screenshotUrl);
            document.body.appendChild(modal);

            // Optionally send a response
            window.postMessage({ type: 'MODAL_CREATED' }, '*');
        }
    });

    console.log('Modal script loaded and listening for messages');

})();
