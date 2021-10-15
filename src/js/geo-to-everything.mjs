import { html, LitElement } from 'lit';
import {unsafeSVG} from 'lit/directives/unsafe-svg.js';
import style from '../css/geo-to-everything.css';
import './filters-all.mjs';
import './time-picker.mjs';
import './date-picker.mjs';
import geoIco from '../../assets/geo_icon.svg';
import geodIco from '../../assets/geod_icon.svg';

class GeoToEverything extends LitElement {
  static get styles() {
    return [ style ];
  }

  static get properties() {
    return {
    };
  }

  render() {
    return html`
      <div id='inputs'>
        <label id='geo'>GEO:</label>
        <span id="coord-input">
          <label>${this.geod ? 'Lat' : 'X'}</label>
          <label>${this.geod ? 'Lon' : 'Y'}</label>
          <label>${this.geod ? 'Alt' : 'Z'}</label>

          <input id="x" type="number" autocomplete="off">
          <input id="y" type="number" autocomplete="off">
          <input id="z" type="number" autocomplete="off">
        </span>

        <label>Date:</label>
        <date-picker></date-picker>

        <div id="switch" @click=${() =>{this.geod = !this.geod; this.requestUpdate()}}>
          ${unsafeSVG(geoIco)}
          
          <div id="track" ?active=${this.geod}>
            <div id="ball"></div>
          </div>

          ${unsafeSVG(geodIco)}
        </div>


        <label>Time:</label>
        <time-picker></time-picker>

        <button>convert to</button>
      </div>


      <filters-all id="filters"></filters-all>
    `;
  }
};

customElements.define('geo-to-everything', GeoToEverything);
