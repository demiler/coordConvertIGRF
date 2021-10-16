import { html, LitElement } from 'lit';
import style from '../css/tle-to-geo.css';
import './togbtn.mjs';
import './text-input.mjs';

class TleToGeo extends LitElement {
  static get styles() {
    return [ style ];
  }

  render() {
    return html`
      <div id='inputs'>
        <label>TLE:</label>
        <text-input id="tle"></text-input>

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

      <div id="filters">
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

      <button id="conv-btn">Convert to</button>
    `;
  }
};

customElements.define('tle-to-geo', TleToGeo);
