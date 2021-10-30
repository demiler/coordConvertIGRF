import { html, LitElement } from 'lit';
import style from '../css/text-input.css';

class TextInput extends LitElement {
  static get styles() {
    return [ style ];
  }

  static get properties() {
    return {
      value: { type: String, attribute: false },
      type: { type: String },
    };
  }

  constructor() {
    super();
    this.type = 'text';
    this.value = '';
    this.placeholder = '';
    this.el = undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hasAttribute('value'))
      this.value = this.getAttribute('value');

    if (this.hasAttribute('placeholder'))
      this.placeholder = this.getAttribute('placeholder');
  }

  firstUpdated(chng) {
    this.inputEl = this.shadowRoot.getElementById("input");
  }

  render() {
    return html`
      <input id="input" type=${this.type} spellcheck="false"
        .placeholder=${this.placeholder}
        .value=${this.value}
        @input=${(e) => this.sendUpdate('input', e)}
        @change=${(e) => this.sendUpdate('change', e)}
      >
      <slot></slot>
    `;
  }

  sendUpdate(type, e) {
    e.stopPropagation();
    this.value = e.target.value;
    this.dispatchEvent(new CustomEvent(type, {
      detail: this.value,
      bubbles: true,
      composed: true
    }));
  }

  forceUpdate(value) {
    this.value = value;
    this.inputEl.value = value;
  }
};

customElements.define('text-input', TextInput);
