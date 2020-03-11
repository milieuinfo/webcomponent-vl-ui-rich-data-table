const VLRichDataTable = require('../components/vl-rich-data-table');
const { Page, Config } = require('vl-ui-core').Test;

class VLRichDataTablePage extends Page {
    async _getRichDataTable(selector) {
        return new VlRichDataTable(this.driver, selector);
    }

    async load() {
        await super.load(config.baseUrl);
    }
}

module.exports = VLRichDataTablePage;
