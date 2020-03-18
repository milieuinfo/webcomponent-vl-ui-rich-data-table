import {VlElement, define} from '/node_modules/vl-ui-core/dist/vl-core.js';
import '/node_modules/vl-ui-icon/dist/vl-icon.js';
import '/node_modules/vl-ui-data-table/dist/vl-data-table.js';
import '/node_modules/vl-ui-search-filter/dist/vl-search-filter.js';
import '/node_modules/vl-ui-grid/dist/vl-grid.js';
import '/node_modules/vl-ui-input-field/dist/vl-input-field.js';
import '/node_modules/vl-ui-form-message/dist/vl-form-message.js';
import '/node_modules/vl-ui-button/dist/vl-button.js';

import { VlRichDataField } from "./vl-rich-data-field.js";

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
        return ['data-vl-data', 'data-vl-collapsed-m', 'data-vl-collapsed-s', 'data-vl-collapsed-xs'];
    }
    
    static get _tableAttributes() {
    	return [ "data-vl-collapsed-m", "data-vl-collapsed-s", "data-vl-collapsed-xs"];
    }

    static get is() {
        return 'vl-rich-data-table';
    }

    constructor() {
        super(`
            <style>
                @import "/src/style.css";
                @import "/node_modules/vl-ui-data-table/dist/style.css";
                @import "/node_modules/vl-ui-search-filter/dist/style.css";
                @import "/node_modules/vl-ui-input-field/dist/style.css";
                @import "/node_modules/vl-ui-form-message/dist/style.css";
                @import "/node_modules/vl-ui-button/dist/style.css";
            </style>
            <div is="vl-grid" is-stacked>
                <div id="search" is="vl-column" size="0"></div>
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

        this.__copyTableAttributes();
        this.__observeFields();
        this.__observeSorters();
        this._renderSearchFilter();
        if (this.__pager) {
        	this.__pager.setAttribute("align-right", true);
        	this.__pager.addEventListener('change', e => {
        		this.__onStateChange(e);
        	});
        }
    }
    
    attributeChangedCallback(attr, oldValue, newValue) {
    	super.attributeChangedCallback(attr, oldValue, newValue);
    	if (VlRichDataTable._tableAttributes.includes(attr)) {
    		this.__setTableAttribute(attr, oldValue, newValue);
    	}
    }

    get _searchElement() {
        return this.shadowRoot.querySelector('#search');
    }
    
    __copyTableAttributes() {
    	VlRichDataTable._tableAttributes.forEach(attr => {
    		if (this.hasAttribute(attr)) {
    			this.__setTableAttribute(attr, null, "");
    		}
    	});
    }
    
    __setTableAttribute(attr, oldValue, newValue) {
    	const withoutDataVlPrefix = attr.substring("data-vl-".length);
    	if (newValue != undefined && newValue != null) {
    		this.__table.setAttribute(withoutDataVlPrefix, "");
    	} else {
    		this.__table.removeAttribute(withoutDataVlPrefix);
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

    get __sortingState() {
        return this.__activeSorters.map(criteria => { return {
            name: criteria.for,
            direction: criteria.direction
        } });
    }
    
    get __state() {
    	const state = {};
        state.paging = this.__pagingState;
        state.sorting = this.__sortingState;
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

    _getSearchFilterTemplate(content) {
        return this._template(`
            <div is="vl-search-filter" alt>
                <form>
                    ${content}
                    <div>
                        <button is="vl-button" type="submit">Zoeken</button>
                    </div>
                </form>
                <div>
                    <button is="vl-button-link" type="reset">Zoekopdracht verwijderen</button>
                </div>
            </div>
        `);
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
                .map(field => field.renderCellValue ? field.renderCellValue(rowData) : '<td></td>')
                .join('')}
            </tr>`);
            this.__tableBody.appendChild(rowTemplate);
        });
    }

    _renderSearchFilter() {
        const filterSlot = this.querySelector("[slot='filter']");
        if (filterSlot) {
            this.__observeFilterSlotElement(filterSlot, () => {
                this._appendSearchFilter();
            });
            this._appendSearchFilter();
        }
    }

    _appendSearchFilter() {
        this._removeSearchFilter();
        this._createSearchFilter();
    }

    _removeSearchFilter() {
        const searchFilter = this.__searchFilter;
        if (searchFilter) {
            searchFilter.remove();
        }
    }

    _createSearchFilter() {
        const searchFilterContent = this._searchFilterSlotContent;
        if (searchFilterContent != '') {
            this._searchElement.append(this._getSearchFilterTemplate(searchFilterContent));
            this.__searchFilter.addEventListener('input', e => {
                this.__onFilterFieldChanged(e);
            });
        }
        this._setWidthForSearchFilter(searchFilterContent != ''? 4 : 0 );
    }

    _setWidthForSearchFilter(width) {
        this.__searchFilterLocation.setAttribute('size', width);
        this.__contentLocation.setAttribute('size', 12-width);
    }

    get __searchFilterLocation() {
        return this.shadowRoot.querySelector('#search');
    }

    get __contentLocation() {
        return this.shadowRoot.querySelector('#content');
    }

    __observeFilterSlotElement(filterSlot, callback) {
		const observer = new MutationObserver(callback);
		observer.observe(filterSlot, { attributes: true, childList: true, characterData: true, subtree: true });
		return observer;
	}

    __onFilterFieldChanged(originalEvent) {
    	originalEvent.stopPropagation();
    	originalEvent.preventDefault();
        const event = {
            detail: this.__filterFormData, 
            bubbles: true
        };
    	this.dispatchEvent(new CustomEvent('change', event));
    }

    get __filterFormData() {
        return {
            formData: this.__searchFilter.formData
        };
    }

    _data_vl_dataChangedCallback(oldValue, newValue) {
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

    get __searchFilter() {
        return this.shadowRoot.querySelector('[is="vl-search-filter"]');
    }

    get _searchFilterSlotContent() {
        return this.querySelector('[slot="filter"]').innerHTML;
    }

    __listenToFieldChanges(field) {
        field.addEventListener(VlRichDataField.EVENTS.change, this.__fieldChanged.bind(this));
    }

    __stopListeningToFieldChanges(field) {
        field.removeEventListener(VlRichDataField.EVENTS.change, this.__fieldChanged.bind(this));
    }

    __listenToSortChanges(sorter) {
        sorter.addEventListener(VlRichDataSorter.EVENTS.change, this.__sortingChanged.bind(this));
    }

    __stopListeningToSortChanges(sorter) {
        sorter.removeEventListener(VlRichDataSorter.EVENTS.change, this.__sortingChanged.bind(this));
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
        this.__activeSorters.forEach((sorter, index) => sorter.priority = index + 1);
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
}


/**
 * VlRichDataField change event
 * @event VlRichDataField#change
 * @property {string[]} properties - De eigenschappen die veranderd zijn.
 */

class VlRichDataSorter extends VlElement(HTMLElement) {
    static get DIRECTIONS() {
        return {
            descending: 'desc',
            ascending: 'asc'
        }
    }

    static get EVENTS() {
        return {
            'change': 'change'
        }
    }

    static get _observedAttributes() {
        return ['data-vl-direction', 'data-vl-priority'];
    }

    static get is() {
        return 'vl-rich-data-sorter';
    }

    constructor() {
        super(`
            <style>
                @import '/node_modules/vl-ui-icon/dist/style.css';
                
                div {
                    display: inline;
                }
                
                #direction {
                    vertical-align: middle;
                    cursor: pointer;
                }
                
                #priority {
                    font-size: x-small;
                    vertical-align: super;
                }
            </style>
            <div>
                <span id="direction" is="vl-icon" icon="sort"></span>
                <label id="priority"></label>
            </div>
        `);
    }

    connectedCallback() {
        this.__directionElement.addEventListener('click', this._nextDirection.bind(this));
    }

    get for() {
        return this.dataset.vlFor;
    }

    get direction() {
        return this.__direction;
    }

    set direction(direction) {
        if (this.__direction !== direction) {
            this.__direction = direction;
            this.__directionElement.setAttribute('icon', this._directionIcon);

            if (direction === undefined) {
                this.priority = undefined;
            }

            this._changed();
        }
    }

    get priority() {
        return this.__priority;
    }

    set priority(priority) {
        if (this.__priority !== priority) {
            this.__priority = priority;
            this.__priorityElement.textContent = this.priority;
        }
    }

    get __directionElement() {
        return this.shadowRoot.querySelector('#direction');
    }

    get __priorityElement() {
        return this.shadowRoot.querySelector('#priority');
    }

    get _directionIcon() {
        switch (this.direction) {
            case VlRichDataSorter.DIRECTIONS.ascending:
                return 'nav-up';
            case VlRichDataSorter.DIRECTIONS.descending:
                return 'nav-down';
            default:
                return 'sort';
        }
    }

    _nextDirection() {
        switch (this.direction) {
            case VlRichDataSorter.DIRECTIONS.ascending:
                this.direction = undefined;
                break;
            case VlRichDataSorter.DIRECTIONS.descending:
                this.direction = VlRichDataSorter.DIRECTIONS.ascending;
                break;
            default:
                this.direction = VlRichDataSorter.DIRECTIONS.descending;
        }
    };

    _data_vl_directionChangedCallback(oldValue, newValue) {
        this.direction = newValue;
    }

    _data_vl_priorityChangedCallback(oldValue, newValue) {
        this.priority = newValue;
    }

    _changed() {
        this.dispatchEvent(new CustomEvent(VlRichDataSorter.EVENTS.change, {
            detail: {
                direction: this.direction,
                priority: this.priority
            }
        }))
    }

    static get PRIORITY_COMPARATOR() {
        return (firstSorter, secondSorter) => {
            const firstPriority = firstSorter.priority;
            const secondPriority = secondSorter.priority;
            if (secondPriority === undefined || firstPriority < secondPriority) {
                return -1;
            } else if (firstPriority === undefined || firstPriority > secondPriority) {
                return 1;
            } else {
                return 0;
            }
        };
    }
}

define(VlRichDataSorter.is, VlRichDataSorter);

define(VlRichDataTable.is, VlRichDataTable);
