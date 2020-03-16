import {VlElement, define} from '/node_modules/vl-ui-core/dist/vl-core.js';
import '/node_modules/vl-ui-data-table/dist/vl-data-table.js';
import '/node_modules/vl-ui-search-filter/dist/vl-search-filter.js';
import '/node_modules/vl-ui-grid/dist/vl-grid.js';

/**
 * VlRichDataTable
 * @class
 * @classdesc Een tabel op basis van een dynamische lijst van data die uitgebreid kan worden met functionaliteiten die het consumeren van de data door een gebruiker kunnen verbeteren.
 *
 * @extends VlElement
 *
 * @property {String} data-vl-data - De data die door de tabel getoond moet worden in JSON formaat.
 * @property {String} data-vl-filter-title - De titel die op de search filter getoond wordt.
 *
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-data-table/releases/latest|Release notes}
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-data-table/issues|Issues}
 * @see {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-rich-data-table.html|Demo}
 *
 */
export class VlRichDataTable extends VlElement(HTMLElement) {
    static get _observedAttributes() {
        return ['data-vl-data', 'data-vl-filter-title'];
    }

    constructor() {
        super(`
            <style>
                @import "/src/style.css";
                @import "/node_modules/vl-ui-data-table/dist/style.css";
            </style>
            <div is="vl-grid" is-stacked>
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
        this.__observeFields();
        this._renderSearchFilter();
        if (this.__pager) {
        	this.__pager.setAttribute("align-right", true);
        	this.__pager.addEventListener('change', e => {
        		this.__onStateChange(e);
        	});
        }
        
    }
    
    get __pager() {
    	return this.querySelector("[slot='pager']");
    }
    
    __onStateChange(originalEvent) {
    	originalEvent.stopPropagation();
    	originalEvent.preventDefault();
    	const event = {detail: this.__state, bubbles: true};
    	this.dispatchEvent(new CustomEvent('change', event));
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
    
    get __state() {
    	const state = {};
    	state.paging = this.__pagingState;
    	return state;
    }

    connectedCallback() {
        this._render();
    }

    /**
     * Stelt in welke data de tabel moet tonen.
     * @param {Object[]} data - Een Array van objecten die de data voorstellen.
     */
    set data(data) {
        if (!Array.isArray(data)) {
            throw new Error('vl-rich-data-table verwacht een Array als data');
        }

        if (this.__data !== data) {
            this.__data = data;
            this._renderBody();
        }
    }

    /**
     * Geeft de data terug die de tabel toont.
     * @returns {Object[]}
     */
    get data() {
        return this.__data || [];
    }

    _render() {
        this._renderHeaders();
        this._renderBody();
    }

    _renderHeaders() {
        this.__tableHeaderRow.innerHTML = '';
        this.__fields.forEach(field => {
            const label = field.labelTemplate ? field.labelTemplate() : '';
            const headerTemplate = this._template(`<th>${label}</th>`);
            this.__tableHeaderRow.appendChild(headerTemplate);
        })
    }

    _renderBody() {
        this.__tableBody.innerHTML = '';
        this.data.forEach(rowData => {
            const rowTemplate = this._template(`<tr>
                ${Array.from(this.__fields)
                .map(field => field.valueTemplate ? field.valueTemplate(rowData) : '')
                .map(value => `<td>${value}</td>`)
                .join('')}
            </tr>`);
            this.__tableBody.appendChild(rowTemplate);
        });
    }

    _renderSearchFilter() {
        const filterSlot = this.querySelector("[slot='filter']");
    	if (filterSlot && ! this.__searchFilter) {
            this.shadowRoot.append(this._template(`<div is="vl-search-filter"><slot name="filter"></slot></div>`));
    	}
    }

    _data_vl_dataChangedCallback(oldValue, newValue) {
        this.data = JSON.parse(newValue);
    }


    _data_vl_filter_titleChangedCallback(oldValue, newValue) {
        const searchFilter = this.__searchFilter;
        if (searchFilter) {
            searchFilter.setAttribute('data-vl-title', newValue);
        }
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

    get __searchFilter() {
        return this.shadowRoot.querySelector('[is="vl-search-filter"]');
    }

    get __searchFilterContent() {
        return this.__searchFilter.querySelector('slot[name="filter"]').assignedNodes()[0];
    }

    __listenToFieldChanges(field) {
        field.addEventListener(VlRichDataField.EVENTS.change, this.__fieldChanged.bind(this));
    }

    __stopListeningToFieldChanges(field) {
        field.removeEventListener(VlRichDataField.EVENTS.change, this.__fieldChanged.bind(this));
    }

    __fieldChanged(event) {
        const propertiesChanged = event.detail.properties;
        if (propertiesChanged) {
            if (propertiesChanged.includes('label')) {
                this._renderHeaders();
            }

            if (propertiesChanged.includes('selector')) {
                this._renderBody();
            }
        }
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
}

/**
 * VlRichDataField
 * @class
 * @classdesc De definitie van een rich data veld.
 *
 * @extends VlElement
 *
 * @property {String} data-vl-label - Een naam die getoond kan worden aan de gebruiker.
 * @property {String} data-vl-selector - De selector die gebruikt wordt om de juiste waarde uit de data te halen.
 *
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-data-table/releases/latest|Release notes}
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-data-table/issues|Issues}
 * @see {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-rich-data-table.html|Demo}
 *
 */
export class VlRichDataField extends VlElement(HTMLElement) {
    static get EVENTS() {
        return {
            change: 'change'
        }
    }

    static get _observedAttributes() {
        return ['data-vl-selector', 'data-vl-label'];
    }

    static get is() {
        return 'vl-rich-data-field';
    }

    constructor() {
        super(`
            <style>
              @import "/node_modules/vl-ui-data-table/dist/style.css";
            </style>
        `);
    }

    labelTemplate() {
        return this.label;
    }

    valueTemplate(rowData) {
        return rowData[this.selector];
    }

    get selector() {
        return this.dataset.vlSelector;
    }

    get label() {
        return this.dataset.vlLabel;
    }

    _data_vl_selectorChangedCallback(oldValue, newValue) {
        if (oldValue !== newValue) {
            this._changed(['selector']);
        }
    }

    _data_vl_labelChangedCallback(oldValue, newValue) {
        if (oldValue !== newValue) {
            this._changed(['label']);
        }
    }

    _changed(properties) {
        this.dispatchEvent(new CustomEvent(VlRichDataField.EVENTS.change, {
            detail: {
                properties: properties
            }
        }));
    }
}

/**
 * VlRichDataField change event
 * @event VlRichDataField#change
 * @property {String[]} properties - De eigenschappen die veranderd zijn.
 */

define('vl-rich-data-field', VlRichDataField);
define('vl-rich-data-table', VlRichDataTable);
