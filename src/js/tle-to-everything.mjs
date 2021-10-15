import { html, LitElement } from 'lit';
import style from '../css/tle-to-everything.css';
import './time-picker.mjs';
import './date-picker.mjs';
import './togbtn.mjs';
import './multibtn.mjs';

class TleToEverything extends LitElement {
  static get styles() {
    return [ style ];
  }

  static get properties() {
    return {
    };
  }

  render() {
    return html`

      <div class='group-label'></div>
      <div class='group-label'>Filters</div>

      <div id='inputs'>
        <label>TLE:</label>
        <input id="tle" type="text">

        <span></span>
        <span class='range-label'>From</span>
        <span class='range-label'>To</span>

        <label>Date:</label>
        <date-picker></date-picker>
        <date-picker></date-picker>

        <label>Time:</label>
        <time-picker></time-picker>
        <time-picker></time-picker>
      </div>

      <div id="filters" >
        <div id="single" @update=${({target, value}) => console.log(target.id, value)}>
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
      </div>
    `;
  }
};

customElements.define('tle-to-everything', TleToEverything);
