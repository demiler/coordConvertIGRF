import { html, LitElement } from 'lit';
import style from '../css/tle-to-geo.css';

class TleToGeo extends LitElement {
  static get styles() {
    return [ style ];
  }

  render() {
    return html`hi`;
  }
};

customElements.define('tle-to-geo', TleToGeo);
