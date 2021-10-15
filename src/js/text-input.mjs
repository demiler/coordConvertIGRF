import { html, LitElement } from 'lit';
import style from '../css/text-input.css';

class TextInput extends LitElement {
  static get styles() {
    return [ style ];
  }

  static get properties() {
    return {
      value: { type: String },
    };
  }

  render() {
    return html`
      <input type="text" .value=${this.value} spellcheck="false">
    `;
  }
};

customElements.define('text-input', TextInput);
