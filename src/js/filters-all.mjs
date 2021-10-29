import { html, LitElement } from 'lit';
import style from '../css/filters-all.css';
import './togbtn.mjs';
import './multibtn.mjs';

class FiltersAll extends LitElement {
  static get styles() {
    return [ style ];
  }

  constructor() {
    super();
    this.filters = new Set();
  }

  render() {
    return html`
      <div id="single" @update=${this.updateFilters}>
        <tog-btn id="shad">Shad</tog-btn>
        <tog-btn id="mlt"   >MLT</tog-btn>
        <tog-btn id="l"     >L</tog-btn>
        <tog-btn id="b"     >B</tog-btn>
      </div>

      <div id="multi" @update=${this.updateFilters}>
        <multi-btn id="gsm" .labels=${["X","Y","Z"]}      >GSM</multi-btn>
        <multi-btn id="dm"  .labels=${["Lat","Lon","Alt"]}>DM</multi-btn>
        <multi-btn id="geo" .labels=${["X","Y","Z"]}      >GEO</multi-btn>
        <multi-btn id="magn" .labels=${["X","Y","Z", "F"]}>Magnetic Field comp</multi-btn>
      </div>
    `;
  }

  updateFilters(e) {
    e.stopPropagation();
    const id = e.target.id;

    if (e.currentTarget.id === 'single') {
      if (e.value) this.filters.add(id);
      else this.filters.delete(id);
    }
    else {
      e.target.labels //delete old values
        .filter(label => !e.detail.includes(label))
        .map(l => `${id}.${l}`)
        .forEach(todel => this.filters.delete(todel));

      e.detail        //add new values
        .map(f => `${id}.${f}`)
        .forEach(toadd => this.filters.add(toadd));
    }

    this.dispatchEvent(new CustomEvent('update', {
      detail: Array.from(this.filters),
    }));
  }
};

customElements.define('filters-all', FiltersAll);
