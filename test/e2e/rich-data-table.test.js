const { assert, driver } = require('vl-ui-core').Test.Setup;
const VlRichDataTablePage = require('./pages/vl-rich-data-table.page');

describe('vl-rich-data-table', async () => {
    const vlRichDataTablePage = new VlRichDataTablePage(driver);

    before(() => {
        return vlRichDataTablePage.load();
    });

	it('Als gebruiker kan ik de hoofdingen van een rich data table zien', async () => {
		const vlRichDataTable = await vlRichDataTablePage.getRichDataTable();
		await assertHeaders(vlRichDataTable, [ "ID", "Naam", "Naam manager", "Eerste medewerker", "Project o.l.v. manager" ]);
	});

    it('Als gebruiker kan ik allerlei soorten selectoren gebruiken voor velden van een rich data table', async () => {
    	const vlRichDataTable = await vlRichDataTablePage.getRichDataTable();
    	await assertAantalRows(vlRichDataTable, 2);
		await assertRow(vlRichDataTable, 0, [0, "Project #1", "Riquier", "Kleykens", "Project #1 o.l.v. Pascal Riquier"]);
		await assertRow(vlRichDataTable, 1, [1, "Project #2", "Coemans", "Wauters", "Project #2 o.l.v. Tom Coemans"]);
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

    it('Als gebruiker kan ik sorteren op de kolommen van een rich data table', async () => {
		const vlRichDataTableSorting = await vlRichDataTablePage.getRichDataTableSorting();
		await assertAantalRows(vlRichDataTableSorting, 2);
		await assertRow(vlRichDataTableSorting, 0, [0, "Project #1", "Jan Jansens"]);
		await assertRow(vlRichDataTableSorting, 1, [1, "Project #2", "Jan Jansens"]);

		const idSorter = await vlRichDataTableSorting.getSorter('id');
		const nameSorter = await vlRichDataTableSorting.getSorter('name');
		const ownerSorter = await vlRichDataTableSorting.getSorter('owner');

		await assert.eventually.isTrue(idSorter.isAscending());
		await assert.eventually.isFalse(idSorter.isDescending());
		await assert.eventually.isFalse(idSorter.isUnsorted());
		await assert.eventually.equal(idSorter.getPriority(), "3");
		await assert.eventually.isTrue(nameSorter.isAscending());
		await assert.eventually.isFalse(nameSorter.isDescending());
		await assert.eventually.isFalse(nameSorter.isUnsorted());
		await assert.eventually.equal(nameSorter.getPriority(), "2");
		await assert.eventually.isFalse(ownerSorter.isAscending());
		await assert.eventually.isTrue(ownerSorter.isDescending());
		await assert.eventually.isFalse(ownerSorter.isUnsorted());
		await assert.eventually.equal(ownerSorter.getPriority(), "1");

		// Zet alle sortering af.
		await ownerSorter.toggleSorting();
		await assertRow(vlRichDataTableSorting, 0, [0, "Project #1", "Jan Jansens"]);
		await assertRow(vlRichDataTableSorting, 1, [1, "Project #2", "Jan Jansens"]);

		await ownerSorter.toggleSorting();
		await assertRow(vlRichDataTableSorting, 0, [0, "Project #1", "Jan Jansens"]);
		await assertRow(vlRichDataTableSorting, 1, [1, "Project #2", "Jan Jansens"]);

		await nameSorter.toggleSorting();
		await assertRow(vlRichDataTableSorting, 0, [0, "Project #1", "Jan Jansens"]);
		await assertRow(vlRichDataTableSorting, 1, [1, "Project #2", "Jan Jansens"]);

		await idSorter.toggleSorting();
		await assertRow(vlRichDataTableSorting, 0, [0, "Project #1", "Jan Jansens"]);
		await assertRow(vlRichDataTableSorting, 1, [1, "Project #2", "Jan Jansens"]);

		await assert.eventually.isTrue(idSorter.isUnsorted());
		await assert.eventually.isTrue(nameSorter.isUnsorted());
		await assert.eventually.isTrue(ownerSorter.isUnsorted());
		await assert.eventually.equal(idSorter.getPriority(), "");
		await assert.eventually.equal(nameSorter.getPriority(), "");
		await assert.eventually.equal(ownerSorter.getPriority(), "");

		// Sorteer op owner, descending. Het resultaat blijft hetzelfde aangezien owner gelijk is voor alle rijen.
		await ownerSorter.toggleSorting();
		await assertRow(vlRichDataTableSorting, 0, [0, "Project #1", "Jan Jansens"]);
		await assertRow(vlRichDataTableSorting, 1, [1, "Project #2", "Jan Jansens"]);
		await assert.eventually.isTrue(ownerSorter.isDescending());
		await assert.eventually.equal(ownerSorter.getPriority(), "1");

		// Sorteer op owner, ascending. Het resultaat blijft hetzelfde aangezien owner gelijk is voor alle rijen.
		await ownerSorter.toggleSorting();
		await assertRow(vlRichDataTableSorting, 0, [0, "Project #1", "Jan Jansens"]);
		await assertRow(vlRichDataTableSorting, 1, [1, "Project #2", "Jan Jansens"]);
		await assert.eventually.isTrue(ownerSorter.isAscending());
		await assert.eventually.equal(ownerSorter.getPriority(), "1");

		// Sorteer op naam, descending.
		await nameSorter.toggleSorting();
		await assertRow(vlRichDataTableSorting, 0, [1, "Project #2", "Jan Jansens"]);
		await assertRow(vlRichDataTableSorting, 1, [0, "Project #1", "Jan Jansens"]);
		await assert.eventually.isTrue(nameSorter.isDescending());
		await assert.eventually.equal(nameSorter.getPriority(), "2");

		// Sorteer op naam, ascending.
		await nameSorter.toggleSorting();
		await assertRow(vlRichDataTableSorting, 0, [0, "Project #1", "Jan Jansens"]);
		await assertRow(vlRichDataTableSorting, 1, [1, "Project #2", "Jan Jansens"]);
		await assert.eventually.isTrue(nameSorter.isAscending());
		await assert.eventually.equal(nameSorter.getPriority(), "2");
	});

	it('Als gebruiker zie ik het onderscheid tussen een collapsed-medium rich-data-table en een zonder', async() => {
		const richDatatableWithCollapsedMedium = await vlRichDataTablePage.getRichDataTableCollapsedMedium();
		await assert.eventually.isTrue(richDatatableWithCollapsedMedium.isCollapsedMedium());
		const richDatatableWithoutCollapsedMedium = await vlRichDataTablePage.getRichDataTablePaging();
		await assert.eventually.isFalse(richDatatableWithoutCollapsedMedium.isCollapsedMedium());
	});

	it('Als gebruiker zie ik het onderscheid tussen een collapsed-small rich-data-table en een zonder', async() => {
		const richDatatableWithCollapsedSmall = await vlRichDataTablePage.getRichDataTableCollapsedSmall();
		await assert.eventually.isTrue(richDatatableWithCollapsedSmall.isCollapsedSmall());
		const richDatatableWithoutCollapsedSmall = await vlRichDataTablePage.getRichDataTablePaging();
		await assert.eventually.isFalse(richDatatableWithoutCollapsedSmall.isCollapsedSmall());
	});

	it('Als gebruiker zie ik het onderscheid tussen een collapsed-extra-small rich-data-table en een zonder', async() => {
		const richDatatableWithCollapsedExtraSmall = await vlRichDataTablePage.getRichDataTableCollapsedExtraSmall();
		await assert.eventually.isTrue(richDatatableWithCollapsedExtraSmall.isCollapsedExtraSmall());
		const richDatatableWithoutCollapsedExtraSmall = await vlRichDataTablePage.getRichDataTablePaging();
		await assert.eventually.isFalse(richDatatableWithoutCollapsedExtraSmall.isCollapsedExtraSmall());
	});

	it('Als gebruiker kan ik de titel van een search filter zien', async () => {
		const richDataTableWithFilter = await vlRichDataTablePage.getRichDataTableFilter();
		await assert.eventually.equal(richDataTableWithFilter.getFilterTitle(), 'Verfijn uw zoekopdracht');
		const searchFilter = await richDataTableWithFilter.getSearchFilter();
		// await assert.eventually.equal(searchFilter.getTitleText(), 'Verfijn uw zoekopdracht');
	});

    async function assertHeaders(richDataTable, expectedHeaders) {
    	const table = await richDataTable.getDataTable();
    	const headers = await table.getDataTableHeader();
		const rows = await headers.getRows();
		const cells = await rows[0].getCells();
		await assertCells(cells, expectedHeaders);
	}

    async function assertAantalRows(richDataTable, aantal) {
    	const table = await richDataTable.getDataTable();
    	const body = await table.getDataTableBody();
    	await assert.eventually.lengthOf(body.getRows(), aantal);
    }
    
    async function assertRow(richDataTable, index, values) {
    	const table = await richDataTable.getDataTable();
    	const body = await table.getDataTableBody();
    	const rows = await body.getRows();
    	const cells = await rows[index].getCells();
    	await assertCells(cells, values);
    }

    async function assertCells(cells, values) {
		assert.lengthOf(cells, values.length);
		for (let i = 0; i < cells.length; i++) {
			await assert.eventually.equal(cells[i].getText(), values[i])
		}
	}
});
