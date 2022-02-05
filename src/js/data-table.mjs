import { html, LitElement } from 'lit-element';
import style from '../css/data-table.css';
import './togbtn.mjs';
import { Iterate } from './utils.mjs';

class DataTable extends LitElement {
  static get styles() {
    return [ style ];
  }

  static get properties() {
    return {
      table: { type: Object },
    };
  }

  constructor() {
    super();
    this.MAX_LINES = 100;
    ////////
    //REMOVE AFTER TESTING!!!!!
    const lsTable = localStorage.getItem('table');
    if (lsTable) {
      this.table = JSON.parse(lsTable);
      console.log('got table');
    }
    ////////
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.download.href) window.URL.revokeObjectURL(this.download.href);
  }

  firstUpdated() {
    this.download = this.shadowRoot.getElementById("download");
  }

  render() {
    if (this.table.length) this.removeAttribute('hidden');
    else this.setAttribute('hidden', '');

    return html`
      <div id="info-bar">
        <span id="table-size">
          Shown ${Math.min(this.MAX_LINES, this.table.length)}/${this.table.length} lines
        </span>
        <span id="size-warning" ?hidden=${this.table.length < this.MAX_LINES}>
          Warning: table is too large to be fully displayed
        </span>
        <button id="download-btn" @click=${this.downloadTable}>Download as file</button>
      </div>

      <table id="table">
        <tr class='header'>
          ${Object.keys(this.table).filter(th => th !== 'length').map(th => html`
            <th class="table-${th}">${th}</th>
          `)}
        </tr>
        ${Iterate(Math.min(this.MAX_LINES, this.table.length)).map(i => html`
          <tr>
            ${Object.entries(this.table).filter(cell => cell[0] !== 'length').map(cell => html`
              <td class="table-${cell[0]}">${(cell[1][i] !== null) ? cell[1][i] : 'NaN'}</td>
            `)}
          </tr>
        `)}
      </table>
      <a id="download" hidden download="table.csv"></a>
    `;
  }

  createCsv() {
    function* genLine(arrs, length) {
      for (let i = 0; i < length; i++)
        yield arrs.map(arr => arr[i]).join(',');
    }

    const length = this.table.length;
    delete this.table.length;

    const preCsv = [ Object.keys(this.table).join(',') ];
    const it = genLine(Object.values(this.table), length);

    this.table.length = length;
    for (let line = it.next(); !line.done; line = it.next()) {
      preCsv.push(line.value);
    }

    return preCsv.join('\n');
  }

  downloadTable() {
    const csv = this.createCsv();
    if (this.download.href) {
      window.URL.revokeObjectURL(this.download.href);
    }

    this.csvTable = new Blob([csv], { type: 'text/txt' });
    this.download.href = window.URL.createObjectURL(this.csvTable);
    this.download.click();
  }
};

customElements.define('data-table', DataTable);
