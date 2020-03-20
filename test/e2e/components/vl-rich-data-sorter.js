const { VlElement } = require('vl-ui-core').Test;
const { By } = require('vl-ui-core').Test.Setup;
const { VlIcon } = require('vl-ui-icon').Test;

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

	async toggle() {
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

module.exports = VlRichDataSorter;