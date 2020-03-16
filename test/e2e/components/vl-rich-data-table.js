const { VlElement } = require('vl-ui-core').Test;
const { By } = require('vl-ui-core').Test.Setup;
const { VlPager } = require('vl-ui-pager').Test;
const { VlDataTable } = require('vl-ui-data-table').Test;

class VlRichDataTable extends VlElement {  

	async getPager() {
        const slot = await this.shadowRoot.findElement(By.css('slot[name="pager"]'));
	    const assignedElements = await this.getAssignedElements(slot);
	    return new VlPager(this.driver, assignedElements[0]);
	}

	async getDataTable() {
		const dataTable = await this.shadowRoot;
		return new VlDataTable(this.driver, dataTable);
	}
	
}

module.exports = VlRichDataTable;
