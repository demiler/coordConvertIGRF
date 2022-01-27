import { html, LitElement } from 'lit';
import style from '../css/togbtn.css';

class ToggleButton extends LitElement {
  static get styles() {
    return [ style ];
  }

  static get properties() {
    return {
      value: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.value = false;
  }

  render() {
    return html`
      <button
          id='button'
          ?active=${this.value}
          @click=${this.clicked}
      >
        <slot></slot>
      </button>
    `;
  }

  clicked(old) {
    this.value = !this.value;
    const e = new CustomEvent('update', old);
    e.value = this.value;
    this.dispatchEvent(e);
  }
};

customElements.define('tog-btn', ToggleButton);
