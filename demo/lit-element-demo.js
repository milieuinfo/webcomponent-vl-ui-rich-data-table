import {
  html,
  LitElement
} from 'https://unpkg.com/lit-element@2.1.0/lit-element.js?module';
import {define} from '/node_modules/vl-ui-core/vl-core.js';
import '../vl-checkbox.src.js';

export class LitElementDemo extends LitElement {

  static get properties() {
    return {
      changed: {type: Boolean}
    };
  }

  constructor() {
    super();
  }

  firstUpdated() {
    customElements.whenDefined('vl-checkbox').then(() => {
      console.log('checkbox is ready to be used!');
    });
  }

  render() {
    return html`${this.renderComponent()}${this.renderChange()}`;
  }

  renderComponent() {
    return html`<vl-checkbox id="checkbox" slot="content"
        id="id-element"
        label="label"
        block
        @input="${this._changeBooleanValue}"></vl-checkbox>`;
  }

  renderChange() {
    if (this.changed) {
      return html`<span>Changed</span>`;
    }
  }

  _changeBooleanValue(e) {
    this.changed = e.detail;
  }
}

define('lit-element-demo', LitElementDemo);