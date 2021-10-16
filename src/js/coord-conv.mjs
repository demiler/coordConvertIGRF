import { html, LitElement } from 'lit-element';
import { transition, slide } from 'lit-transition';
import style from '../css/coord-conv.css';
import './tle-to-everything.mjs';
import './geo-to-everything.mjs';
import './tle-to-geo.mjs';

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
    this.tab = "ttg";
  }

  render() {
    return html`
      <nav @click=${this.changeTab}>
        <div id="tte" ?current=${this.tab === "tte"}>TLE to everything</div>
        <div id="gte" ?current=${this.tab === "gte"}>GEO to everything</div>
        <div id="ttg" ?current=${this.tab === "ttg"}>TLE to GEO</div>
      </nav>

      <div id="content" @convert=${this.askConvert}>
        ${this.renderTab()}
        <div id="todo" style="margin-top: 10px; width: fit-content; font-size: 2rem; padding: 10px 20px; border-radius: 10px; background-color: #ffa4a4; transition: opacity .2s; opacity: 0;">
          To Be Implemented
        </div>
      </div>
    `;
  }
        //${transition(this.renderTab(), slide({x:'100px'}))}

  renderTab() {
    switch (this.tab) {
      case 'tte':
        return html`<tle-to-everything></tle-to-everything>`;
      case 'gte':
        return html`<geo-to-everything></geo-to-everything>`;
      case 'ttg':
        return html`<tle-to-geo></tle-to-geo>`;
    }
  }

  askConvert(e) {
    const todo = this.shadowRoot.getElementById("todo");
    todo.style.opacity = 1;
    setTimeout(() => {todo.style.opacity = 0}, 2000);
  }

  changeTab(e) {
    this.tab = e.target.id;
  }
};

customElements.define('coord-conv', CoordConv);
