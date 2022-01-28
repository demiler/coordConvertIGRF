import { html, LitElement } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import style from '../css/file-upload.css';
import crossIco from '../../assets/cross_x.svg';
import uploadIco from '../../assets/upload.svg';

class FileUpload extends LitElement {
  static get styles() {
    return [ style ];
  }

  static get properties() {
    return {
      file: { type: Object },
    };
  }

  render() {
    return html`
      <button id="cancel">${unsafeSVG(crossIco)}</button>
      <span id="button-wrap">
        <input type="file" accept="text/*" multiple
          @input=${this.getFile}>
        <button id="upload">${unsafeSVG(uploadIco)} Upload File</button>
      </span>
    `;
  }

  getFile(e) {
    let filename = e.target.value.replace('C:\\fakepath\\', '')
    console.log(e)
    console.log(filename)
    console.log(e.target.value)
  }
}

customElements.define('file-upload', FileUpload);
