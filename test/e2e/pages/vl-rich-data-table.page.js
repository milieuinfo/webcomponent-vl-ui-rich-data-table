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

    async load() {
        await super.load(Config.baseUrl + '/demo/vl-rich-data-table.html');
    }
}

module.exports = VlRichDataTablePage;
