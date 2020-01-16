import {define} from "/node_modules/vl-ui-core/vl-core.js";
import {VlRichTable} from "./src/vl-rich-data-table";
import {VlRichTableField} from "./src/vl-rich-data-table-field";
import {VlRichTablePager} from "./src/vl-rich-data-table-pager";

define('vl-rich-data-table', VlRichTable);
define('vl-rich-data-table-field', VlRichTableField);
define('vl-rich-data-table-pager', VlRichTablePager);

export * from "./src/vl-rich-data-table";
export * from "./src/vl-rich-data-table-field";
export * from "./src/vl-rich-data-table-pager";
export * from "./src/domain/filter";
export * from "./src/domain/sortable";