import { html, LitElement } from 'lit';
import style from '../css/coord-conv.css';
import './tle-to-everything.mjs';

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
      <tle-to-everything>
      </tle-to-everything>
    `;
  }
};

customElements.define('coord-conv', CoordConv);
