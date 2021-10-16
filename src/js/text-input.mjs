import { html, LitElement } from 'lit';
import style from '../css/text-input.css';

class TextInput extends LitElement {
  static get styles() {
    return [ style ];
  }

  static get properties() {
    return {
      value: { type: String, attribute: false },
    };
  }

  constructor() {
    super();
    this.value = '';
    this.el = undefined;
  }

  firstUpdated() {
    if (this.hasAttribute('value'))
      this.value = this.getAttribute('value');
  }

  render() {
    return html`
      <input id="input" type="text" spellcheck="false"
        .value=${this.value}
        @input=${this.handleInput}
        @change=${this.handleChange}
      >
      <slot></slot>
    `;
  }

  handleChange(e) {
    e.stopPropagation();
    this.value = e.target.value;
    this.dispatchEvent(new CustomEvent('change', { value: this.value }));
  }

  handleInput(e) {
    e.stopPropagation();
    this.value = e.target.value;
    this.dispatchEvent(new CustomEvent('input', { value: this.value }));
  }

};

customElements.define('text-input', TextInput);
