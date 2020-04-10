import {VlElement, define} from '/node_modules/vl-ui-core/dist/vl-core.js';
import '/node_modules/vl-ui-data-table/dist/vl-data-table.js';
import '/node_modules/vl-ui-grid/dist/vl-grid.js';
import '/node_modules/vl-ui-modal/dist/vl-modal.js';

import {VlRichDataField} from "./vl-rich-data-field.js";
import {VlRichDataSorter} from "./vl-rich-data-sorter.js";

/**
 * VlRichDataTable
 * @class
 * @classdesc Een tabel op basis van een dynamische lijst van data die uitgebreid kan worden met functionaliteiten die het consumeren van de data door een gebruiker kunnen verbeteren.
 *
 * @extends VlElement
 *
 * @property {string} data-vl-data - De data die door de tabel getoond moet worden in JSON formaat.
 * @property {boolean} data-vl-collapsed-m - Vanaf een medium schermgrootte zullen de cellen van elke rij onder elkaar ipv naast elkaar getoond worden.
 * @property {boolean} data-vl-collapsed-s - Vanaf een small schermgrootte zullen de cellen van elke rij onder elkaar ipv naast elkaar getoond worden.
 * @property {boolean} data-vl-collapsed-xs - Vanaf een extra small schermgrootte zullen de cellen van elke rij onder elkaar ipv naast elkaar getoond worden.
 * @property {boolean} data-vl-multisort - Laat de gebruiker sorteren op meer dan 1 kolom.
 *
 * @slot filter - slot dat de velden bevat waarop gefilterd wordt. De formData van de search filter worden via een change event doorgegeven bij een wijziging.
 *
 * @property {boolean} data-vl-filter-closable - Attribuut dat de filter sluitbaar maakt en een knop getoond wordt om de filter te tonen en terug te verbergen. Op een klein scherm wordt een modal geopend bij het klikken op de filter knop ipv een de filter naast de tabel te tonen. Om elementen van de filter te verbergen enkel in de modal, kan het attribuut data-vl-hidden-in-modal gezet worden.
 * @property {boolean} data-vl-filter-closed - Attribuut dat aangeeft of dat de filter gesloten is.
 *
 * @slot toggle-filter-button-text - slot om de tekst te kunnen wijzigen van de toggle filter knop. Default: Filter.
 * @slot close-filter-button-text - slot om de onzichtbare tekst te kunnen wijzigen van de filter sluit knop. Default: Filter sluiten.
 *
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-data-table/releases/latest|Release notes}
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-data-table/issues|Issues}
 * @see {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-rich-data-table.html|Demo}
 *
 */
export class VlRichDataTable extends VlElement(HTMLElement) {
    static get _observedAttributes() {
        return ['data', 'collapsed-m', 'collapsed-s', 'collapsed-xs', 'filter-closable', 'filter-closed'];
    }

    static get _tableAttributes() {
        return ['data-vl-collapsed-m', 'data-vl-collapsed-s', 'data-vl-collapsed-xs'];
    }

    static get is() {
        return 'vl-rich-data-table';
    }

    static get _defaultSearchColumnSize() {
        return 4;
    }

    constructor() {
        super(`
            <style>
                @import '/node_modules/vl-ui-rich-data-table/dist/style.css';
                @import "/node_modules/vl-ui-icon/dist/style.css";
                @import "/node_modules/vl-ui-button/dist/style.css";
                @import "/node_modules/vl-ui-data-table/dist/style.css";
            </style>
            <div>
                <div is="vl-grid" is-stacked>
                    <div id="toggle-filter" is="vl-column" class="vl-u-align-right vl-u-hidden--s" hidden size="12">
                        <button id="toggle-filter-button" is="vl-button-link" type="button" aria-label="Toon de filter">
                            <span is="vl-icon" icon="content-filter" before></span><slot name="toggle-filter-button-text">Filter</slot>
                        </button>
                    </div>
                    <div id="open-filter" is="vl-column" class="vl-u-align-right vl-u-hidden" hidden size="12">
                        <button id="open-filter-button" is="vl-button-link" type="button" aria-label="Toon de filter">
                            <span is="vl-icon" icon="content-filter" before></span><slot name="toggle-filter-button-text">Filter</slot>
                        </button>
                    </div>
                    <div id="search" is="vl-column" size="0" small-size="0">
                        <button id="close-filter-button" class="vl-filter__close" hidden type="button">
                            <span is="vl-icon" icon="close"></span>
                            <span class="vl-u-visually-hidden"><slot name="close-filter-button-text">Filter sluiten</slot></span>
                        </button>
                        <div id="filter-slot-container">
                            <slot id="filter-slot" name="filter"></slot>
                        </div>
                    </div>
                    <div id="content" is="vl-column" size="12" small-size="12">
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
                <vl-modal id="filter-modal" closable not-cancellable></vl-modal>
            </div>
        `);

        this.__processSearchFilter();

        this.__observeSorters();
        this.__observePager();
        this.__observeFilterButtons();
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        super.attributeChangedCallback(attr, oldValue, newValue);
        if (VlRichDataTable._tableAttributes.includes(attr)) {
            const withoutDataVlPrefix = attr.substring("data-vl-".length);
            this.__table.toggleAttribute(withoutDataVlPrefix);
        }
    }

    get __activeSorters() {
        return Array.from(this.__sorters)
            .filter(sorter => sorter.direction !== undefined)
            .sort(VlRichDataSorter.PRIORITY_COMPARATOR);
    }

    get __contentColumn() {
        return this.shadowRoot.querySelector('#content');
    }

    get __fields() {
        return this.querySelectorAll(VlRichDataField.is);
    }

    get __filter() {
        return this.querySelector("[slot='filter']");
    }

    get __filterCloseButton() {
        return this.shadowRoot.querySelector("#close-filter-button");
    }

    get __filterModal() {
        return this.shadowRoot.querySelector("#filter-modal");
    }

    get __filterSlotContainer() {
        return this.shadowRoot.querySelector("#filter-slot-container");
    }

    get __filterOpenContainer() {
        return this.shadowRoot.querySelector("#open-filter");
    }

    get __filterOpenButton() {
        return this.shadowRoot.querySelector("#open-filter-button");
    }

    get __filterToggleContainer() {
        return this.shadowRoot.querySelector("#toggle-filter");
    }

    get __filterToggleButton() {
        return this.shadowRoot.querySelector("#toggle-filter-button");
    }

    get __formDataState() {
        if (this.__searchFilter && this.__searchFilter.formData) {
            const hasFilterValue = [... this.__searchFilter.formData.values()].find(Boolean);
            if (hasFilterValue) {
                return this.__searchFilter.formData;
            }
        }
    }

    get __pager() {
        return this.querySelector("[slot='pager']");
    }

    get __pagingState() {
        if (this.__pager) {
            return {
                currentPage: this.__pager.currentPage,
                totalPages: this.__pager.totalPages,
                itemsPerPage: this.__pager.itemsPerPage,
                totalItems: this.__pager.totalItems
            };
        }
    }

    get __richDataFields() {
        return [...this.__fields].filter(field => field.constructor === VlRichDataField);
    }

    get __sorters() {
        return this.__tableHeaderRow.querySelectorAll(VlRichDataSorter.is);
    }

    get __sortingState() {
        if (this.__activeSorters && this.__activeSorters.length > 0) {
            return this.__activeSorters.map(criteria => {
                return {
                    name: criteria.for,
                    priority: criteria.priority,
                    direction: criteria.direction
                }
            });
        }
    }

    get __searchColumn() {
        return this.shadowRoot.querySelector('#search');
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

    get __table() {
        return this.shadowRoot.querySelector('table');
    }

    get __tableHeaderRow() {
        return this.__table.querySelector('thead > tr');
    }

    get __tableBody() {
        return this.__table.querySelector('tbody');
    }

    __onStateChange(event, {paging = false} = {}) {
        event.stopPropagation();
        event.preventDefault();
        this.dispatchEvent(new CustomEvent('change', {
            detail: this.__getState({paging}),
            bubbles: true
        }));
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
        this.__observeFields();
        this.__observeSearchFilter();
    }

    /**
     * Stelt in welke data de tabel moet tonen.
     * @param {Object[]} object - Een Array van objecten die de data voorstellen.
     */
    set data(object) {
        if (this.__data !== object) {
            const {data, paging, sorting, filter} = object;
            this._validate(data);
            this._paging = paging;
            this._sorting = sorting;
            this._filter = filter;
            this.__data = object;
            this._renderBody();
        }
    }

    _validate(data) {
        if (data) {
            if (!Array.isArray(data)) {
                throw new Error('vl-rich-data-table verwacht een Array als data');
            }
        }
    }

    set _paging(paging) {
        if (paging) {
            if (paging.currentPage) {
                this.__pager.setAttribute('current-page', paging.currentPage);
            }
            if (paging.itemsPerPage) {
                this.__pager.setAttribute('items-per-page', paging.itemsPerPage);
            }
            if (paging.totalItems) {
                this.__pager.setAttribute('total-items', paging.totalItems);
            }
        }
    }

    set _sorting(sorting) {
        if (sorting) {
            this.__sorters.forEach(sorter => {
                const matchedSorter = sorting.find(sort => sort.name === sorter.for);
                sorter.direction = matchedSorter ? matchedSorter.direction : undefined;
                sorter.priority = matchedSorter ? matchedSorter.priority : undefined;
            });
        }
    }

    set _filter(filter) {
        if (filter && this.__searchFilter) {
            const form = this.__searchFilter.querySelector('form');
            if (form) {
                filter.forEach((entry) => {
                    const formElement = form.elements[entry.name];
                    if (formElement) {
                        formElement.value = entry.value;
                    }
                });
            }
        }
    }

    /**
     * Geeft de data terug die in de tabel wordt getoond.
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
        this.__richDataFields.forEach(field => {
            const headerTemplate = this._template(field.renderCellHeader());
            this.__tableHeaderRow.appendChild(headerTemplate);
        });
        this.__tableHeaderRow.querySelectorAll("th[data-vl-sortable] > a").forEach(th => {
            th.addEventListener('click', e => {
                th.querySelector("vl-rich-data-sorter").nextDirection();
            })
        });
    }

    _renderBody() {
        if (this.data && this.data.data) {
            this.__tableBody.innerHTML = '';
            this.data.data.forEach(rowData => {
                const rowTemplate = this._template(`<tr>
                    ${this.__richDataFields
                    .map(field => field.renderCellValue(rowData))
                    .join('')}
                </tr>`);
                this.__tableBody.appendChild(rowTemplate);
            });
        }
    }

    _dataChangedCallback(oldValue, newValue) {
        this.data = JSON.parse(newValue);
    }

    _filter_closableChangedCallback(oldValue, newValue) {
        this.__filterCloseButton.hidden = newValue == null;
        this.__filterToggleContainer.hidden = newValue == null;
        this.__filterOpenContainer.hidden = newValue == null;
        if (newValue == null) {
            this.__filterOpenContainer.classList.remove('vl-u-visible--s');
            this.__searchColumn.classList.remove('vl-u-hidden--s');
        } else {
            this.__filterOpenContainer.classList.add('vl-u-visible--s');
            this.__searchColumn.classList.add('vl-u-hidden--s');
        }
    }

    _filter_closedChangedCallback(oldValue, newValue) {
        if (newValue == null) {
            this.__showSearchColumn();
        } else {
            this.__hideSearchColumn();
        }
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
            if (propertiesChanged.some(property => VlRichDataField.headerAttributes.includes(property))) {
                this._renderHeaders();
            }

            if (propertiesChanged.some(property => VlRichDataField.bodyAttributes.includes(property))) {
                this._renderBody();
            }
        }
    }

    __sortingChanged(event) {
        if (this._isMultisortingEnabled) {
            this.__activeSorters.forEach((sorter, index) => sorter.priority = index + 1);
        } else {
            this.__activeSorters.filter(sorter => sorter !== event.target).forEach(sorter => sorter.direction = undefined);
        }
        this.__onStateChange(event);
    }

    __observeFields() {
        this.__fields.forEach(this.__listenToFieldChanges.bind(this));
        const observer = this.__createObserver(this.__listenToFieldChanges.bind(this), this.__stopListeningToFieldChanges.bind(this), true);
        observer.observe(this, {childList: true});
    }

    __createObserver(doWhenNodeIsAdded, doWhenNodeIsRemoved, render) {
        return new MutationObserver(mutationsList => {
            let shouldRender = false;
            mutationsList.forEach(mutation => {
                if (mutation.addedNodes || mutation.removedNodes) {
                    shouldRender = true;
                    if (mutation.addedNodes) {
                        mutation.addedNodes.forEach(doWhenNodeIsAdded);
                    }
                    if (mutation.removedNodes) {
                        mutation.removedNodes.forEach(doWhenNodeIsRemoved);
                    }
                }
            });
            if (render && shouldRender) {
                this._render();
            }
        });
    }

    __observeFilterButtons() {
        this.__filterCloseButton.addEventListener('click', () => {
            this.setAttribute('data-vl-filter-closed', '');
        });
        this.__filterToggleButton.addEventListener('click', () => {
            this.__filterSlotContainer.removeAttribute('slot');
            this.__searchColumn.appendChild(this.__filterSlotContainer);
            this.__showHiddenInModalElements();
            this.toggleAttribute('data-vl-filter-closed');
        });
        this.__filterOpenButton.addEventListener('click', () => {
            this.setAttribute('data-vl-filter-closed', ''); // first close to make sure when resized that it doesn't show without proper slot
            this.__filterSlotContainer.setAttribute('slot', 'content');
            this.__filterModal.appendChild(this.__filterSlotContainer);
            this.__hideHiddenInModalElements();
            this.__filterModal.open();
        });
    }

    __showHiddenInModalElements() {
        this.__setHiddenInModalElements(false);
    }

    __hideHiddenInModalElements() {
        this.__setHiddenInModalElements(true);
    }

    __setHiddenInModalElements(hidden) {
        this.__filter.querySelectorAll('[data-vl-hidden-in-modal]').forEach(element => element.hidden = hidden);
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
        const nodeToSorter = (doWithSorter) => {
            return (node) => {
                const sorter = node.querySelector(VlRichDataSorter.is);
                if (sorter) {
                    doWithSorter(sorter);
                }
            }
        };
        this.__createObserver(
            nodeToSorter(sorter => this.__listenToSortChanges(sorter)),
            nodeToSorter(sorter => this.__stopListeningToSortChanges(sorter))
        ).observe(this.__tableHeaderRow, {childList: true});
    }

    __observeSearchFilter() {
        const observer = new MutationObserver(() => {
            this.__processSearchFilter();
        });
        observer.observe(this, {childList: true, subtree: true});
    }

    __processSearchFilter() {
        if (this.__searchFilter) {
            this.__searchFilter.setAttribute('alt', '');
            this.__showSearchColumn();
            this.__addSearchFilterEventListeners();
        } else {
            this.__hideSearchColumn();
        }
    }

    __hideSearchColumn() {
        this.__searchColumn.hidden = true;
        this.__setGridColumnWidth(0);
    }

    __showSearchColumn() {
        this.__searchColumn.hidden = false;
        this.__setGridColumnWidth(VlRichDataTable._defaultSearchColumnSize);
    }

    __setGridColumnWidth(width) {
        this.__searchColumn.setAttribute('size', width);
        this.__contentColumn.setAttribute('size', 12 - width);
    }

    __addSearchFilterEventListeners() {
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
    }

    __onFilterFieldChanged(event) {
        event.stopPropagation();
        event.preventDefault();
        this.__onStateChange(event);
    }
}

Promise.all([customElements.whenDefined(VlRichDataField.is), customElements.whenDefined(VlRichDataSorter.is)])
    .then(() => define(VlRichDataTable.is, VlRichDataTable));
