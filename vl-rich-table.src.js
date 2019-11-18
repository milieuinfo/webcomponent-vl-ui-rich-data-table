import {VlElement, define} from '/node_modules/vl-ui-core/vl-core.js';
import {VlDataTable} from '/node_modules/vl-ui-data-table/vl-data-table.js';
import {VlPager} from '/node_modules/vl-ui-pager/vl-pager.js';
import {VlIcon} from '/node_modules/vl-ui-icon/vl-icon.js';

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
          @import "../style.css";
        </style>

        <slot></slot>
        <table is="vl-data-table" zebra>
          <thead>
            <tr>
            </tr>
          </thead>
          <tfoot>
            <tr>
            </tr>
          </tfoot>
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
      Array.from(this.children).filter(child => {
        return child.tagName.toLowerCase()
            === 'vl-rich-table-field'
      }).forEach(field => {
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
    if (this._isReady()) {
      this._createRows();
    }
  }

  _isReady() {
    return Array.from(this.children).every(child => child.richTable === this);
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

  get _tableFooterRow() {
    return this.shadowRoot.querySelector('tfoot > tr');
  }

  addTableHeaderCell(cell) {
    this._tableHeaderRow.appendChild(cell);
  }

  addTableFooterCell(cell) {
    let td = document.createElement("td");
    td.setAttribute("colspan", 9999);
    td.appendChild(cell);
    this._tableFooterRow.append(td);
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
  static get _observedAttributes() {
    return ['order'];
  }

  connectedCallback() {
    if (this.richTable) {
      let headerCell = document.createElement("th");
      headerCell.appendChild(
          document.createTextNode(this.getAttribute('label')));
      if (this.hasAttribute('sortable')) {
        headerCell.classList.add('vl-sortable');
        let icon = document.createElement('span', 'vl-icon');
        icon.setAttribute("icon", "sort");
        headerCell.appendChild(icon);
        icon.addEventListener("click", (e) => {
          this._sort(e.target);
        });
      }
      // if (this.hasAttribute('searchable')) {
      // todo add search UIG-255
      // }
      this.richTable.addTableHeaderCell(headerCell);
    } else {
      console.log(
          'Een VlRichTableField moet altijd als parent een vl-rich-table hebben.')
    }
  }

  get order() {
    return this.getAttribute('order');
  }

  _sort(th) {
    if (this.order) {
      if (this.order === 'desc') {
        this.setAttribute('order', 'asc');
        th.setAttribute("icon", "nav-up")
      } else if (this.order === 'asc') {
        this.removeAttribute('order');
        th.setAttribute("icon", "sort")
      }
    } else {
      this.setAttribute('order', 'desc');
      th.setAttribute("icon", "nav-down")
    }
  }

  _orderChangedCallback(oldValue, newValue) {
    this.richTable.dispatchEvent(new CustomEvent('sort', {
      detail: {
        field: this.getAttribute('data-value'),
        oldValue: oldValue,
        newValue: newValue
      }
    }))
  }

  get richTable() {
    if (this.parentNode && this.parentNode.tagName.toLowerCase()
        === 'vl-rich-table') {
      return this.parentNode;
    }
  }
}

define('vl-rich-table-field', VlRichTableField);

/**
 * VlRichTablePager
 * @class
 * @classdesc
 *
 * @extends VlPager
 *
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-pager/releases/latest|Release notes}
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-pager/issues|Issues}
 * @see {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-pager.html|Demo}
 *
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-table/releases/latest|Release notes}
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-table/issues|Issues}
 * @see {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-rich-table.html|Demo}
 **/
export class VlRichTablePager extends VlPager {

  connectedCallback() {
    super.connectedCallback();
    if (this._tableToInsert) {
      this._tableToInsert.addTableFooterCell(this);
      this.addEventListener('changed', (e) => {
        this.richTable.dispatchEvent(new CustomEvent('pagechange',
            {detail: e.detail}));
      });
    } else {
      console.log(
          'Een VlRichTablePager moet altijd als parent een vl-rich-table hebben.')
    }
  }

  get _tableToInsert() {
    if (this.parentNode && this.parentNode.tagName.toLowerCase()
        === 'vl-rich-table') {
      return this.parentNode;
    }
  }

  get richTable() {
    if (this.getRootNode() && this.getRootNode().host
        && this.getRootNode().host.tagName.toLowerCase()
        === 'vl-rich-table') {
      return this.getRootNode().host;
    }
  }
}

define('vl-rich-table-pager', VlRichTablePager);