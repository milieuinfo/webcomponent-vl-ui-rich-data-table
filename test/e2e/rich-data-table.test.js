const { assert, driver } = require('vl-ui-core').Test.Setup;
const VLRichDataTablePage = require('./pages/vl-rich-data-table.page');

describe('vl-rich-data-table', async () => {
    const VLRichDataTablePage = new VLRichDataTablePage(driver);

    before(() => {
        return VLRichDataTablePage.load();
    });

    it('', async () => {
    });

});
