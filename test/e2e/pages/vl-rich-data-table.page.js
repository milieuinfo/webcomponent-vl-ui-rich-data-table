const {Page, Config} = require('vl-ui-core').Test;
const {By} = require('vl-ui-core').Test.Setup;
const VlRichDataTable = require('../components/vl-rich-data-table');

class VlRichDataTablePage extends Page {
  async _getRichDataTable(selector) {
    return new VlRichDataTable(this.driver, selector);
  }

  async getRichDataTablePaging() {
    return this._getRichDataTable('#rich-data-table-paging');
  }

  async getRichDataTable() {
    return this._getRichDataTable('#rich-data-table');
  }

  async getRichDataTableSorting() {
    return this._getRichDataTable('#rich-data-table-sorting');
  }

  async getRichDataTableMultiSorting() {
    return this._getRichDataTable('#rich-data-table-multi-sorting');
  }

  async getRichDataTableCollapsedMedium() {
    return this._getRichDataTable('#rich-data-table-collapsed-medium');
  }

  async getRichDataTableCollapsedSmall() {
    return this._getRichDataTable('#rich-data-table-collapsed-small');
  }

  async getRichDataTableCollapsedExtraSmall() {
    return this._getRichDataTable('#rich-data-table-collapsed-extra-small');
  }

  async getRichDataTableFilter() {
    return this._getRichDataTable('#rich-data-table-filter');
  }

  async getRichDataTableFilterSortingPaging() {
    return this._getRichDataTable('#rich-data-table-filter-sorting-paging');
  }

  async submitSearchFilter(searchFilter) {
    const button = await searchFilter.findElement(By.css('button[type="button"]'));
    await button.click();
  }

  async load() {
    await super.load(Config.baseUrl + '/demo/vl-rich-data-table.html');
  }
}

module.exports = VlRichDataTablePage;
