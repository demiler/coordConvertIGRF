import { html, LitElement } from 'lit';
import style from '../css/coord-conv.css';
import './multibtn.mjs';

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
      <h1>Hello</h1>
      <div id="filters">
        <div id="single" @update=${({target, value}) => console.log(target.id, value)}>
          <tog-btn id="date"  >Date</tog-btn>
          <tog-btn id="shadow">Shad</tog-btn>
          <tog-btn id="lb"    >LB</tog-btn>
          <tog-btn id="mlt"   >MLT</tog-btn>
          <tog-btn id="time"  >Time</tog-btn>
          <tog-btn id="tle"   >TLE</tog-btn>
        </div>

        <div id="multi">
          <multi-btn .labels=${["X","Y","Z"]}      >GSM</multi-btn>
          <multi-btn .labels=${["Lat","Lon","Alt"]}>DM</multi-btn>
          <multi-btn .labels=${["X","Y","Z"]}      >GEO</multi-btn>
          <multi-btn .labels=${["X","Y","Z", "F"]} >Intensivity</multi-btn>
        </div>
      </div>
    `;
  }
};

customElements.define('coord-conv', CoordConv);
