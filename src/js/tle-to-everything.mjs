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
      filters: { type: Object },
      tle: { type: Array },
      date: { type: Array },
      time: { type: Array },
    };
  }

  constructor() {
    super();
    this.filters = {};
    this.tle  = [];
    this.date = [];
    this.time = [];
  }

  render() {
    return html`
      <div class='group-label'></div>
      <div class='group-label'>Filters</div>

      <div id='inputs' @update=${this.updateInputs}>
        <label>TLE:</label>
        <text-input id="tle" @input=${this.updateInputs}></text-input>

        <span></span>
        <span class='range-label'>From</span>
        <span class='range-label'>To</span>

        <label>Date:</label>
        <date-picker id="dateFrom" value=${this.date[0]}></date-picker>
        <date-picker id="dateTo"   value=${this.date[1]}></date-picker>

        <label>Time:</label>
        <time-picker id="timeFrom" value=${this.time[0]}></time-picker>
        <time-picker id="timeTo" value=${this.time[1]}></time-picker>
      </div>

      <filters-all id="filters" @update=${this.updateInputs}
      ></filters-all>

      <button @click=${this.sendUpdate} id="conv-btn">Convert to</button>
    `;
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

  sendUpdate() {
    this.dispatchEvent(new CustomEvent('convert', {
      detail: this.getData(),
      bubbles: true,
      composed: true
    }));
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

customElements.define('tle-to-everything', TleToEverything);
