import {VlElement, define} from '/node_modules/vl-ui-core/vl-core.js';

import {VlDataTable} from '/node_modules/vl-ui-data-table/vl-data-table.js';

/**
 * VlRichTable
 * @class
 * @classdesc
 *
 * @extends VlElement
 *
 * @property {object[]} data - Attribuut die de data bevat.
 * @property {string} pageable - ...
 *
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-table/releases/latest|Release notes}
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-table/issues|Issues}
 * @see {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-rich-table.html|Demo}
 */
export class VlRichTable extends VlElement(HTMLElement) {

  static get _observedAttributes() {
    return ['data'];
  }

  constructor() {
    super(`
        <style>
          @import "/node_modules/vl-ui-data-table/style.css";
        </style>

        <slot></slot>
        <table is="vl-data-table" zebra>
          <thead>
            <tr>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
        `);
    this._data = [];
    const slot = this.shadowRoot.querySelector('slot');
    slot.addEventListener('slotchange', () => this._createRows());
  }

  _createRows() {
    Array.from(this._tableBody.children).forEach(child => child.remove());
    this._data.forEach(data => {
      let row = document.createElement("tr");
      Array.from(this.children).forEach(field => {
        row.appendChild(
            this.__createTd(data[field.getAttribute('data-value')]));
      });
      this._tableBody.appendChild(row);
    });
  }

  _dataChangedCallback(oldValue, newValue) {
    this.data = JSON.parse(newValue);
  }

  get data() {
    return this._data;
  }

  set data(data) {
    this._data = data;
    if (Array.from(this.children).every(child => child.richTable === this)) {
      this._createRows();
    }
  }

  __createTd(textContent) {
    let tableData = document.createElement("td");
    let text = document.createTextNode(textContent);
    tableData.appendChild(text);
    return tableData;
  }

  get _tableHeaderRow() {
    return this.shadowRoot.querySelector('thead > tr');
  }

  get _tableBody() {
    return this.shadowRoot.querySelector('tbody');
  }

  addTableHeaderCell(cell) {
    this._tableHeaderRow.appendChild(cell);
  }

}

define('vl-rich-table', VlRichTable);

/**
 * VlRichTableField
 * @class
 * @classdesc
 *
 * @extends VlElement
 *
 * @property {boolean} sortable - ...
 * @property {boolean} searchable - ...
 * @property {string} data-value - Attribuut om aan te duiden op welke sleutel van de data deze waarde moet gekoppeld worden. Verplicht.
 * @property {string} data-type - Attribuut om te bepalen welk type data in de kolom moet komen en hoe de formattering moet gebeuren. Mogelijke waarden: string, ... //todo voeg meer toe
 *                                Default waarde: string
 *
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-table/releases/latest|Release notes}
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-table/issues|Issues}
 * @see {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-rich-table.html|Demo}
 */
export class VlRichTableField extends VlElement(HTMLElement) {

  connectedCallback() {
    if (this.richTable) {
      let headerCell = document.createElement("th");
      headerCell.appendChild(
          document.createTextNode(this.getAttribute('label')));
      // if (this.hasAttribute('sortable')) {
      // todo add sort UIG-256
      // }
      // if (this.hasAttribute('searchable')) {
      // todo add search UIG-255
      // }
      this.richTable.addTableHeaderCell(headerCell);
    } else {
      console.log('Een VlRichTableField moet altijd als parent een vl-rich-table hebben.')
    }
  }

  get richTable() {
    if (this.parentNode && this.parentNode.tagName.toLowerCase()
        === 'vl-rich-table') {
      return this.parentNode;
    }
  }
}

define('vl-rich-table-field', VlRichTableField);
