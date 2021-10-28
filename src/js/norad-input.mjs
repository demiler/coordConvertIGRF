import { html, LitElement } from 'lit';
import style from '../css/norad-input.css';

class NoradInput extends LitElement {
  static get styles() {
    return [ style ];
  }

  constructor() {
    super();
    this.norad = '';
    this.date = [];
    this.time = [];
  }

  render() {
    return html`
      <div id='inputs' @update=${this.updateInputs}>
        <label>Norad ID:</label>
        <text-input id="norad" @input=${this.updateInputs}></text-input>

        <span></span>
        <span class='range-label'>From (optional)</span>
        <span class='range-label'>To (optional)</span>

        <label>Date:</label>
        <date-picker id="dateFrom" value=${this.date[0]}></date-picker>
        <date-picker id="dateTo"   value=${this.date[1]}></date-picker>

        <label>Time:</label>
        <time-picker id="timeFrom" value=${this.time[0]}></time-picker>
        <time-picker id="timeTo" value=${this.time[1]}></time-picker>

        <label>Step (sec):</label>
        <text-input id="step" type="number"></text-input>
      </div>
    `;
  }

  updateInputs(e) {
    e.stopPropagation()
    const tar = e.target;
    const val = (tar.id === 'norad' ? tar.value : e.detail);

    switch (tar.id) {
      case 'norad':    this.norad = val; break;
      case 'dateFrom': this.date[0] = val; break;
      case 'dateTo':   this.date[1] = val; break;
      case 'timeFrom': this.time[0] = val; break;
      case 'timeTo':   this.time[1] = val; break;
    }

    this.dispatchEvent(new CustomEvent('update', {
      detail: this.getData(),
    }));
  }

  getData() {
    return {
      norad: this.norad,
      date: this.date,
      time: this.time,
    }
  }

};

customElements.define('norad-input', NoradInput);
