const { assert, driver } = require('vl-ui-core').Test.Setup;
const VLRichDataTablePage = require('./pages/vl-rich-data-table.page');

describe('vl-rich-data-table', async () => {
    const vLRichDataTablePage = new VLRichDataTablePage(driver);

    before(() => {
        return vLRichDataTablePage.load();
    });

    it('', async () => {
    });

});
