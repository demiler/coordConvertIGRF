import { html, LitElement } from 'lit';
import style from '../css/tle-to-geo.css';
import './togbtn.mjs';
import './text-input.mjs';

class TleToGeo extends LitElement {
  static get styles() {
    return [ style ];
  }

  static get properties() {
    return {
      tle: { type: Array },
      date: { type: Array },
      time: { type: Array },
      filters: { type: Object },
    }
  }

  constructor() {
    super();
    this.tle = [];
    this.date = [];
    this.time = [];
    this.filters = {};
  }

  render() {
    return html`
      <div id='inputs' @update=${this.updateInputs}>
        <label>TLE:</label>
        <text-input id="tle"></text-input>

        <span></span>
        <span class='range-label'>From</span>
        <span class='range-label'>To</span>

        <label>Date:</label>
        <date-picker id="dateFrom" value=${this.date[0]}></date-picker>
        <date-picker id="dateTo"   value=${this.date[1]}></date-picker>

        <label>Time:</label>
        <time-picker id="timeFrom" value=${this.time[0]}></time-picker>
        <time-picker id="timeTo"   value=${this.time[1]}></time-picker>
      </div>

      <div id="filters" @update=${this.updateFilters}>
        <tog-btn id="time">Time</tog-btn>
        <tog-btn id="tle" >TLE</tog-btn>
        <tog-btn id="date">Date</tog-btn>

        <tog-btn id="geoX">geoX</tog-btn>
        <tog-btn id="geoY">geoY</tog-btn>
        <tog-btn id="geoZ">geoZ</tog-btn>

        <tog-btn id="lat">Lat</tog-btn>
        <tog-btn id="lon">Lon</tog-btn>
        <tog-btn id="alt">Alt</tog-btn>
      </div>

      <button id="conv-btn" @click=${this.sendUpdate}>Convert to</button>
    `;
  }

  sendUpdate() {
    this.dispatchEvent(new CustomEvent('convert', {
      detail: this.getData(),
      bubbles: true,
      composed: true
    }));
  }


  updateFilters(e) {
    this.filters[e.target.id] = e.value;
  }

  updateInputs(e) {
    const tar = e.target;
    const val = (tar.id === 'tle' ? tar.value : e.detail);

    switch (tar.id) {
      case 'tle':      this.tle = [ val ]; break;
      case 'dateFrom': this.date[0] = val; break;
      case 'dateTo':   this.date[1] = val; break;
      case 'timeFrom': this.time[0] = val; break;
      case 'timeTo':   this.time[1] = val; break;
      case 'filters':  this.filters = val; break;
    }
  }

  getData() {
    return {
      tle:     this.tle,
      date:    this.date,
      time:    this.time,
      filters: this.filters,
    }
  }
};

customElements.define('tle-to-geo', TleToGeo);
