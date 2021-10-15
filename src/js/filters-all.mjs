import { html, LitElement } from 'lit';
import style from '../css/filters-all.css';
import './togbtn.mjs';
import './multibtn.mjs';

class FiltersAll extends LitElement {
  static get styles() {
    return [ style ];
  }

  static get properties() {
    return {
    };
  }

  render() {
    return html`
      <div id="single">
        <tog-btn id="date"  >Date</tog-btn>
        <tog-btn id="shadow">Shad</tog-btn>
        <tog-btn id="lb"    >LB</tog-btn>
        <tog-btn id="mlt"   >MLT</tog-btn>
        <tog-btn id="time"  >Time</tog-btn>
        <tog-btn id="tle"   >TLE</tog-btn>
      </div>

      <div id="multi">
        <multi-btn id="gsm" .labels=${["X","Y","Z"]}      >GSM</multi-btn>
        <multi-btn id="dm"  .labels=${["Lat","Lon","Alt"]}>DM</multi-btn>
        <multi-btn id="geo" .labels=${["X","Y","Z"]}      >GEO</multi-btn>
        <multi-btn id="int" .labels=${["X","Y","Z", "F"]} >Intensivity</multi-btn>
      </div>
    `;
  }
};

customElements.define('filters-all', FiltersAll);
