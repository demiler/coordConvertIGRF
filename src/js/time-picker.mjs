import { LitElement, html, css } from 'lit-element'
import style from '../css/time-picker.css';
import { padNumber, clamp } from './utils.mjs';
import './text-input.mjs';

class TimePicker extends LitElement {
  static get styles() {
    return [ style ];
  }

  static get properties() {
    return {
      value: { type: String },
    }
  }

  constructor() {
    super();
    const now = new Date();
    this.hours = now.getHours();
    this.mins = now.getMinutes();
    this.secs = now.getSeconds();
    this.formatValue();

    this.list = [];
    for (let i = 0; i < 24; i++)
      for (let j = 0; j < 60; j += 15)
        this.list.push(padNumber(i, 2) + ':' + padNumber(j, 2));
  }

  connectedCallback() {
    super.connectedCallback();

    if (this.hasAttribute("value") && this.value !== '')
      this.setDetTime(this.value);

    //this.scrollToBest();
    this.addEventListener('blur', this.change);
  }

  firstUpdated() {
    this.inputEl = this.shadowRoot.querySelector("#input");
    this.listEl = this.shadowRoot.querySelector("#list");
  }

  render() {
    return html`
      <text-input id="input"
        .value=${this.value}
        placeholder="hh:mm:ss"
        @focus=${this.showList}
        @input=${this.removeInvalid}
        @change=${this.change}
      >
        <div id="list" tabindex="-1" hidden>
          ${this.list.map(time => html`
            <span class='time' @click=${this.determineTime}>${time}</span>
          `)}
        </div>
      </text-input>
    `;
  }

  removeInvalid(e) {
    this.value = e.target.value.replace(/[^0-9 :,]+/g, '').replace(/ +/g, ' ');
    //this.inputEl.value = this.value;
    this.inputEl.forceUpdate(this.value);

    if (!this.value) {
      this.time = this.hours = this.mins = this.secs = undefined;
      this.sendChange();
      return;
    }

    let vals = this.value.match(/\d+/g);
    if (vals === null) {
      this.hours = this.mins = this.secs = 0;
      this.hideList();
    }
    else {
      this.showList();
      this.hours = clamp(0, 23, vals[0]);
      this.mins = clamp(0, 59, vals[1]) | 0;
      this.secs = clamp(0, 59, vals[2]) | 0;
      this.scrollToBest();
    }
    this.time = this.hours * 60 * 60 + this.mins * 60 + this.secs;
  }

  scrollToBest() {
    let id = this.hours * 4 + Math.trunc(this.mins / 15);
    this.listEl.children[id].scrollIntoView();
  }

  sendChange() {
    let event = new CustomEvent('update', {
      detail: this.getData(),
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  formatValue() {
    this.value = padNumber(this.hours, 2) + ':' +
      padNumber(this.mins, 2) + ':' +
      padNumber(this.secs, 2);
    this.time = this.hours * 60 * 60 + this.mins * 60 + this.secs;
  }

  change(e) {
    if (this.value) {
      this.formatValue();
      this.sendChange();
    }
    this.hideList();
    this.inputEl.blur();
  }

  determineTime(e) {
    this.setDetTime(e.target.innerText);
    this.hideList();
  }

  setDetTime(time) { //time = '00:00:00'
    const split = time.split(':');
    this.hours = Number(split[0]);
    this.mins = split.length > 1 ? Number(split[1]) : 0;
    this.secs = split.length > 2 ? Number(split[2]) : 0;
    this.formatValue();
  }

  hideList() {
    this.listEl.hidden = true;
  }

  showList() {
    this.listEl.hidden = false;
  }

  getData() {
    return this.value;
    //return {
      //value: this.value,
      //hours: this.hours,
      //mins: this.mins,
      //secs: this.secs,
      //time: this.time
    //};
  }
}

customElements.define('time-picker', TimePicker);
