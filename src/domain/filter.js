import {VlGrid} from '/node_modules/vl-ui-grid/vl-grid.js';
import {VlButtonLink} from '/node_modules/vl-ui-button/vl-button.js';
import {VlIcon} from '/node_modules/vl-ui-icon/vl-icon.js';

const dataTableColumnSize = "8";

export class FilterFunctions {

  static renderFilter(dataTable) {
    return `
        <style>
          @import "/node_modules/vl-ui-grid/style.css";
        </style>
        <div is="vl-grid">
          <div id="filterColumn" is="vl-column" size="4" small-size="12">
            <slot name="filter"></slot>
          </div>
          <div id="dataTableColumn" is="vl-column" size="${dataTableColumnSize}" small-size="12">
            ${dataTable}
          </div>
        </div>`;
  }

  static renderToggleFilter() {
    return `
        <style>
          #toggleFilter {
            text-align: right;
          }
        </style>
        <div id="toggleFilter">
          <style>
            @import "/node_modules/vl-ui-icon/style.css";
            @import "/node_modules/vl-ui-button/style.css";
          </style>
          <button is="vl-button-link" type="button" aria-label="Toon of verberg de filter"><span is="vl-icon" icon="content-filter" before></span>Filter</button>
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

  static addToggleFilterButtonClickListener(richTable) {
    const toggleFilterButton = richTable.querySelector('#toggleFilter button');
    if (toggleFilterButton != null) {
      toggleFilterButton.addEventListener('click', () => {
        const filterColumn = richTable.querySelector('#filterColumn');
        const dataTableColumn = richTable.querySelector('#dataTableColumn');
        if (filterColumn.style.display === '') {
          FilterFunctions.hideFilter(richTable);
        } else {
          filterColumn.style.display = '';
          dataTableColumn.setAttribute('size', dataTableColumnSize);
        }
      });
    }
  }

  static hideFilter(richTable) {
    const filterColumn = richTable.querySelector('#filterColumn');
    const dataTableColumn = richTable.querySelector('#dataTableColumn');
    filterColumn.style.display = 'none';
    dataTableColumn.setAttribute('size', '12');
  }
}

