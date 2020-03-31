const { VlElement } = require('vl-ui-core').Test;
const { By } = require('vl-ui-core').Test.Setup;
const { VlIcon } = require('vl-ui-icon').Test;

class VlRichDataSorter extends VlElement {
	async isDescending() {
		return this._hasDirectionIcon('arrow-up');
	}

	async isAscending() {
		return this._hasDirectionIcon('arrow-down');
	}

	async isUnsorted() {
		return this._hasDirectionIcon('');
	}

	async getPriority() {
		const priorityLabel = await this._getPriorityLabel();
		return priorityLabel.getText();
	}

	async _hasDirectionIcon(expectedIconType) {
		const iconType = await this._getDirectionIconType();
		return iconType === expectedIconType;
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