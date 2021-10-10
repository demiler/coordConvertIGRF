import { html, LitElement } from 'lit';
import style from '../css/coord-conv.css';

class CoordConv extends LitElement {
  static get styles() {
    return [ style ];
  }

  static get properties() {
    return {
    };
  }

  render() {
    return html`
      <h1>Hello</h1>
    `;
  }
};

customElements.define('coord-conv', CoordConv);
