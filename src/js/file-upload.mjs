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
      file: { type: Object, reflect: true },
    };
  }

  render() {
    return html`
      <button id="cancel"
        title="Remove file"
        @click=${this.removeFile}
        ?active=${this.file}
      >${unsafeSVG(crossIco)}</button>
      <span id="input-wrap">
        <input type="file"
          accept="text/*"
          @input=${this.getFile}
        >
        <span id="button-wrap">
          <button id="upload" tabindex="-1">${unsafeSVG(uploadIco)} Upload File</button>
          <span id="filename"
            ?active=${this.file}
          >${this.file ? this.file.name : 'No file' }</span>
        </span>
      </span>
    `;
  }

  sendUpdate() {
    this.dispatchEvent(new CustomEvent('update', {
      detail: this.file,
      bubbles: false,
      composed: true
    }));
  }

  getFile(e) {
    this.file = e.target.files[0];
    this.sendUpdate();
  }

  removeFile(e) {
    this.file = undefined;
    this.sendUpdate();
  }
}

customElements.define('file-upload', FileUpload);
