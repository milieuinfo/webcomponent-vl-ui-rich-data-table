import {VlElement} from "/node_modules/vl-ui-core/vl-core.js";
import {VlInputField} from '/node_modules/vl-ui-input-field/vl-input-field.js';
import {VlSelect} from '/node_modules/vl-ui-select/vl-select.js';
import {VlSearchFilter} from '/node_modules/vl-ui-search-filter/vl-search-filter.js';

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
export class VlRichTableSearchFilter extends VlElement(HTMLElement) {

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
    if (field.getAttribute('data-type') === 'date') {
      //todo date
    }
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