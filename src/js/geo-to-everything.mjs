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
      geod: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.filters = [];
    this.coord = { x: 0, y: 0, z: 0};
    this.geod = false;
    this.date = '';
    this.time = '';
  }

  render() {
    return html`
      <div id="file-upload">
        <label>format: "YYYY-MM-DD HH:MM:SS, XGEO, YGEO, ZGEO"</label>
        <input type="file">
      </div>

      <div class='group-label' id='coord-labels'>
          <label>${this.geod ? 'Lat' : 'X'}</label>
          <label>${this.geod ? 'Lon' : 'Y'}</label>
          <label>${this.geod ? 'Alt' : 'Z'}</label>
      </div>
      <div class='group-label' id="filters-label">Filters</div>

      <div id='inputs'>
        <label id='geo'>${this.geod ? 'GEOD' : 'GEO'}:</label>
        <span id="coord-input" @input=${this.updateCoord}>
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

        <button @click=${this.sendConvert}>Convert to</button>
      </div>


      <filters-all id="filters" @update=${this.updateFilters}></filters-all>
    `;
  }

  checkForBlank() {
    const coords = Object.values(this.coord);
    if (coords.some(c => c === null)) return 'incorrect coordinates';
    if (this.date === '') return 'no date entered';
    if (this.time === '') return 'no time entered';
    if (this.filters.length === 0) return 'no filters choosen';

    return null;
  }

  sendConvert() {
    const err = this.checkForBlank();
    if (err !== null) return this.sendError(err);

    this.dispatchEvent(new CustomEvent('convert', {
      detail: this.getData(),
      bubbles: true,
      composed: true
    }));
  }

  sendError(msg) {
    this.dispatchEvent(new CustomEvent('error', {
      detail: msg,
      bubbles: true,
      composed: true
    }));
  }

  switchGeod() {
    this.geod = !this.geod;
  }

  updateFilters(e) {
    this.filters = e.detail;
  }

  updateCoord(e) {
    this.coord[e.target.id] = (e.detail === '')
      ? null
      : Number(e.target.value);
    if (this.coord[e.target.id]) {
      e.target.value = this.coord[e.target.id]
    }
  }

  updateTime(e) {
    this.time = e.detail;
  }

  updateDate(e) {
    this.date = e.detail;
  }

  getData() {
    return {
      coord: Object.values(this.coord),
      geod : this.geod,
      time : this.time,
      date : this.date,
      filters: this.filters
    }
  }
};

customElements.define('geo-to-everything', GeoToEverything);
