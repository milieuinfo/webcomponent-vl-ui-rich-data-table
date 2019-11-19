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
 * @property {boolean} hover - Attribuut wordt gebruikt om een rij te highlighten waneer de gebruiker erover hovert met muiscursor. Zie ook {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-data-table.html|vl-data-table}
 * @property {boolean} lined - Variant met een lijn tussen elke rij en kolom. Zie ook {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-data-table.html|vl-data-table}
 * @property {boolean} zebra - Variant waarin de rijen afwisslend een andere achtergrondkleur krijgen. Dit maakt de tabel makkelijker leesbaar. Zie ook {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-data-table.html|vl-data-table}
 * @property {string} pageable - ...
 *
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-table/releases/latest|Release notes}
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-table/issues|Issues}
 * @see {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-rich-table.html|Demo}
 */
export class VlRichTable extends VlElement(HTMLElement) {
  get sortCriterias() {
    return this._sortCriterias;
  }

  set sortCriterias(criterias) {
    this._sortCriterias = criterias;
  }

  static get _observedAttributes() {
    return ['data', 'hover', 'lined', 'zebra'];
  }

  constructor() {
    super(`
        <style>
          @import "/node_modules/vl-ui-data-table/style.css";
          @import "../style.css";
        </style>

        <slot></slot>
        <table is="vl-data-table">
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
    this._sortCriterias = [];
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

  _hoverChangedCallback(oldValue, newValue) {
    this._table.setAttribute('hover', newValue);
  }

  _zebraChangedCallback(oldValue, newValue) {
    this._table.setAttribute('zebra', newValue);
  }

  _linedChangedCallback(oldValue, newValue) {
    this._table.setAttribute('lined', newValue);
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

  get headers() {
    return this.shadowRoot.querySelectorAll('th');
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

  get _table() {
    return this.shadowRoot.querySelector('table');
  }

  get _tableHeaderRow() {
    return this._table.querySelector('thead > tr');
  }

  get _tableBody() {
    return this._table.querySelector('tbody');
  }

  get _tableFooterRow() {
    return this._table.querySelector('tfoot > tr');
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

export const SortDirections = {
  DESCENDING: 'desc', ASCENDING: 'asc'
};

const asc = SortDirections.ASCENDING,
    desc = SortDirections.DESCENDING;

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
    return ['direction', 'priority'];
  }

  get _headerCell() {
    return this.__headerCell;
  }

  set _headerCell(headerCell) {
    this.__headerCell = headerCell;
  }

  connectedCallback() {
    if (this.richTable) {
      const headerCell = document.createElement("th");
      this._headerCell = headerCell;
      headerCell.appendChild(
          document.createTextNode(this.getAttribute('label')));
      if (this.hasAttribute('sortable')) {
        this._dressSortableHeader();
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

  _dressSortableHeader() {
    const headerCell = this._headerCell;
    headerCell.classList.add('vl-sortable');
    const span = document.createElement('span', 'vl-icon');
    span.setAttribute('before', '');
    span.setAttribute('icon', 'sort');
    span.setAttribute('name', 'sortable-span');
    const text = document.createElement('label');
    text.setAttribute('name', 'sortable-text');
    headerCell.appendChild(span);
    headerCell.appendChild(text);
    span.addEventListener("click", () => {
      this._sortButtonClicked();
    });

    this.richTable.addEventListener('sort', () => {
      this._updateSortableHeader();
    });
  }

  get direction() {
    return this.getAttribute('direction');
  }

  get fieldName() {
    return this.getAttribute('data-value');
  }

  //null -> des -> asc -> null
  _sortButtonClicked(e) {
    if (this.direction) {
      if (this.direction === desc) {
        this.richTable.sortCriterias.forEach(criteria => {
          if (criteria.name === this.fieldName) {
            criteria.direction = asc;
          }
        });
      } else if (this.direction === asc) {
        this.richTable.sortCriterias = this.richTable.sortCriterias.filter(
            criteria => criteria.name !== this.fieldName);
      }
    } else {
      this.richTable.sortCriterias.push(
          {name: this.fieldName, direction: 'desc'});
    }

    this.richTable.dispatchEvent(new CustomEvent('sort', {
          detail: {
            sortCriterias: this.richTable.sortCriterias
          }
        }
    ));
  }

  _updateSortableHeader() {
    const priority = this.richTable.sortCriterias.findIndex(criteria => criteria.name === this.fieldName),
        criteria = priority > -1 ? this.richTable.sortCriterias[priority] : null,
        sortableSpan = this._headerCell.querySelector(
            '[name="sortable-span"]'),
        sortableText = this._headerCell.querySelector('[name="sortable-text"]');
    if (criteria) {
      switch (criteria.direction) {
        case asc:
          this.setAttribute('direction', asc);
          sortableText.innerHTML = priority + 1;
          sortableSpan.setAttribute("icon", "nav-up");
          break;
        case desc:
          this.setAttribute('direction', desc);
          sortableText.innerHTML = priority + 1;
          sortableSpan.setAttribute("icon", "nav-down");
          break;
        default:
          console.error(
              `${criteria.direction} is niet een geldige sort direction`);
      }
    } else {
      this.removeAttribute('direction');
      sortableText.innerHTML ='';
      sortableSpan.setAttribute("icon", "sort");
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