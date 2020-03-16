const { assert, driver } = require('vl-ui-core').Test.Setup;
const VlRichDataTablePage = require('./pages/vl-rich-data-table.page');

describe('vl-rich-data-table', async () => {
    const vlRichDataTablePage = new VlRichDataTablePage(driver);

    before(() => {
        return vlRichDataTablePage.load();
    });

    it('Als gebruiker kan ik pagineren door de verschillende paginas van een rich data table', async () => {
    	const vlRichDataTablePaging = await vlRichDataTablePage.getRichDataTablePaging();
    	const pager = await vlRichDataTablePaging.getPager();
    	await assertFirstRow(vlRichDataTablePaging, 1, "Project #1");
    	await pager.goToNextPage();
    	await assertFirstRow(vlRichDataTablePaging, 6, "Project #6");
    	await pager.goToPreviousPage();
    	await assertFirstRow(vlRichDataTablePaging, 1, "Project #1");
    });
    
    async function assertFirstRow(richDataTable, id, naam) {
    	const table = await richDataTable.getDataTable();
    	const body = await table.getDataTableBody();
    	assert.eventually.lengthOf(body.getRows(), 5);
    	const rows = await body.getRows();
    	const cells = await rows[0].getCells();
    	assert.equal(cells.length, 2);
    	const idCellValue = await cells[0].getText();
    	assert.equal(idCellValue, id);
    	const nameCellValue = await cells[1].getText();
    	assert.equal(nameCellValue, naam);
    }

});
