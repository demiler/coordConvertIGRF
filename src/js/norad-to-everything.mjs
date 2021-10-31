import { html, LitElement } from 'lit';
import style from '../css/norad-to-everything.css';
import './filters-all.mjs';
import './norad-input.mjs';

class NoradToEverything extends LitElement {
  static get styles() {
    return [ style ];
  }

  constructor() {
    super();
    this.filters = [];
    this.inputs  = {};
  }

  firstUpdated() {
    this.inputs = this.shadowRoot.querySelector("#inputs").getData();
  }

  render() {
    return html`
      <div class='group-label'></div>
      <div class='group-label'>Filters</div>

      <norad-input id="inputs" @update=${this.updateInputs}
      ></norad-input>

      <filters-all id="filters" @update=${this.updateInputs}
      ></filters-all>

      <button @click=${this.sendUpdate} id="conv-btn">Convert to</button>
    `;
  }

  updateInputs(e) {
    this[e.currentTarget.id] = e.detail
  }

  checkForBlank() {
    const { date, time } = this.inputs;
    console.log(this.inputs, date, time);
    if (this.inputs.norad === null) return 'no norad id entered';
    if (date[0] === '' && time[0] !== '') return 'from time entered but not date';
    if (date[0] !== '' && time[0] === '') return 'from date entered but not time';
    if (date[1] === '' && time[1] !== '') return 'to time entered but not date';
    if (date[1] !== '' && time[1] === '') return 'to date entered but not time';
    if (this.filters.length === 0) return 'no filters choosen';

    return null;
  }

  sendUpdate() {
    const err = this.checkForBlank();
    if (err !== null) return this.sendError(err);

    this.dispatchEvent(new CustomEvent('convert', {
      detail: this.getData(),
      bubbles: true,
      composed: true
    }));
  }

  sendError(err) {
    this.dispatchEvent(new CustomEvent('error', {
      detail: err,
      bubbles: true,
      composed: true
    }));
  }

  getData() {
    return {
      ...this.inputs,
      filters: this.filters,
    }
  }
};

customElements.define('norad-to-everything', NoradToEverything);
