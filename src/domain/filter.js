import {VlGrid} from '/node_modules/vl-ui-grid/vl-grid.js';
import {VlButtonLink} from '/node_modules/vl-ui-button/vl-button.js';
import {VlIcon} from '/node_modules/vl-ui-icon/vl-icon.js';

const dataTableColumnSize = "8";

export class FilterFunctions {

  static renderFilter(dataTable, closable) {
    return `
        <style>
          @import "/node_modules/vl-ui-grid/style.css";
          #dataTableGrid {
            margin-left: 0;
          }
          #dataTableColumn {
            overflow-y: auto;
            padding-left: 0;
          }
        </style>
        <div id="dataTableGrid" is="vl-grid">
          <div id="filterColumn" is="vl-column" size="4" small-size="12">
            ${closable ? FilterFunctions._renderCloseFilterButton() : ``}
            <slot name="filter"></slot>
          </div>
          <div id="dataTableColumn" is="vl-column" size="${dataTableColumnSize}" small-size="12">
            ${closable ? FilterFunctions._renderToggleFilterButton() : ``}
            ${dataTable}
          </div>
        </div>`;
  }

  static _renderCloseFilterButton() {
    return `
      <style>
        @import "/node_modules/vl-ui-icon/style.css";
        @import "/node_modules/vl-ui-button/style.css";
        #closeFilter {
          text-align: right;
        }
      </style>
      <div id="closeFilter">
        <button is="vl-button-link" type="button" aria-label="Verberg de filter"><span is="vl-icon" icon="close" before></span></button>
      </div>
        `;
  }

  static _renderToggleFilterButton() {
    return `
      <style>
        @import "/node_modules/vl-ui-icon/style.css";
        @import "/node_modules/vl-ui-button/style.css";
        #toggleFilter {
          text-align: right;
        }
      </style>
      <div id="toggleFilter">
        <button is="vl-button-link" type="button" aria-label="Toon of verberg de filter"><span is="vl-icon" icon="content-filter" before></span>Filter</button>
      </div>
    `;
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

  static addCloseAndToggleFilterButtonClickListeners(richTable) {
    const toggleFilterButton = richTable.querySelector('#toggleFilter button');
    if (toggleFilterButton != null) {
      toggleFilterButton.addEventListener('click', () =>
          FilterFunctions._toggleFilter(richTable));
    }
    const closeFilterButton = richTable.querySelector('#closeFilter button');
    if (closeFilterButton != null) {
      closeFilterButton.addEventListener('click', () => {
        FilterFunctions.hideFilter(richTable);
      });
    }
  }

  static _toggleFilter(richTable) {
    const filterColumn = richTable.querySelector('#filterColumn');
    if (filterColumn.style.display === '') {
      FilterFunctions.hideFilter(richTable);
    } else {
      FilterFunctions._showFilter(richTable);
    }
  }

  static hideFilter(richTable) {
    const filterColumn = richTable.querySelector('#filterColumn');
    const dataTableColumn = richTable.querySelector('#dataTableColumn');
    filterColumn.style.display = 'none';
    dataTableColumn.setAttribute('size', '12');
  }

  static _showFilter(richTable) {
    const filterColumn = richTable.querySelector('#filterColumn');
    const dataTableColumn = richTable.querySelector('#dataTableColumn');
    filterColumn.style.display = '';
    dataTableColumn.setAttribute('size', dataTableColumnSize);
  }
}

