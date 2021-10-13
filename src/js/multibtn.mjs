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
      vals: { type: Set },
    };
  }

  constructor() {
    super();
    this.labels = []
    this.vals = new Set()
  }

  render() {
    return html`
      <div id="main"
        @click=${this.updateMain}
        ?active=${this.vals.size}
      >
        <slot></slot>
        <div id="buttons">
          ${this.labels.map(label => html`
            <tog-btn
                class='button'
                .value=${this.vals.has(label)}
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
    this.dispatchEvent(new CustomEvent('update', { detail: this.vals }))
  }

  updateMain(e) {
    if (e.target.classList.contains('button')) return;

    if (this.vals.size == this.labels.length) {
      this.vals.clear();
      this.requestUpdate();
    }
    else {
      this.vals = new Set(this.labels)
    }
    this.sendUpdate();
  }

  updateButton(e, label) {
    e.stopPropagation()
    if (e.value) this.vals.add(label)
    else this.vals.delete(label);
    this.requestUpdate();
    this.sendUpdate()
  }
};

customElements.define('multi-btn', MultiButton);
