import {VlPager} from '/node_modules/vl-ui-pager/vl-pager.js';
/**
 * VlRichTablePager
 * @class
 * @classdesc
 *
 * @extends VlPager
 *
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-pager/releases/latest|Release notes}
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-pager/issues|Issues}
 * @see {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-pager.html|Demo}
 *
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-data-table/releases/latest|Release notes}
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-data-table/issues|Issues}
 * @see {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-rich-data-table.html|Demo}
 **/
export class VlRichTablePager extends VlPager {

  connectedCallback() {
    super.connectedCallback();
    if (this._tableToInsert) {
      this._appended = true;
      this._tableToInsert.addTableFooterCell(this);
      this.addEventListener('pagechanged', (e) => {
        this.richTable.dispatchEvent(new CustomEvent('pagechanged',
            {detail: e.detail}));
      });

      this._updatePageable();
      this.richTable.addEventListener('data_update_from_object', (e) => {
        this._updatePageable();
      })
    } else if (!this._appended) {
      console.log(
          'Een VlRichTablePager moet altijd als parent een vl-rich-data-table hebben.')
    }
  }

  _updatePageable() {
    const data = this.richTable.data;
    if (data.totalElements != null && data.size && data.number + 1) {
      this.setAttribute('total-items', data.totalElements);
      this.setAttribute('items-per-page', data.size);
      this.setAttribute('current-page', data.number + 1);
    }
  }

  get _tableToInsert() {
    if (this.parentNode && this.parentNode.tagName.toLowerCase()
        === 'vl-rich-data-table') {
      return this.parentNode;
    }
  }

  get richTable() {
    if (this.getRootNode() && this.getRootNode().host
        && this.getRootNode().host.tagName.toLowerCase()
        === 'vl-rich-data-table') {
      return this.getRootNode().host;
    }
  }
}