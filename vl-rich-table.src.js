import {define} from "/node_modules/vl-ui-core/vl-core.js";
import {VlRichTable} from "./src/vl-rich-table";
import {VlRichTableField} from "./src/vl-rich-table-field";
import {VlRichTablePager} from "./src/vl-rich-table-pager";

define('vl-rich-table', VlRichTable);
define('vl-rich-table-field', VlRichTableField);
define('vl-rich-table-pager', VlRichTablePager);

export * from "./src/vl-rich-table";
export * from "./src/vl-rich-table-field";
export * from "./src/vl-rich-table-pager";
export * from "./src/domain/sortable";