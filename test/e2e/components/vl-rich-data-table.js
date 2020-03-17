const { VlElement } = require('vl-ui-core').Test;
const { By } = require('vl-ui-core').Test.Setup;
const { VlPager } = require('vl-ui-pager').Test;
const { VlDataTable } = require('vl-ui-data-table').Test;
const { VlIcon } = require('vl-ui-icon').Test;

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
}

class VlRichDataSorter extends VlElement {
	async isDescending() {
		return this._hasDirectionIcon('nav-down');
	}

	async isAscending() {
		return this._hasDirectionIcon('nav-up');
	}

	async isUnsorted() {
		return this._hasDirectionIcon('sort');
	}

	async getPriority() {
		const priorityLabel = await this._getPriorityLabel();
		return priorityLabel.getText();
	}

	async toggleSorting() {
		const icon = await this._getDirectionIcon();
		await icon.click();
	}

	async _hasDirectionIcon(expectedIconType) {
		const iconType = await this._getDirectionIconType();
		return iconType === expectedIconType;
	}

	async _getDirection() {
		return this.getAttribute('direction');
	}

	async _getDirectionIcon() {
		const element = await this.shadowRoot.findElement(By.css('#direction'));
		return new VlIcon(this.driver, element);
	}

	async _getDirectionIconType() {
		const icon = await this._getDirectionIcon();
		return icon.getType();
	}

	async _getPriorityLabel() {
		return this.shadowRoot.findElement(By.css('#priority'));
	}
}

module.exports = VlRichDataTable;
