import {VlElement, define} from '/node_modules/vl-ui-core/dist/vl-core.js';
import '/node_modules/vl-ui-data-table/dist/vl-data-table.js';
import '/node_modules/vl-ui-grid/dist/vl-grid.js';

import { VlRichDataField } from "./vl-rich-data-field.js";
import { VlRichDataSorter } from "./vl-rich-data-sorter.js";

/**
 * VlRichDataTable
 * @class
 * @classdesc Een tabel op basis van een dynamische lijst van data die uitgebreid kan worden met functionaliteiten die het consumeren van de data door een gebruiker kunnen verbeteren.
 *
 * @extends VlElement
 *
 * @property {string} data-vl-data - De data die door de tabel getoond moet worden in JSON formaat.
 * @property {boolean} data-vl-collaped-m - Vanaf een medium schermgrootte zullen de cellen van elke rij onder elkaar ipv naast elkaar getoond worden.
 * @property {boolean} data-vl-collaped-s - Vanaf een small schermgrootte zullen de cellen van elke rij onder elkaar ipv naast elkaar getoond worden.
 * @property {boolean} data-vl-collaped-xs - Vanaf een extra small schermgrootte zullen de cellen van elke rij onder elkaar ipv naast elkaar getoond worden.
 * @property {boolean} data-vl-multisort - Laat de gebruiker sorteren op meer dan 1 kolom.
 * 
 * @slot filter - slot dat de velden bevat waarop gefilterd wordt. De formData van de search filter worden via een change event doorgegeven bij een wijziging. 
 * 
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-data-table/releases/latest|Release notes}
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-data-table/issues|Issues}
 * @see {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-rich-data-table.html|Demo}
 *
 */
export class VlRichDataTable extends VlElement(HTMLElement) {
    static get _observedAttributes() {
        return ['data', 'collapsed-m', 'collapsed-s', 'collapsed-xs'];
    }
    
    static get _tableAttributes() {
        return ['data-vl-collapsed-m', 'data-vl-collapsed-s', 'data-vl-collapsed-xs'];
    }

    static get is() {
        return 'vl-rich-data-table';
    }

    constructor() {
        super(`
            <style>
                @import "/src/style.css";
                @import "/node_modules/vl-ui-data-table/dist/style.css";
            </style>
            <div is="vl-grid" is-stacked>
                <div id="search" is="vl-column" size="0">
                    <slot name="filter"></slot>
                </div>
                <div id="content" is="vl-column" size="12">
                    <table is="vl-data-table">
                        <thead>
                            <tr></tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
                <div id="pager" is="vl-column" size="12">
                    <slot name="pager"></slot>
                </div>
            </div>
        `);

        this.__processSearchFilter();
        
        this.__observeFields();
        this.__observeSorters();
        this.__observePager();
    }
    
    attributeChangedCallback(attr, oldValue, newValue) {
    	super.attributeChangedCallback(attr, oldValue, newValue);
    	if (VlRichDataTable._tableAttributes.includes(attr)) {
    		this.__setTableAttribute(attr, oldValue, newValue);
    	}
    }

    __setTableAttribute(attr, oldValue, newValue) {
    	const withoutDataVlPrefix = attr.substring("data-vl-".length);
    	if (newValue != null) {
    		this.__table.setAttribute(withoutDataVlPrefix, "");
    	} else {
    		this.__table.removeAttribute(withoutDataVlPrefix);
    	}
    }
    
    get __pager() {
    	return this.querySelector("[slot='pager']");
    }

    get __filter() {
    	return this.querySelector("[slot='filter']");
    }

    get __searchColumn() {
        return this.shadowRoot.querySelector('#search');
    }

    get __contentColumn() {
        return this.shadowRoot.querySelector('#content');
    }

    get __searchFilter() {
        if (this.__filter) {
            return this.__filter.querySelector('[is="vl-search-filter"]');
        }
    }

    get __searchFilterForm() {
        if (this.__searchFilter) {
            return this.__searchFilter.querySelector('form');
        }
    }
    
    __onStateChange(event, {paging = false}={}) {
    	event.stopPropagation();
    	event.preventDefault();
    	this.dispatchEvent(new CustomEvent('change', {
            detail: this.__getState({paging}), 
            bubbles: true
        }));
    }
    
    get __pagingState() {
    	if (this.__pager) {
    		return {
    			currentPage: Number(this.__pager.currentPage), 
    			totalPages: this.__pager.totalPages, 
    			itemsPerPage: this.__pager.itemsPerPage, 
    			totalItems: this.__pager.totalItems	
    		};
    	}
    }

    get __sortingState() {
        if (this.__activeSorters && this.__activeSorters.length > 0) {
            return this.__activeSorters.map(criteria => { 
                return {
                    name: criteria.for,
                    direction: criteria.direction
                }
            });
        }
    }

    get __formDataState() {
        if (this.__searchFilter && this.__searchFilter.formData) {
            const bevatFiltering = [... this.__searchFilter.formData.values()].find(Boolean);
            if (bevatFiltering) {
                return this.__searchFilter.formData;
            }
        }
    }
    
    __getState({paging}) {
    	const state = {};
        state.sorting = this.__sortingState;
        state.formData = this.__formDataState;
        state.paging = this.__pagingState;
        if (!paging && state.paging) {
            state.paging.currentPage = 1;
        }
    	return state;
    }

    get _isMultisortingEnabled() {
        return this.dataset.vlMultisort !== undefined;
    }

    connectedCallback() {
        this._render();
    }

    /**
     * Stelt in welke data de tabel moet tonen.
     * @param {Object[]} data - Een Array van objecten die de data voorstellen.
     */
    set data(object) {
        if (this.__data !== object) {
            const { data, paging } = object
            this._data = data;
            this._paging = paging;

            this.__data = object;
            this._renderBody();
        }
    }

    set _data(data) {
        if (data) {
            if (!Array.isArray(data)) {
                throw new Error('vl-rich-data-table verwacht een Array als data');
            }
        }
    }

    set _paging(paging) {
        if (paging) {
            !paging.currentPage || this.__pager.setAttribute('current-page', paging.currentPage);
            !paging.itemsPerPage || this.__pager.setAttribute('items-per-page', paging.itemsPerPage);
            !paging.totalItems || this.__pager.setAttribute('total-items', paging.totalItems);
        }
    }

    /**
     * Geeft de data terug die de tabel toont.
     * @returns {Object[]}
     */
    get data() {
        return this.__data || {data: []};
    }

    _render() {
        this._renderHeaders();
        this._renderBody();
    }

    _renderHeaders() {
        this.__tableHeaderRow.innerHTML = '';
        this.__fields.forEach(field => {
            const headerTemplate = field.renderCellHeader ? this._template(field.renderCellHeader()) : this._template('<th></th>');
            this.__tableHeaderRow.appendChild(headerTemplate);
        });
        this.__tableHeaderRow.querySelectorAll("th.sortable > a").forEach(th => { th.addEventListener('click', e => 	{
        	th.querySelector("vl-rich-data-sorter").nextDirection();
        })});
    }

    _renderBody() {
        if (this.data && this.data.data) {
            this.__tableBody.innerHTML = '';
            this.data.data.forEach(rowData => {
                const rowTemplate = this._template(`<tr>
                    ${Array.from(this.__fields)
                    .map(field => field.renderCellValue ? field.renderCellValue(rowData) : '<td></td>')
                    .join('')}
                </tr>`);
                this.__tableBody.appendChild(rowTemplate);
            });
        }
    }

    get __searchFilterLocation() {
        return this.shadowRoot.querySelector('#search');
    }

    _dataChangedCallback(oldValue, newValue) {
        this.data = JSON.parse(newValue);
    }

    get __table() {
        return this.shadowRoot.querySelector('table');
    }

    get __tableHeaderRow() {
        return this.__table.querySelector('thead > tr');
    }

    get __tableBody() {
        return this.__table.querySelector('tbody');
    }

    get __fields() {
        return this.querySelectorAll(VlRichDataField.is);
    }

    get __sorters() {
        return this.__tableHeaderRow.querySelectorAll(VlRichDataSorter.is);
    }

    get __activeSorters() {
        return Array.from(this.__sorters)
            .filter(sorter => sorter.direction !== undefined)
            .sort(VlRichDataSorter.PRIORITY_COMPARATOR);
    }

    __listenToFieldChanges(field) {
        field.addEventListener('change', this.__fieldChanged.bind(this));
    }

    __stopListeningToFieldChanges(field) {
        field.removeEventListener('change', this.__fieldChanged.bind(this));
    }

    __listenToSortChanges(sorter) {
        sorter.addEventListener('change', this.__sortingChanged.bind(this));
    }

    __stopListeningToSortChanges(sorter) {
        sorter.removeEventListener('change', this.__sortingChanged.bind(this));
    }

    __fieldChanged(event) {
        const propertiesChanged = event.detail.properties;
        if (propertiesChanged) {
            if (propertiesChanged.some(property => ['name', 'label', 'sortable', 'sorting-direction', 'sorting-priority'].includes(property))) {
                this._renderHeaders();
            }

            if (propertiesChanged.some(property => ['selector'].includes(property))) {
                this._renderBody();
            }
        }
    }

    __sortingChanged(event) {
        if(this._isMultisortingEnabled) {
            this.__activeSorters.forEach((sorter, index) => sorter.priority = index + 1);
        } else {
            this.__activeSorters.filter(sorter => sorter !== event.target).forEach(sorter => sorter.direction = undefined);
        }
        this.__onStateChange(event);
    }

    __observeFields() {
        this.__fields.forEach(this.__listenToFieldChanges.bind(this));
        const observer = new MutationObserver(mutationsList => {
            let shouldRender = false;
            mutationsList.forEach(mutation => {
                if (mutation.addedNodes || mutation.removedNodes) {
                    shouldRender = true;

                    if (mutation.addedNodes) {
                        mutation.addedNodes.forEach(this.__listenToFieldChanges.bind(this));
                    }

                    if (mutation.removedNodes) {
                        mutation.removedNodes.forEach(this.__stopListeningToFieldChanges.bind(this));
                    }
                }
            });
            if (shouldRender) {
                this._render();
            }
        });
        observer.observe(this, {childList: true});
    }

    __observePager() {
        if (this.__pager) {
            this.__pager.setAttribute("align-right", true);
            this.__pager.addEventListener('change', e => {
                this.__onStateChange(e, {paging: true});
            });
        }
    }

    __observeSorters() {
        const observer = new MutationObserver(mutationsList => {
            mutationsList.forEach(mutation => {
                if (mutation.addedNodes || mutation.removedNodes) {
                    if (mutation.addedNodes) {
                        mutation.addedNodes.forEach(node => {
                            const sorter = node.querySelector(VlRichDataSorter.is);
                            if (sorter) {
                                this.__listenToSortChanges(sorter);
                            }
                        });
                    }

                    if (mutation.removedNodes) {
                        mutation.removedNodes.forEach(node => {
                            const sorter = node.querySelector(VlRichDataSorter.is);
                            if (sorter) {
                                this.__stopListeningToSortChanges(sorter);
                            }
                        });
                    }
                }
            });
        });
        observer.observe(this.__tableHeaderRow, {childList: true});
    }

    __processSearchFilter() {
        if (this.__searchFilter) {
            this.__searchFilter.setAttribute('alt', '');
            this.__setGridColumnWidth(4);
            this.__observeSearchFilter();
        } else {
            this.__setGridColumnWidth(0);
        }
    }

    __observeSearchFilter() {
        if (this.__searchFilter) {
            this.__searchFilter.addEventListener('change', e => {
                e.stopPropagation();
                e.preventDefault();
            });
            this.__searchFilter.addEventListener('input', e => {
                this.__onFilterFieldChanged(e);
            });
            if (this.__searchFilterForm) {
                this.__searchFilterForm.addEventListener('reset', e => {
                    setTimeout(() => {
                        this.__onFilterFieldChanged(e);
                    });
                });
            }

            const observer = new MutationObserver(() => {
                this.__processSearchFilter();
            });
            observer.observe(this, { childList: true, subtree: true });
        }
    }

    __setGridColumnWidth(width) {
        this.__searchColumn.setAttribute('size', width);
        this.__contentColumn.setAttribute('size', 12-width);
    }

    __onFilterFieldChanged(event) {
    	event.stopPropagation();
        event.preventDefault();
    	this.__onStateChange(event);
    }
}





define(VlRichDataTable.is, VlRichDataTable);
