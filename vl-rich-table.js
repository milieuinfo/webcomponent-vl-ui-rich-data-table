import{VlElement,define}from"/node_modules/vl-ui-core/vl-core.js";import{VlDataTable}from"/node_modules/vl-ui-data-table/vl-data-table.js";import{VlPager}from"/node_modules/vl-ui-pager/vl-pager.js";export class VlRichTable extends VlElement(HTMLElement){static get _observedAttributes(){return["data"]}constructor(){super(`
        <style>
          @import "/node_modules/vl-ui-data-table/style.css";
        </style>

        <slot></slot>
        <table is="vl-data-table" zebra>
          <thead>
            <tr>
            </tr>
          </thead>
          <tfoot>
            <tr id="vl-rich-table-foot">
            </tr>
          </tfoot>
          <tbody>
          </tbody>
        </table>
        `);this._data=[];const slot=this.shadowRoot.querySelector("slot");slot.addEventListener("slotchange",()=>this._createRows())}_createRows(){Array.from(this._tableBody.children).forEach(child=>child.remove());this._data.forEach(data=>{let row=document.createElement("tr");Array.from(this.children).filter(child=>{return child.tagName.toLowerCase()==="vl-rich-table-field"}).forEach(field=>{row.appendChild(this.__createTd(data[field.getAttribute("data-value")]))});this._tableBody.appendChild(row)})}_dataChangedCallback(oldValue,newValue){this.data=JSON.parse(newValue)}get data(){return this._data}set data(data){this._data=data;if(Array.from(this.children).every(child=>child.richTable===this)){this._createRows()}}__createTd(textContent){let tableData=document.createElement("td");let text=document.createTextNode(textContent);tableData.appendChild(text);return tableData}get _tableHeaderRow(){return this.shadowRoot.querySelector("thead > tr")}get _tableBody(){return this.shadowRoot.querySelector("tbody")}get _tableFooterRow(){return this.shadowRoot.querySelector("tfoot > tr")}addTableHeaderCell(cell){this._tableHeaderRow.appendChild(cell)}addTableFooterCell(cell){let td=document.createElement("td");td.setAttribute("colspan",9999);td.appendChild(cell);this._tableFooterRow.append(td)}};define("vl-rich-table",VlRichTable);export class VlRichTableField extends VlElement(HTMLElement){connectedCallback(){if(this.richTable){let headerCell=document.createElement("th");headerCell.appendChild(document.createTextNode(this.getAttribute("label")));this.richTable.addTableHeaderCell(headerCell)}else{console.log("Een VlRichTableField moet altijd als parent een vl-rich-table hebben.")}}get richTable(){if(this.parentNode&&this.parentNode.tagName.toLowerCase()==="vl-rich-table"){return this.parentNode}}};define("vl-rich-table-field",VlRichTableField);export class VlRichTablePager extends VlPager{connectedCallback(){super.connectedCallback();if(this.richTable){this.richTable.addTableFooterCell(this)}else{console.log("Een VlRichTablePager moet altijd als parent een vl-rich-table hebben.")}}get richTable(){if(this.parentNode&&this.parentNode.tagName.toLowerCase()==="vl-rich-table"){return this.parentNode}}};define("vl-rich-table-pager",VlRichTablePager);