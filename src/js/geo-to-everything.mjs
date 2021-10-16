import { html, LitElement } from 'lit';
import {unsafeSVG} from 'lit/directives/unsafe-svg.js';
import style from '../css/geo-to-everything.css';
import './filters-all.mjs';
import './time-picker.mjs';
import './date-picker.mjs';
import './text-input.mjs';
import geoIco from '../../assets/geo_icon.svg';
import geodIco from '../../assets/geod_icon.svg';

class GeoToEverything extends LitElement {
  static get styles() {
    return [ style ];
  }

  static get properties() {
    return {
      coord: { type: Object },
      geod: { type: Boolean },
      date: { type: Object },
      time: { type: Object },
      filters: { type: Object },
    };
  }

  constructor() {
    super();
    this.filters = {};
    this.coord = { x: 0, y: 0, z: 0};
    this.geod = false;
    this.date = '';
    this.time = '';
  }

  render() {
    return html`
      <div id='inputs'>
        <label id='geo'>${this.geod ? 'GEOD' : 'GEO'}:</label>
        <span id="coord-input" @input=${this.updateCoord}>
          <label>${this.geod ? 'Lat' : 'X'}</label>
          <label>${this.geod ? 'Lon' : 'Y'}</label>
          <label>${this.geod ? 'Alt' : 'Z'}</label>

          <text-input id="x" type="number" value=${this.coord.x}></text-input>
          <text-input id="y" type="number" value=${this.coord.y}></text-input>
          <text-input id="z" type="number" value=${this.coord.z}></text-input>
        </span>

        <label>Date:</label>
        <date-picker @update=${this.updateDate}
          value=${this.date}
        ></date-picker>

        <div id="switch" @click=${this.switchGeod}>
          ${unsafeSVG(geoIco)}

          <div id="track" ?active=${this.geod}>
            <div id="ball"></div>
          </div>

          ${unsafeSVG(geodIco)}
        </div>


        <label>Time:</label>
        <time-picker @update=${this.updateTime}
          value=${this.time}
        ></time-picker>

        <button @click=${this.sendUpdate}>Convert to</button>
      </div>


      <filters-all id="filters" @update=${this.updateFilters}></filters-all>
    `;
  }

  sendUpdate() {
    this.dispatchEvent(new CustomEvent('convert', {
      detail: this.getData(),
      bubbles: true,
      composed: true
    }));
    console.log('hi');
  }

  switchGeod() {
    this.geod = !this.geod;
  }

  updateFilters(e) {
    this.filters = e.detail;
  }

  updateCoord(e) {
    this.coord[e.target.id] = Number(e.target.value);
  }

  updateTime(e) {
    this.time = e.detail.string;
  }

  updateDate(e) {
    this.date = e.detail;
  }

  getData() {
    return {
      coord: this.coord,
      geod : this.geod,
      time : this.time,
      date : this.date,
      filters: this.filters
    }
  }
};

customElements.define('geo-to-everything', GeoToEverything);
