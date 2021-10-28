import { html, LitElement } from 'lit';
import style from '../css/norad-to-geo.css';
import './togbtn.mjs';
import './norad-input.mjs';

class NoradToGeo extends LitElement {
  static get styles() {
    return [ style ];
  }

  static get properties() {
    return {
      norad: { type: Array },
      date: { type: Array },
      time: { type: Array },
      filters: { type: Object },
    }
  }

  constructor() {
    super();
    this.norad = [];
    this.date = [];
    this.time = [];
    this.filters = {};
  }

  render() {
    return html`
      <norad-input id="inputs" @update=${this.updateInputs}
      ></norad-input>

      <div id="filters" @update=${this.updateFilters}>
        <tog-btn id="time">Time</tog-btn>
        <tog-btn id="norad" >Norad ID</tog-btn>
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
    const val = (tar.id === 'norad' ? tar.value : e.detail);

    switch (tar.id) {
      case 'norad':    this.norad = [ val ]; break;
      case 'dateFrom': this.date[0] = val; break;
      case 'dateTo':   this.date[1] = val; break;
      case 'timeFrom': this.time[0] = val; break;
      case 'timeTo':   this.time[1] = val; break;
      case 'filters':  this.filters = val; break;
    }
  }

  getData() {
    return {
      norad:     this.norad,
      date:    this.date,
      time:    this.time,
      filters: this.filters,
    }
  }
};

customElements.define('norad-to-geo', NoradToGeo);
