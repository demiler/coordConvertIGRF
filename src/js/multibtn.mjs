import { html, LitElement } from 'lit';
import style from '../css/multibtn.css';
import './togbtn.mjs';

class MultiButton extends LitElement {
  static get styles() {
    return [ style ];
  }

  static get properties() {
    return {
      labels: { type: Array, attribute: true },
      vals: { type: Array },
    };
  }

  constructor() {
    super();
    this.labels = []
    this.vals = []
  }

  render() {
    return html`
      <div id="main"
        @click=${this.updateMain}
        ?active=${this.vals.length}
      >
        <slot></slot>
        <div id="buttons">
          ${this.labels.map(label => html`
            <tog-btn
                class='button'
                .value=${this.vals.includes(label)}
                @update=${(e) => this.updateButton(e, label)}
            >
              ${label}
            </tog-btn>
          `)}
        </div>
      </div>
    `;
  }

  sendUpdate() {
    this.dispatchEvent(new CustomEvent('update', 
      { bubbles: true, detail: this.vals }
    ))
  }

  updateMain(e) {
    if (e.target.classList.contains('button')) return;

    if (this.vals.length === this.labels.length) this.vals = [];
    else this.vals = [...this.labels];

    this.sendUpdate();
  }

  addVal(label) {
    if (this.vals.includes(label)) return;
    this.vals.push(label);
  }

  delVal(label) {
    const ind = this.vals.indexOf(label);
    if (ind !== -1) this.vals.splice(ind, 1);
  }

  updateButton(e, label) {
    e.stopPropagation()
    if (e.value) this.addVal(label);
    else this.delVal(label);
    this.requestUpdate();
    this.sendUpdate()
  }
};

customElements.define('multi-btn', MultiButton);
