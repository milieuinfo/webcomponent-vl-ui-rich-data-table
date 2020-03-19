const VlRichDataTable = require('../components/vl-rich-data-table');
const { Page, Config } = require('vl-ui-core').Test;

class VlRichDataTablePage extends Page {
    async _getRichDataTable(selector) {
        return new VlRichDataTable(this.driver, selector);
    }
    
    async getRichDataTablePaging() {
    	return this._getRichDataTable("#rich-data-table-paging");
    }

    async getRichDataTable() {
    	return this._getRichDataTable("#rich-data-table");
    }

    async getRichDataTableSorting() {
        return this._getRichDataTable("#rich-data-table-sorting");
    }

    async getRichDataTableMultiSorting() {
        return this._getRichDataTable("#rich-data-table-multi-sorting");
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
        return this._getRichDataTable('#rich-data-table-filter')
    }

    async load() {
        await super.load(Config.baseUrl + '/demo/vl-rich-data-table.html');
    }
}

module.exports = VlRichDataTablePage;
