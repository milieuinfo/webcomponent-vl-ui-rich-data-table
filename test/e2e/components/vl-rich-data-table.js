const { VlElement } = require('vl-ui-core').Test;
const { By } = require('vl-ui-core').Test.Setup;
const { VlPager } = require('vl-ui-pager').Test;
const { VlDataTable } = require('vl-ui-data-table').Test;
const { VlSearchFilter } = require('vl-ui-search-filter').Test;
const { VlButton } = require('vl-ui-button').Test;
const VlRichDataSorter = require('./vl-rich-data-sorter');

class VlRichDataTable extends VlElement {
	async getPager() {
        const slot = await this.shadowRoot.findElement(By.css('slot[name="pager"]'));
	    const assignedElements = await this.getAssignedElements(slot);
	    return new VlPager(this.driver, assignedElements[0]);
	}

	async getDataTable() {
		const dataTable = await this.shadowRoot.findElement(By.css("[is='vl-data-table']"));
		return new VlDataTable(this.driver, dataTable);
	}

	async toggleSortOfColumn(index) {
		const dataTable = await this.getDataTable();
		const header = await dataTable.getDataTableHeader();
		const headerRows = await header.getRows();
		const cells = await headerRows[0].getCells();
		const link = await cells[index].findElement(By.css("a"));
		return link.click();
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
		const searchFilter = await this.findElement(By.css("[is='vl-search-filter']"));
		return new VlSearchFilter(this.driver, searchFilter);
	}

	async search() {
		const button = await this._getSearchButton();
		return button.click();
	}

	async _getSearchButton() {
		const searchFilter = await this.getSearchFilter();
		return new VlButton(this.driver, await searchFilter.findElement(By.css('button')));
	}
}

module.exports = VlRichDataTable;
