import { html, LitElement } from 'lit-element';
import { transition, slide } from 'lit-transition';
import style from '../css/coord-conv.css';
import './norad-to-everything.mjs';
import './geo-to-everything.mjs';
import './norad-to-geo.mjs';

class CoordConv extends LitElement {
  static get styles() {
    return [ style ];
  }

  static get properties() {
    return {
      tab: { type: String },
      showError: { type: Boolean },
      errorMessage: { type: String },
      table: { type: Object },
    };
  }

  constructor() {
    super();
    this.tab = localStorage.getItem('tab');
    if (this.tab === null) this.tab = 'nte';
    this.errorMessage = '';
    this.showError = false;
    this.table = {};
  }

  render() {
    return html`
      <main>
        <nav @click=${this.changeTab}>
          <button id="nte" ?current=${this.tab === "nte"}>Norad ID to everything</button>
          <button id="gte" ?current=${this.tab === "gte"}>GEO to everything</button>
          <!--<div id="ntg" ?current=${this.tab === "ntg"}>Norad ID to GEO</div>-->
        </nav>

        <div id="content" @convert=${this.askConvert} @error=${this.handleError}>
          ${this.renderTab()}
        </div>

        <div id="error" ?active=${this.showError}>
          Error: ${this.errorMessage}
        </div>
      </main>

      <table id="table">
        <tr class='header'>
          ${Object.keys(this.table).map(th => (th === 'length') ? html`` : html`
            <th class="table-${th}">${th}</th>
          `)}
        </tr>
        ${[...Array(this.table.length).keys()].map(i => html`
          <tr>
            ${Object.entries(this.table).map(cell => (cell[0] === 'length') ?html``:html`
            <td class="table-${cell[0]}">${(cell[1][i] !== null) ? cell[1][i] : 'NaN'}</td>
          `)}
          </tr>
        `)}
      </table>
    `;
  }

  renderTab() {
    switch (this.tab) {
      case 'nte':
        return html`<norad-to-everything></norad-to-everything>`;
      case 'gte':
        return html`<geo-to-everything></geo-to-everything>`;
      case 'ntg':
        return html`<norad-to-geo></norad-to-geo>`;
    }
  }

  handleError(e) {
    this.displayError(e.detail);
  }

  askConvert(e) {
    let fetchResponse = undefined;

    if (e.detail.file) {
      const data = new FormData();
      data.append('file', e.detail.file);
      data.append('geod', e.detail.geod);
      data.append('filters', JSON.stringify(e.detail.filters));

      fetchResponse = fetch(`${window.location.href}convert/file`, {
        method: 'POST',
        body: data
      });
    }
    else {
      const data = { ...e.detail, type: this.tab };

      if (data.type === 'nte') {
        const currDT = new Date().toISOString().replace(/\.\d+Z$/, '').split('T');
        if (!data.date[0]) data.date[0] = currDT[0];
        if (!data.date[1]) data.date[1] = currDT[0];
        if (!data.time[0]) data.time[0] = currDT[1];
        if (!data.time[1]) data.time[1] = currDT[1];
      }

      fetchResponse = fetch(`${window.location.href}convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data)
      });
    }

    fetchResponse.then(async res => {
      switch (res.status) {
        case 400:
        case 500:
          const err = await res.text();
          this.displayError(`Server error: ${err}`, 10000);
          break;

        case 200:
          this.table = await res.json();
          break;

        default:
          this.displayError(`Unknown server response status: ${res.status}`);
      };
    })
    .catch(err => {
      this.displayError('Internal error, unable to send data');
      console.log('some error', err);
    });
  }

  changeTab(e) {
    this.table = {};
    this.tab = e.target.id;
    localStorage.setItem('tab', this.tab);
  }

  displayError(error, delay=3000) {
    clearTimeout(this.toem);
    this.errorMessage = error;
    this.showError = true;
    this.toem = setTimeout(() => this.showError = false, delay);
  }
};

customElements.define('coord-conv', CoordConv);
