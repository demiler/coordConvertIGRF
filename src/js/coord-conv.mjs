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
    };
  }

  constructor() {
    super();
    this.tab = localStorage.getItem('tab');
    if (this.tab === null) this.tab = 'ntg';
  }

  render() {
    return html`
      <nav @click=${this.changeTab}>
        <div id="nte" ?current=${this.tab === "nte"}>Norad ID to everything</div>
        <div id="gte" ?current=${this.tab === "gte"}>GEO to everything</div>
        <div id="ntg" ?current=${this.tab === "ntg"}>Norad ID to GEO</div>
      </nav>

      <div id="content" @convert=${this.askConvert}>
        ${this.renderTab()}
      </div>
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

  askConvert(e) {
    fetch(`${window.location.href}convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(e.detail),
    })
    .then(res => res.json())
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log('some error', err);
    });
  }

  changeTab(e) {
    this.tab = e.target.id;
    localStorage.setItem('tab', this.tab);
  }
};

customElements.define('coord-conv', CoordConv);
