import {VlElement, define} from '/node_modules/vl-ui-core/dist/vl-core.js';

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
        if (this.label) {
            let template = this.label;
            if (this.sortable) {
                template += `<vl-rich-data-sorter data-vl-for="${this.name}" ${this.sortingDirection ? 'data-vl-direction="' + this.sortingDirection + '"' : ''} ${this.sortingPriority ? 'data-vl-priority="' + this.sortingPriority + '"' : ''}></vl-rich-data-sorter>`;
            }
            return template;
        } else {
            return this.__template(`${this.querySelector('template[slot="label"]').innerHTML}`);
        }
    }

    __valueTemplate(rowData) {
        if (this.selector) {
            return this.selector.split('.').reduce(function(prev, curr) {
                return prev ? prev[curr] : null
            }, rowData);
        } else {
            return this.__template(`${this.querySelector('template[slot="content"]').innerHTML}`, rowData);
        }
    }
    
    renderCellValue(rowData) {
    	const value = this.__valueTemplate(rowData);
    	if (this.label) {
    		return `<td data-title="${this.label}">${value}</td>`;
    	} else {
    		return `<td>${value}</td>`;
    	}
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

define(VlRichDataField.is, VlRichDataField);