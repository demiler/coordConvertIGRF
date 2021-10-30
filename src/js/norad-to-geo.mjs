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
    this.filters = new Set();
  }

  render() {
    return html`
      <norad-input id="inputs" @update=${this.updateInputs}
      ></norad-input>

      <div id="filters" @update=${this.updateFilters}>
        <tog-btn id="time">Time</tog-btn>
        <tog-btn id="norad" >Norad ID</tog-btn>
        <tog-btn id="date">Date</tog-btn>

        <tog-btn id="geo.X">geo.X</tog-btn>
        <tog-btn id="geo.Y">geo.Y</tog-btn>
        <tog-btn id="geo.Z">geo.Z</tog-btn>

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
    if (e.value) this.filters.add(e.target.id);
    else this.filters.delete(e.target.id);
  }

  updateInputs(e) {
    this.inputs = e.detail;
  }

  getData() {
    return {
      ...this.inputs,
      filters: Array.from(this.filters),
    }
  }
};

customElements.define('norad-to-geo', NoradToGeo);
