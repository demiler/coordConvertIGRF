import { LitElement, html, css } from 'lit-element'
import style from '../css/date-picker.css';
import 'app-datepicker';
import { padNumber } from './utils.mjs';
import './text-input.mjs';

const MONTHS =
  ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  //["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

const getCurrentDate = () => {
  const temp = new Date();
  return temp.getDate() + " " + MONTHS[temp.getMonth()] + " " + temp.getFullYear();
}

const stringToDate = (str, sep = '-') => {
  const arr = str.split(sep);
  return arr[0] + " " + MONTHS[Number(arr[1]) - 1] + " " + arr[1];
}

const isValidDate = (d) => {
  return d instanceof Date && !isNaN(d);
}

const getMonthFromString = (mon) => {
  if (mon === undefined || mon === null) return -1;

  if (/^\d+$/.test(mon)) return Number(mon) - 1;

  mon = mon.toLowerCase().slice(0, 3);
  return MONTHS.indexOf(mon);
  //return new Date(Date.parse(mon +" 1, 2000")).getMonth()
}


class DatePicker extends LitElement {
  static get styles() {
    return [ style ];
  }

  static get properties() {
    return {
      value: { type: String },
      placeholder: { type: String },
    }
  }

  constructor() {
    super();

    const today = new Date();
    this.day = today.getDate();
    this.month = today.getMonth();
    this.year = today.getFullYear();
    this.placeholder = 'dd mm yyyy';

    this.min = "1900-01-01";
    this.max = "2029-12-31";
    this.value = this.formatDate();
    this.prettyDate = this.makePretty();
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('blur', this.hidePicker);

    if (this.hasAttribute("value")) {
      if (this.value == '') {
        this.prettyDate = '';
      }
      else {
        this.setDateFromString(this.value);
        this.prettyDate = this.makePretty();
        this.requestUpdate();
      }
    }
  }

  firstUpdated() {
    this.inputEl = this.shadowRoot.querySelector("#date-input");
    this.pickerEl = this.shadowRoot.querySelector("#date-picker");
  }

  render() {
    return html`
      <text-input id="date-input"
          value=${this.prettyDate}
          placeholder=${this.placeholder}
          @focus=${this.showPicker}
          @input=${this.parse}
          @change=${this.changeDate}
          @keyup=${this.checkKeyUp}
        >
          <app-datepicker tabindex="-1"
              value=${this.value}
              id="date-picker"
              @datepicker-value-updated=${this.updateDate}
              firstDayOfWeek="1"
              min=${this.min}
              max=${this.max}
              inline
              hidden
          ></app-datepicker>
        </text-input>
    `;
  }

  setDateFromString(str) {
    const vals = str.split('-');
    this.day = Number(vals[2]);
    this.month = Number(vals[1]) - 1;
    this.year = Number(vals[0]);
  }

  updateDate(e) {
    e.stopPropagation();
    this.setDateFromString(e.target.value);
    this.value = this.formatDate();
    this.prettyDate = this.makePretty();
    this.assignDate();
    this.hidePicker();
  }

  parse(e) {
    e.stopPropagation();

    if (e.target.value === "") {
      this.value = '';
      this.day = this.month = this.year = undefined;
      this.sendChange();
      return;
    }

    let vals = e.target.value.replace(/[\\\/ -]+/g, '/').split('/');
    const date = new Date(
        vals[2] < 100 ? 2000 + Number(vals[2]) : vals[2],
        getMonthFromString(vals[1]),
        vals[0]);

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const value = this.formatDate(day, month, year);

    if (!isValidDate(date) || value < this.min || value > this.max)
        return;

    this.day = day;
    this.month = month;
    this.year = year;

    this.value = value;
    this.pickerEl.value = this.value;
    this.prettyDate = this.makePretty();
    this.sendChange();
  }

  makePretty() {
    return this.day + " " + MONTHS[this.month] + " " + this.year;
  }

  formatDate(day = this.day, month = this.month, year = this.year) {
    return padNumber(year, 4) + "-" + padNumber((month + 1), 2) + "-" + padNumber(day, 2);
  }

  changeDate(e) {
    e.stopPropagation();
    this.assignDate(e);
  }

  assignDate(e) {
    if (this.value === '') return;
    this.inputEl.value = this.prettyDate;
    this.sendChange();
  }

  sendChange() {
    let event = new CustomEvent('update', {
        detail: this.getData(),
        bubbles: true,
        composed: true
    });
    this.dispatchEvent(event);
  }

  showPicker() {
    this.pickerEl.hidden = false;
  }

  hidePicker() {
    this.pickerEl.hidden = true;
  }

  checkKeyUp(e) {
    if (e.key === "Enter") {
      this.hidePicker();
      e.currentTarget.blur();
    }
  }

  getData() {
    return this.value;
    //return {
        //value: this.value,
        //day  : this.day,
        //month: this.month,
        //year : this.year,
    //}
  }
}

customElements.define('date-picker', DatePicker);
