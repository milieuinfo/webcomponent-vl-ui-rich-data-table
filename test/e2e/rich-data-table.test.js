const { assert, driver } = require('vl-ui-core').Test.Setup;
const VlRichDataTablePage = require('./pages/vl-rich-data-table.page');

describe('vl-rich-data-table', async () => {
    const vlRichDataTablePage = new VlRichDataTablePage(driver);

    before(() => {
        return vlRichDataTablePage.load();
    });

    it('Als gebruiker kan ik allerlei soorten selectoren gebruiken voor velden van een rich table', async () => {
    	const vlRichDataTable = await vlRichDataTablePage.getRichDataTable();
    	await assertAantalRows(vlRichDataTable, 2);
    	await assertRow(vlRichDataTable, 0, [0, "Project #1", "Riquier", "Kleykens"]);
    });

    it('Als gebruiker kan ik pagineren door de verschillende paginas van een rich data table', async () => {
    	const vlRichDataTablePaging = await vlRichDataTablePage.getRichDataTablePaging();
    	await assertAantalRows(vlRichDataTablePaging, 5);
    	await assertRow(vlRichDataTablePaging, 0, [1, "Project #1"]);
    	const pager = await vlRichDataTablePaging.getPager();
    	await pager.goToNextPage();
    	await assertAantalRows(vlRichDataTablePaging, 5);
    	await assertRow(vlRichDataTablePaging, 0, [6, "Project #6"]);
    	await pager.goToPreviousPage();
    	await assertAantalRows(vlRichDataTablePaging, 5);
    	await assertRow(vlRichDataTablePaging, 0, [1, "Project #1"]);
    });
    
    async function assertAantalRows(richDataTable, aantal) {
    	const table = await richDataTable.getDataTable();
    	const body = await table.getDataTableBody();
    	assert.eventually.lengthOf(body.getRows(), aantal);
    }
    
    async function assertRow(richDataTable, index, values) {
    	const table = await richDataTable.getDataTable();
    	const body = await table.getDataTableBody();
    	const rows = await body.getRows();
    	const cells = await rows[index].getCells();
    	assert.equal(cells.length, values.length);
    	for (let i = 0; i < cells.length; i++) {
    		const cellValue = await cells[i].getText();
    		assert.equal(cellValue, values[i]);
    	}
    }

});
