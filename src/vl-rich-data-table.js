import {VlElement, define} from '/node_modules/vl-ui-core/dist/vl-core.js';
import '/node_modules/vl-ui-icon/dist/vl-icon.js';
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
 * @property {string} data-vl-data - De data die door de tabel getoond moet worden in JSON formaat.
 * @property {string} data-vl-filter-title - De titel die op de search filter getoond wordt.
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

    static get is() {
        return 'vl-rich-data-table';
    }

    constructor() {
        super(`
            <style>
                @import "/src/style.css";
                @import "/node_modules/vl-ui-data-table/dist/style.css";
                @import "/node_modules/vl-ui-search-filter/dist/style.css";
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
        this.__observeSorters();
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
        if (filterSlot) {
            debugger
            
            filterSlot.addEventListener('slotchange', function(e) {
                debugger;
                console.log(123);
            });
        }
    	if (filterSlot && ! this.__searchFilter) {
            this.shadowRoot.append(this._template(`<div is="vl-search-filter"><form>${this._searchFilterSlotContent}</form></div>`));
            this.__searchFilter.addEventListener('input', e => {
                this.__onFilterFieldChanged(e);
            });
    	}
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
 * VlRichDataField
 * @class
 * @classdesc De definitie van een rich data veld.
 *
 * @extends VlElement
 *
 * @property {string} data-vl-name - Een naam die gebruikt kan worden om het veld te identificeren.
 * @property {string} data-vl-label - Een naam die getoond kan worden aan de gebruiker.
 * @property {string} data-vl-selector - De selector die gebruikt wordt om de juiste waarde uit de data te halen.
 * @property {boolean} data-vl-sortable - Of er gesorteerd moet kunnen worden.
 * @property {asc | desc} data-vl-sorting-direction - In welke volgorde er gesorteerd wordt.
 * @property {number} data-vl-sorting-priority - Welke prioriteit er gebruikt wordt voor de sortering.
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
        return ['data-vl-name', 'data-vl-selector', 'data-vl-label', 'data-vl-sortable', 'data-vl-sorting-direction', 'data-vl-sorting-priority'];
    }

    static get is() {
        return 'vl-rich-data-field';
    }

    labelTemplate() {
        let template = this.label;
        if (this.sortable) {
            template += `<vl-rich-data-sorter data-vl-for="${this.name}" ${this.sortingDirection ? 'data-vl-direction="' + this.sortingDirection + '"' : ''} ${this.sortingPriority ? 'data-vl-priority="' + this.sortingPriority + '"' : ''}></vl-rich-data-sorter>`;
        }
        return template;
    }

    valueTemplate(rowData) {
        return this.selector.split('.').reduce(function(prev, curr) {
            return prev ? prev[curr] : null
        }, rowData);
    }

    /**
     * Geeft de naam terug die gebruikt wordt om het veld te identificeren.
     * @returns {string}
     */
    get name() {
        return this.dataset.vlName;
    }

    /**
     * Geeft de selector terug die gebruikt wordt om de juiste waarde uit de data te halen.
     * @returns {string}
     */
    get selector() {
        return this.dataset.vlSelector;
    }

    /**
     * Geeft de naam terug die getoond kan worden aan de gebruiker.
     * @returns {string}
     */
    get label() {
        return this.dataset.vlLabel;
    }

    /**
     * Geeft terug of er op het veld gesorteerd kan worden.
     * @returns {boolean}
     */
    get sortable() {
        return this.dataset.vlSortable !== undefined;
    }

    /**
     * Geeft de sorteerrichting terug.
     * @returns {asc | desc}
     */
    get sortingDirection() {
        return this.dataset.vlSortingDirection;
    }

    /**
     * Geeft de prioriteit van het sorteren terug.
     * @returns {number}
     */
    get sortingPriority() {
        return this.dataset.vlSortingPriority;
    }

    _data_vl_nameChangedCallback(oldValue, newValue) {
        if (oldValue !== newValue) {
            this._changed(['name']);
        }
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

    _data_vl_sortableChangedCallback(oldValue, newValue) {
        if (oldValue !== newValue) {
            this._changed(['sortable']);
        }
    }

    _data_vl_sorting_directionChangedCallback(oldValue, newValue) {
        if (oldValue !== newValue) {
            this._changed(['sorting-direction']);
        }
    }

    _data_vl_sorting_priorityChangedCallback(oldValue, newValue) {
        if (oldValue !== newValue) {
            this._changed(['sorting-priority']);
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
define(VlRichDataField.is, VlRichDataField);
define(VlRichDataTable.is, VlRichDataTable);
