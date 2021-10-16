import { html, LitElement } from 'lit';
import style from '../css/tle-to-everything.css';
import './filters-all.mjs';
import './time-picker.mjs';
import './date-picker.mjs';
import './text-input.mjs';

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

      <filters-all
      ></filters-all>

      <button id="conv-btn">Convert to</button>
    `;
  }
};

customElements.define('tle-to-everything', TleToEverything);
