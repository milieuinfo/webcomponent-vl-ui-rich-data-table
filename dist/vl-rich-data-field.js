import {VlElement, define} from '/node_modules/vl-ui-core/dist/vl-core.js';

/**
 * VlRichDataField
 * @class
 * @classdesc De definitie van een rich data veld, onderdeel van een rich data table om een table header weer te geven.
 *
 * @extends VlElement
 *
 * @property {string} data-vl-name - Een naam die gebruikt kan worden om het veld te benoemen. Dit wordt gebruikt voor de sortering.
 * @property {string} data-vl-label - Een naam die getoond kan worden aan de gebruiker.
 * @property {string} data-vl-selector - De selector die gebruikt wordt om de juiste waarde uit de data te halen.
 * @property {boolean} data-vl-sortable - Of er gesorteerd moet kunnen worden.
 * @property {asc | desc} data-vl-sorting-direction - In welke volgorde er initieel gesorteerd wordt. Indien leeg, is er nog geen sorteringsrichting voorgedefinieerd.
 * @property {number} data-vl-sorting-priority - Welke prioriteit er initieel gebruikt wordt voor de sortering. Indien leeg, is er nog geen prioriteit gekozen. 1 is de hoogste prioriteit, 2 is een lagere prioriteit, en zo verder.
 *
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-data-table/releases/latest|Release notes}
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-data-table/issues|Issues}
 * @see {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-rich-data-table.html|Demo}
 *
 */
export class VlRichDataField extends VlElement(HTMLElement) {

    static get headerAttributes() {
        return ['name', 'label', 'sortable', 'sorting-direction', 'sorting-priority'];
    }

    static get bodyAttributes() {
        return ['selector'];
    }

    static get _observedAttributes() {
        return this.headerAttributes.concat(this.bodyAttributes);
    }

    static get is() {
        return 'vl-rich-data-field';
    }

    __valueTemplate(rowData) {
        if (this.selector) {
            return this.selector.split('.').reduce((prev, curr) => {
                return prev ? prev[curr] : null
            }, rowData);
        } else {
            return this.__template(`${this.querySelector('template[slot="content"]').innerHTML}`, rowData);
        }
    }

    renderCellHeader() {
        let template = this.label || `${this.querySelector('template[slot="label"]').innerHTML}`;
        if (this.sortable) {
            const direction = this.sortingDirection ? `data-vl-direction="${this.sortingDirection}"` : '';
            const priority = this.sortingPriority ? `data-vl-priority="${this.sortingPriority}"` : '';
            template += `<vl-rich-data-sorter data-vl-for="${this.name}" ${direction} ${priority}></vl-rich-data-sorter>`;
            return `<th data-vl-sortable><a>${template}</a></th>`;
        } else {
            return `<th>${template}</th>`;
        }
    }

    renderCellValue(rowData) {
        const value = this.__valueTemplate(rowData);
        const title = this.label ? ` data-title="${this.label}"` : '';
        return `<td${title}>${value}</td>`;
    }

    __template(literal, data) {
        return ((literal, item) => new Function('item', 'return `' + literal + '`')(item)).call(this, literal, data);
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

    _nameChangedCallback(oldValue, newValue) {
        if (oldValue !== newValue) {
            this._changed(['name']);
        }
    }

    _selectorChangedCallback(oldValue, newValue) {
        if (oldValue !== newValue) {
            this._changed(['selector']);
        }
    }

    _labelChangedCallback(oldValue, newValue) {
        if (oldValue !== newValue) {
            this._changed(['label']);
        }
    }

    _sortableChangedCallback(oldValue, newValue) {
        if (oldValue !== newValue) {
            this._changed(['sortable']);
        }
    }

    _sorting_directionChangedCallback(oldValue, newValue) {
        if (oldValue !== newValue) {
            this._changed(['sorting-direction']);
        }
    }

    _sorting_priorityChangedCallback(oldValue, newValue) {
        if (oldValue !== newValue) {
            this._changed(['sorting-priority']);
        }
    }

    _changed(properties) {
        this.dispatchEvent(new CustomEvent('change', {
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

define(VlRichDataField.is, VlRichDataField);