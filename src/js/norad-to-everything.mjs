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
    this.filters = {};
    this.norad  = {};
  }

  render() {
    return html`
      <div class='group-label'></div>
      <div class='group-label'>Filters</div>

      <norad-input id="norad" @update=${this.updateInputs}
      ></norad-input>

      <filters-all id="filters" @update=${this.updateInputs}
      ></filters-all>

      <button @click=${this.sendUpdate} id="conv-btn">Convert to</button>
    `;
  }

  updateInputs(e) {
    this[e.target.id] = e.detail
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
      norad:   this.norad,
      filters: this.filters,
    }
  }
};

customElements.define('norad-to-everything', NoradToEverything);
