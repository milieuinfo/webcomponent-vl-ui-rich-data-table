const {VlElement} = require('vl-ui-core').Test;
const {By} = require('vl-ui-core').Test.Setup;
const {VlPager} = require('vl-ui-pager').Test;
const {VlDataTable} = require('vl-ui-data-table').Test;
const {VlSearchFilter} = require('vl-ui-search-filter').Test;
const {VlModal} = require('vl-ui-modal').Test;
const VlRichDataSorter = require('./vl-rich-data-sorter');

class VlRichDataTable extends VlElement {
  async getPager() {
    const slot = await this.shadowRoot.findElement(By.css('slot[name="pager"]'));
    const assignedElements = await this.getAssignedElements(slot);
    return new VlPager(this.driver, assignedElements[0]);
  }

  async getDataTable() {
    const dataTable = await this.shadowRoot.findElement(By.css('[is=\'vl-data-table\']'));
    return new VlDataTable(this.driver, dataTable);
  }

  async toggleSortOfColumn(field) {
    const sorter = await this.getSorter(field);
    const parent = await sorter.findElement(By.xpath('..'));
    return parent.click();
  }

  async closeFilter() {
    const button = await this.shadowRoot.findElement(By.css('#close-filter-button'));
    return button.click();
  }

  async toggleFilter() {
    const button = await this.shadowRoot.findElement(By.css('#toggle-filter-button'));
    return button.click();
  }

  async openModalFilter() {
    const button = await this.shadowRoot.findElement(By.css('#open-filter-button'));
    return button.click();
  }

  async closeModalFilter() {
    const modalElement = await this.shadowRoot.findElement(By.css('#filter-modal'));
    const modal = await new VlModal(this.driver, modalElement);
    return modal.close();
  }

  async getSorter(field) {
    const element = await this.shadowRoot.findElement(By.css(`vl-rich-data-sorter[data-vl-for="${field}"]`));
    return new VlRichDataSorter(this.driver, element);
  }

  async isCollapsedMedium() {
    return this.hasAttribute('data-vl-collapsed-m');
  }

  async isCollapsedSmall() {
    return this.hasAttribute('data-vl-collapsed-s');
  }

  async isCollapsedExtraSmall() {
    return this.hasAttribute('data-vl-collapsed-xs');
  }

  async isMultisortingEnabled() {
    return this.hasAttribute('data-vl-multisort');
  }

  async getSearchFilter() {
    const searchFilter = await this.findElement(By.css('[is=\'vl-search-filter\']'));
    return new VlSearchFilter(this.driver, searchFilter);
  }
}

module.exports = VlRichDataTable;
