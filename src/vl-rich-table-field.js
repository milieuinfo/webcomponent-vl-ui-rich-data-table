import {VlElement} from "/node_modules/vl-ui-core/vl-core.js";
import {VlIcon} from '/node_modules/vl-ui-icon/vl-icon.js';
import {sortableMixin} from "./vl-rich-tabe-field-sortable-mixin.js";

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

export const RenderFunctions = {
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
export class VlRichTableField extends sortableMixin(VlElement(HTMLElement)) {
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
    if (this.richTable) {
      const headerCell = document.createElement("th");
      this._headerCell = headerCell;
      headerCell.appendChild(
          document.createTextNode(this.getAttribute('label')));
      if (this.hasAttribute('sortable')) {
        this._dressSortableHeader();
      }
      this.richTable.addTableHeaderCell(headerCell);
    } else {
      console.log(
          'Een VlRichTableField moet altijd als parent een vl-rich-table hebben.')
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