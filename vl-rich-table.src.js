import {VlElement, define} from '/node_modules/vl-ui-core/vl-core.js';
import {VlDataTable} from '/node_modules/vl-ui-data-table/vl-data-table.js';
import {VlPager} from '/node_modules/vl-ui-pager/vl-pager.js';
import {VlIcon} from '/node_modules/vl-ui-icon/vl-icon.js';
import {VlInputField} from '/node_modules/vl-ui-input-field/vl-input-field.js';

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
    this._searchCriteria = {};
    const slot = this.shadowRoot.querySelector('slot');
    slot.addEventListener('slotchange', () => this._createRows());
    this.addEventListener('searchValueChange',() => this.updateSearchFields(), true);
  }

  _createRows() {
    Array.from(this._tableBody.children).forEach(child => child.remove());
    this._data.forEach(data => {
      const row = document.createElement("tr");
      Array.from(this.children).filter(child => {
        return child.tagName.toLowerCase()
            === 'vl-rich-table-field'
      }).forEach(field => {
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

  _hoverChangedCallback(oldValue, newValue) {
    this._table.setAttribute('hover', newValue);
  }

  _zebraChangedCallback(oldValue, newValue) {
    this._table.setAttribute('zebra', newValue);
  }

  _linedChangedCallback(oldValue, newValue) {
    this._table.setAttribute('lined', newValue);
  }

  updateSortCriteria(criteria) {
    customElements.whenDefined('vl-rich-table-field').then(() => {
      if (criteria.direction && (criteria.direction === asc
          || criteria.direction === desc)) {
        if (criteria.priority) {
          this.sortCriterias[criteria.priority] = {
            name: criteria.name,
            direction: criteria.direction
          };
        } else {
          this.sortCriterias = this.sortCriterias.filter(
              sc => sc.name !== criteria.name);
          this.sortCriterias.push(criteria);
        }
      } else {
        this.sortCriterias = this.sortCriterias.filter(
            sc => sc.name !== criteria.name);
      }

      this.dispatchEvent(new CustomEvent('sort', {
            detail: {
              sortCriterias: this.sortCriterias
            }
          }
      ));
    });
  }

  get fields(){
    return Array.from(this.children).filter(child => {
      return child.tagName.toLowerCase()
          === 'vl-rich-table-field'
    })
  }

  updateSearchFields(){
    this.fields.forEach(field => {
      if (field.searchable){
        if (field.searchValue){
          this._searchCriteria[field.fieldName] = field.searchValue;
        }else{
          if (this._searchCriteria[field.fieldName]) {
            delete this._searchCriteria[field.fieldName];
          }
        }

      }
    });
    const searchEvent = new CustomEvent('search', {
          detail: {
            searchCriteria: this._searchCriteria
          }
        }
    );
    this.dispatchEvent(searchEvent);
    console.log("Searching for:" +JSON.stringify(searchEvent.detail));
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
    const td = document.createElement("td");
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

export const RenderFunctions = {
  'string': content => {
    return document.createTextNode(content)
  },
  'default': content => {
    return document.createTextNode(content)
  }
};

/**
 * VlRichTableField
 * @class
 * @classdesc
 *
 * @extends VlElement
 *
 * @property {boolean} sortable - ...
 * @property {boolean} searchable - ...
 * @property {string} data-value - Attribuut om aan te duiden op welke sleutel van de data deze waarde moet gekoppeld worden. Verplicht en unique.
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

  constructor() {
    super();
    this._searchValue;
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
      if (this.searchable) {
        this._dressSearchableHeader();
      }
      this.richTable.addTableHeaderCell(headerCell);
    } else {
      console.log(
          'Een VlRichTableField moet altijd als parent een vl-rich-table hebben.')
    }
  }

  /**
   * Manier om de data in de tabel te renderen. Kan overschreven worden om eigen renderer mee te geven vooraleer de data te tonen in de tabel.
   *
   * @param content de content die hoort in de te renderen cell van de tabel
   * @returns {Node} een node om in de td van de tabel te voegen
   */
  renderTableData(content) {
    return RenderFunctions[this._validDataType()](content);
  }

  _validDataType() {
    const dataType = this.getAttribute('data-type');
    if (dataType != null && RenderFunctions.hasOwnProperty(dataType)) {
      return dataType;
    } else {
      return 'default';
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

  get priority() {
    return this.getAttribute('priority');
  }

  get fieldName() {
    return this.getAttribute('data-value');
  }

  //null -> des -> asc -> null
  _sortButtonClicked(e) {
    let direction;
    switch (this.direction) {
      case asc:
        direction = null;
        break;
      case desc:
        direction = asc;
        break;
      default:
        direction = desc;
    }
    this.richTable.updateSortCriteria(
        {name: this.fieldName, direction: direction});
  }

  _updateSortableHeader() {
    this._priority = this.richTable.sortCriterias.findIndex(
        criteria => criteria && criteria.name === this.fieldName);
    this._priority = this._priority > -1 ? this._priority : null;
    const criteria = this._priority !== null
        ? this.richTable.sortCriterias[this._priority]
        : null,
        sortableSpan = this._headerCell.querySelector(
            '[name="sortable-span"]'),
        sortableText = this._headerCell.querySelector('[name="sortable-text"]');
    if (criteria) {
      this._direction = criteria.direction;
      switch (criteria.direction) {
        case asc:
          this.setAttribute('direction', asc);
          this.setAttribute('priority', this._priority);
          sortableText.innerHTML = this._priority + 1;
          sortableSpan.setAttribute("icon", "nav-up");
          break;
        case desc:
          this.setAttribute('direction', desc);
          this.setAttribute('priority', this._priority);
          sortableText.innerHTML = this._priority + 1;
          sortableSpan.setAttribute("icon", "nav-down");
          break;
        default:
          console.error(
              `${criteria.direction} is niet een geldige sort direction`);
      }
    } else {
      this._direction = null;
      this.removeAttribute('direction');
      this.removeAttribute('priority');
      sortableText.innerHTML = '';
      sortableSpan.setAttribute("icon", "sort");
    }
  }

  _directionChangedCallback(oldValue, newValue) {
    if (this.priority && newValue !== this._direction) {
      this.richTable.updateSortCriteria(
          {
            name: this.fieldName,
            direction: newValue,
            priority: this.priority
          });
    }
  };

  _priorityChangedCallback(oldValue, newValue) {
    if (this.direction && parseInt(newValue) !== this._priority) {
      this.richTable.updateSortCriteria({
        name: this.fieldName,
        direction: this.direction,
        priority: newValue
      });
    }
  }

  _dressSearchableHeader(){
    const search = document.createElement('input');
    search.setAttribute('is','vl-input-field');
    search.setAttribute("block","");
    search.setAttribute("style", "display: block;");//TODO
    search.addEventListener("input", (e) => {
      this._search(search.value);
    });
    this._headerCell.appendChild(search);
  }

  _search(value){
    console.log("SearchValue for "+this.fieldName +": "+value);
    this._searchValue = value;
    this.dispatchEvent(new CustomEvent('searchValueChange'));
  }

  get richTable() {
    if (this.parentNode && this.parentNode.tagName.toLowerCase()
        === 'vl-rich-table') {
      return this.parentNode;
    }
  }

  get searchable() {
    return this.hasAttribute('searchable');
  }

  get searchValue() {
    return this._searchValue;
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
      this._appended = true;
      this._tableToInsert.addTableFooterCell(this);
      this.addEventListener('pagechanged', (e) => {
        this.richTable.dispatchEvent(new CustomEvent('pagechanged',
            {detail: e.detail}));
      });
    } else if (!this._appended) {
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