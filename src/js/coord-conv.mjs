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
    if (this.tab === null) this.tab = 'ttg';
  }

  render() {
    return html`
      <nav @click=${this.changeTab}>
        <div id="tte" ?current=${this.tab === "tte"}>Norad ID to everything</div>
        <div id="gte" ?current=${this.tab === "gte"}>GEO to everything</div>
        <div id="ttg" ?current=${this.tab === "ttg"}>Norad ID to GEO</div>
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
        return html`<norad-to-everything></norad-to-everything>`;
      case 'gte':
        return html`<geo-to-everything></geo-to-everything>`;
      case 'ttg':
        return html`<norad-to-geo></norad-to-geo>`;
    }
  }

  askConvert(e) {
    const todo = this.shadowRoot.getElementById("todo");
    console.log(e.detail)
    //todo.style.opacity = 1;
    //setTimeout(() => {todo.style.opacity = 0}, 2000);
  }

  changeTab(e) {
    this.tab = e.target.id;
    localStorage.setItem('tab', this.tab);
  }
};

customElements.define('coord-conv', CoordConv);
