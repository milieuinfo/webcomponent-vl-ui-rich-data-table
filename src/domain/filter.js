import {VlGrid} from '/node_modules/vl-ui-grid/vl-grid.js';

export class FilterFunctions {

  static renderFilter(dataTable) {
    return `
        <style>
          @import "/node_modules/vl-ui-grid/style.css";
        </style>
        <div is="vl-grid">
          <div is="vl-column" size="4" small-size="12">
            <slot name="filter"></slot>
          </div>
          <div is="vl-column" size="8" small-size="12">
            ${dataTable}
          </div>
        </div>`;
  }

  static whenFilterActivated(doWithSearchCriteria) {
    return filter => {
      let filterRoot;
      if (filter.shadowRoot) {
        filterRoot = filter.shadowRoot;
      } else {
        filterRoot = filter;
      }
      const filterElements = filterRoot.querySelectorAll(
          '*[data-vl-search-criterium]');
      filterElements.forEach(element => {
        element.addEventListener(
            element.tagName.toLowerCase() === 'input' ? 'input' : 'change',
            () => {
              const searchCriteria = {};
              filterElements.forEach(filter => {
                if (this._isNotEmpty(filter.value)) {
                  searchCriteria[filter.getAttribute(
                      'data-vl-search-criterium')] = filter.value;
                }
              });
              doWithSearchCriteria(searchCriteria);
            });
      });
    }
  }

  static _isNotEmpty(value) {
    if (value == null) {
      return false;
    }
    if (Array.isArray(value) && value.length) {
      return false;
    }
    if (value === 0) {
      return false;
    }
    return !!value;
  }
}

