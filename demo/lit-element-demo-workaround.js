import {
  html,
  LitElement
} from 'https://unpkg.com/lit-element@2.1.0/lit-element.js?module';
import {define} from '/node_modules/vl-ui-core/dist/vl-core.js';
import '../src/vl-rich-data-field.js';
import '../src/vl-rich-data-table.js';
import '../src/vl-rich-data-sorter.js';

export class LitElementDemo extends LitElement {

  constructor() {
    super();
  }

  firstUpdated() {
    this.component = this.shadowRoot.querySelector('#rich-data-table')
    this.component.data = { data : [{id:0, label: "wack"}, {id:1, label: "wacko"}]}
  }

  render() {
    return html`${this.renderComponent()}`;
  }

  renderComponent() {
    return html`
        <vl-rich-data-table id="rich-data-table">
          <vl-rich-data-field>
            <template slot="label">
                ID
            </template>
            <template slot="content">
               ${'${item.id}'}
            </template>
          </vl-rich-data-field>
          <vl-rich-data-field>
            <template slot="label">
                LABEL
            </template>
            <template slot="content">
               ${'${item.label}'}
            </template>
          </vl-rich-data-field>
        </vl-rich-data-table>`;
  }
}

define('lit-element-demo', LitElementDemo);