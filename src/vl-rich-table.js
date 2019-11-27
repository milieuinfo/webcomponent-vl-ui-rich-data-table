import {VlElement} from "/node_modules/vl-ui-core/vl-core.js";
import {VlDataTable} from '/node_modules/vl-ui-data-table/vl-data-table.js';
import {VlGrid} from '/node_modules/vl-ui-grid/vl-grid.js';

import {asc,desc} from "./domain/sortable";
import style from "./vl-rich-table-style.scss"

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
 * @property {boolean} searchable - Attribuut die aangeeft dat deze table doorzoekbaar is. Er zal een vl-search-filter toevoegd worden en gekeken worden welke fields searchable zijn en toegevoegd worden aan de filter.
 *
 * @event pagechanged - De geselecteerde pagina zijn veranderd.
 * @event search - De zoekcriteria zijn veranderd. Triggert bij elke input/select in het filter slot. Enkel als de rich table searchable is.
 * @event sort - De sorteercriteria zijn veranderd.
 *
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-table/releases/latest|Release notes}
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-table/issues|Issues}
 * @see {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-rich-table.html|Demo}
 */
export class VlRichTable extends VlElement(HTMLElement) {
  get sortCriteria() {
    return this._sortCriteria;
  }

  set sortCriteria(criteria) {
    this._sortCriteria = criteria;
  }

  static get _observedAttributes() {
    return ['data'];
  }

  constructor() {
    super();
    this._data = [];
    this._sortCriteria = [];
    this._searchCriteria = {};
  }

  connectedCallback() {
    this._shadow = this.attachShadow({ mode: 'open' });
    this._shadow.innerHTML = `
        <style>
          ${style}
        </style>
        <slot></slot>
        ${this._renderSearchable(`
            <style>
              @import "/node_modules/vl-ui-data-table/style.css";
            </style>
            <table is="vl-data-table" ${this._dataTableAttributes}>
              <thead>
                <tr>
                </tr>
              </thead>
              <tbody>
              </tbody>
              <caption></caption>
            </table>`)}`;
    const slot = this.shadowRoot.querySelector('slot');
    slot.addEventListener('slotchange', () => this._createRows());
    const filter = this.shadowRoot.querySelector('slot[name=filter]');
    if (filter) {
      filter.addEventListener('slotchange', () => {
        filter.assignedElements().forEach(slottedFilter => {
          let filterRoot;
          if (slottedFilter.shadowRoot) {
            filterRoot = slottedFilter.shadowRoot;
          } else {
            filterRoot = slottedFilter;
          }
          filterRoot.querySelectorAll('input, select').forEach(element => {
            element.addEventListener(element.tagName.toLowerCase() === 'input' ? 'input' : 'change', (e) => {
              const searchCriteria = {};
              filterRoot.querySelectorAll('input, select').forEach(filter => {
                if (filter.value) {
                  searchCriteria[filter.name] = filter.value;
                }
              });
              this.dispatchEvent(new CustomEvent('search', {
                detail: {
                  searchCriteria: searchCriteria
                },
                bubbles: true
              }));
            });
          });
        });
      });
    }
  }

  _renderSearchable(dataTable) {
    return `${this.getAttribute('searchable') != null ? `
        <style>
          @import "/node_modules/vl-ui-grid/style.css";
        </style>
        <div is="vl-grid">
          <div is="vl-column" size="4" small-size="12">
          <slot name="filter"></slot>
          </div>
          <div is="vl-column" size="8" small-size="12">` : `` }
            ${dataTable}
            ${this.getAttribute('searchable') != null ? `` : `
          </div>
        </div>`}`;
  }

  get _dataTableAttributes() {
    return (this.getAttribute('zebra') != null ? ` zebra` : ``)
        + (this.getAttribute('lined') != null ? ` lined` : ``)
        + (this.getAttribute('hover') != null ? ` hover` : ``);
  }

  _createRows() {
    Array.from(this._tableBody.children).forEach(child => child.remove());
    this.content.forEach(data => {
      const row = document.createElement("tr");
      Array.from(this.fields).forEach(field => {
        const tableData = document.createElement("td");
        tableData.appendChild(field.renderTableData(data[field.fieldName]));
        row.appendChild(tableData);
      });
      this._tableBody.appendChild(row);
    });
  }

  _dataChangedCallback(oldValue, newValue) {
    this.data = JSON.parse(newValue);
  }

  updateSortCriteria(criteria) {
    setTimeout(() => {
      if (criteria.direction === asc || criteria.direction === desc) {
        if (criteria.priority) {
          const index = criteria.priority - 1;
          this.sortCriteria[index] = {
            name: criteria.name,
            direction: criteria.direction
          };
        } else {
          this.sortCriteria = this.sortCriteria.filter(
              sc => sc.name !== criteria.name);
          this.sortCriteria.push(criteria);
        }
      } else {
        this.sortCriteria = this.sortCriteria.filter(
            sc => sc.name !== criteria.name);
      }

      this.dispatchEvent(new CustomEvent('sort', {
            detail: {
              sortCriteria: this.sortCriteria
            }
          }
      ));
    }, 0);
  }

  get fields() {
    return Array.from(this.children).filter(child => {
      return child.tagName.toLowerCase()
          === 'vl-rich-table-field'
    })
  }

  get data() {
    return this._data;
  }

  set data(data) {
    this._data = data;
    if (this._isReady()) {
      this._createRows();
    }
    if (!Array.isArray(this.data)) {
      this.dispatchEvent(new CustomEvent('data_update_from_object', this.data));
    }
  }

  get content() {
    if (Array.isArray(this.data)) {
      return this.data;
    } else if (Array.isArray(this.data.content)) {
      return this.data.content;
    } else {
      throw new Error("data is geen geldige array van objecten");
    }
  }

  get headers() {
    return this.shadowRoot.querySelectorAll('th');
  }

  _isReady() {
    return Array.from(this.fields).every(child => child.richTable === this);
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
    return this._table.querySelector('caption');
  }

  addTableHeaderCell(cell) {
    this._tableHeaderRow.appendChild(cell);
  }

  addTableFooterCell(cell) {
    this._tableFooterRow.append(cell);
  }
}