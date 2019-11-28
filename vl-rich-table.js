import { VlElement, define } from '../../../../../../node_modules/vl-ui-core/vl-core.js';
import '../../../../../../node_modules/vl-ui-data-table/vl-data-table.js';
import '../../../../../../node_modules/vl-ui-grid/vl-grid.js';
import '../../../../../../node_modules/vl-ui-icon/vl-icon.js';
import { VlPager } from '../../../../../../node_modules/vl-ui-pager/vl-pager.js';
import '../../../../../../node_modules/vl-ui-input-field/vl-input-field.js';
import '../../../../../../node_modules/vl-ui-select/vl-select.js';
import '../../../../../../node_modules/vl-ui-search-filter/vl-search-filter.js';

const SortDirections = {
  DESCENDING: 'desc', ASCENDING: 'asc'
};

const asc = SortDirections.ASCENDING;
const desc = SortDirections.DESCENDING;

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css = "[name=sortable-span] {\n  cursor: pointer;\n}\n\n[name=sortable-text] {\n  font-size: x-small;\n  vertical-align: super;\n}\n\nth.vl-sortable > [is=vl-icon] {\n  vertical-align: middle;\n}\n\ncaption {\n  caption-side: bottom;\n}";
styleInject(css);

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
class VlRichTable extends VlElement(HTMLElement) {
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
          ${css}
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

const sortableMixin = baseClass => class extends baseClass {

  connectedCallback() {
    if (this.richTable && this.hasAttribute('sortable')) {
      this._dressSortableHeader();
    }
  };

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
  };

  get direction() {
    return this.getAttribute('direction');
  };

  get priority() {
    return this.getAttribute('priority');
  };

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
  };

  _updateSortableHeader() {
    const sortableSpan = this._headerCell.querySelector(
        '[name="sortable-span"]'),
        sortableText = this._headerCell.querySelector('[name="sortable-text"]');

    const index = this.richTable.sortCriteria.findIndex(
        criteria => criteria && criteria.name === this.fieldName);
    this._priority = index > -1 ? (index + 1) : null;

    const criteria = index !== null
        ? this.richTable.sortCriteria[index] : null;

    if (criteria) {
      this._direction = criteria.direction;
      switch (criteria.direction) {
        case asc:
          this.setAttribute('direction', asc);
          this.setAttribute('priority', this._priority);
          sortableText.innerHTML = this._priority;
          sortableSpan.setAttribute("icon", "nav-up");
          break;
        case desc:
          this.setAttribute('direction', desc);
          this.setAttribute('priority', this._priority);
          sortableText.innerHTML = this.priority;
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
  };

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
};

const formatDate = (datestring) => {
  return new Date(datestring).toLocaleDateString('nl-BE',
      {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\//g, '.');
};

const formatDatetime = (datetimestring) => {
  return new Date(datetimestring).toLocaleString('nl-BE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '.');
};

const RenderFunctions = {
  'string': content => document.createTextNode(content),
  'datetime': content => document.createTextNode(formatDatetime(content)),
  'date': content => document.createTextNode(formatDate(content)),
  'default': content => document.createTextNode(content)
};

/**
 * VlRichTableField
 * @class
 * @classdesc
 *
 * @extends VlElement
 *
 * @property {boolean} sortable - Attribuut om aan te duiden de soorten op dit veld toestaan is.
 * @property {HTMLOptionElement[]} search-options - Attribuut om de search options te definiëren.
 * @property {boolean} searchable - Attribuut om aan te geven dat dit veld searchable moet zijn bij het toevoegen
 * @property {string} data-value - Attribuut om aan te duiden op welke sleutel van de data deze waarde moet gekoppeld worden. Verplicht en unique.
 * @property {string} data-type - Attribuut om te bepalen welk type data in de kolom moet komen en hoe de formattering moet gebeuren.
 *                                Mogelijke waarden:
 *                                - string : de waarde wordt als tekst getoond
 *                                - date : de datum wordt getoond volgens de BIN norm dd.mm.jjjj
 *                                - datetime : de datum + tijd wordt getoond volgens BIN norm dd.mm.jjjj hh:mi:ss
 *                                Default waarde: string
 * @property {asc | desc} direction - Te combineren met een 'priority' attribute om een sorteercriteria te bepalen.
 * @property {number} priority -Te combineren met een 'direction' attribute om een sorteercriteria te bepalen.
 *
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-table/releases/latest|Release notes}
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-table/issues|Issues}
 * @see {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-rich-table.html|Demo}
 */
class VlRichTableField extends sortableMixin(VlElement(HTMLElement)) {
  static get _observedAttributes() {
    return ['direction', 'priority'];
  }

  constructor() {
    super(`
        <style>
          @import "/node_modules/vl-ui-data-table/style.css";
        </style>
    `);
    this._searchValue;
  }


  /**
   * Manier om de data in de tabel te renderen. Kan overschreven worden om eigen renderer mee te geven vooraleer de data te tonen in de tabel.
   *
   * @param content de content die hoort in de te renderen cell van de tabel
   * @returns {Node} een node om in de td van de tabel te voegen
   */
  renderTableData(content) {
    return RenderFunctions[this._validDataType()](content);
  };

  get fieldName() {
    return this.getAttribute('data-value');
  }

  _validDataType() {
    const dataType = this.getAttribute('data-type');
    if (dataType != null && RenderFunctions.hasOwnProperty(dataType)) {
      return dataType;
    } else {
      return 'default';
    }
  }

  get _headerCell() {
    return this.__headerCell;
  }

  set _headerCell(headerCell) {
    this.__headerCell = headerCell;
  }

  connectedCallback() {
    this._initHeaderCell();
    super.connectedCallback();
  }

  _initHeaderCell() {
    if (this.richTable) {
      const headerCell = document.createElement("th");
      this._headerCell = headerCell;
      headerCell.appendChild(
          document.createTextNode(this.getAttribute('label')));
      this.richTable.addTableHeaderCell(headerCell);
    } else {
      console.log(
          'Een VlRichTableField moet altijd als parent een vl-rich-table hebben.');
    }
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
class VlRichTablePager extends VlPager {

  connectedCallback() {
    super.connectedCallback();
    if (this._tableToInsert) {
      this._appended = true;
      this._tableToInsert.addTableFooterCell(this);
      this.addEventListener('pagechanged', (e) => {
        this.richTable.dispatchEvent(new CustomEvent('pagechanged',
            {detail: e.detail}));
      });

      this._updatePageable();
      this.richTable.addEventListener('data_update_from_object', (e) => {
        this._updatePageable();
      });
    } else if (!this._appended) {
      console.log(
          'Een VlRichTablePager moet altijd als parent een vl-rich-table hebben.');
    }
  }

  _updatePageable() {
    const data = this.richTable.data;
    if (data.totalElements != null && data.size && data.number + 1) {
      this.setAttribute('total-items', data.totalElements);
      this.setAttribute('items-per-page', data.size);
      this.setAttribute('current-page', data.number + 1);
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

/**
 * VlRichTableSearchFilter
 * @class
 * @classdesc
 *
 * @extends VlElement
 *
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-table/releases/latest|Release notes}
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-table/issues|Issues}
 * @see {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-rich-table.html|Demo}
 **/
class VlRichTableSearchFilter extends VlElement(HTMLElement) {

  constructor() {
    super();
  }

  connectedCallback() {
    this._shadow = this.attachShadow({ mode: 'open' });
    this._shadow.innerHTML = `
        <style>
          @import "/node_modules/vl-ui-search-filter/style.css";
        </style>
        <div is="vl-search-filter" title="Verfijn uw zoekopdracht" alt>
          <form>
            <section>
              ${this._renderSearchFields()}
            </section>
          </form>
        </div>
    `;
  }


  get richTable() {
    if (this.parentElement && this.parentElement
        && this.parentElement.tagName.toLowerCase()
        === 'vl-rich-table') {
      return this.parentElement;
    }
  }

  _renderSearchFields() {
    return this.richTable.fields.map(field => `
      <div>
        <label is="form-label" for="${field.getAttribute('data-value')}">
          ${field.getAttribute('label')}
        </label>
        ${this._renderSearchField(field)}
      </div>
  `);
  }

  _renderSearchField(field) {
    if (field.getAttribute('search-options') != null) {
      return this._renderSelectSearchField(field);
    }
    if (field.getAttribute('data-type') === 'date') ;
    return this._renderInputSearchField(field);
  }

  _renderSelectSearchField(field) {
    return `
    <style>
      @import "/node_modules/vl-ui-select/style.css";
    </style>
    <select is="vl-select" data-vl-select name="${field.getAttribute('data-value')}" data-vl-select-deletable>
      <option placeholder value="">Kies een ${field.getAttribute('label').toLowerCase()}</option>
      ${JSON.parse(field.getAttribute('search-options')).map(option => `
      <option value="${option.value}">${option.text}</option>`)}
    </select>`;
  }

  _renderInputSearchField(field) {
    return `
    <style>
      @import "/node_modules/vl-ui-input-field/style.css";
    </style>
    <input is="vl-input-field" type="text" name="${field.getAttribute(
        'data-value')}" value="" block/>`;
  }
}

define('vl-rich-table', VlRichTable);
define('vl-rich-table-field', VlRichTableField);
define('vl-rich-table-pager', VlRichTablePager);
define('vl-rich-table-search-filter', VlRichTableSearchFilter);

export { RenderFunctions, SortDirections, VlRichTable, VlRichTableField, VlRichTablePager, VlRichTableSearchFilter, asc, desc };
