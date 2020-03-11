import {VlElement, define} from '/node_modules/vl-ui-core/dist/vl-core.js';
import '/node_modules/vl-ui-data-table/dist/vl-data-table.js';

/**
 * VlRichDataTable
 * @class
 * @classdesc
 *
 * @extends VlElement
 *
 * @property
 *
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-data-table/releases/latest|Release notes}
 * @see {@link https://www.github.com/milieuinfo/webcomponent-vl-ui-rich-data-table/issues|Issues}
 * @see {@link https://webcomponenten.omgeving.vlaanderen.be/demo/vl-rich-data-table.html|Demo}
 *
 */
export class VlRichDataTable extends VlElement(HTMLElement) {
    static get _observedAttributes() {
        return ['data-vl-data'];
    }

    constructor() {
        super(`
            <style>
                @import "/src/style.css";
                @import "/node_modules/vl-ui-data-table/dist/style.css";
            </style>
            <table is="vl-data-table">
                <thead>
                    <tr></tr>
                </thead>
                <tbody></tbody>
            </table>
        `);
        this.__observeFields();
    }

    connectedCallback() {
        this._render();
    }

    set data(data) {
        if(this.__data !== data) {
            this.__data = data;
            this._renderBody();
        }
    }

    get data() {
        return this.__data;
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
        observer.observe(this, { childList: true });
    }
}

export class VlRichDataField extends VlElement(HTMLElement) {
    static get EVENTS() {
        return {
            change: 'change'
        }
    }

    static get _observedAttributes() {
        return ['data-vl-selector','data-vl-label'];
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
            this._changed([ 'selector' ]);
        }
    }

    _data_vl_labelChangedCallback(oldValue, newValue) {
        if (oldValue !== newValue) {
            this._changed([ 'label' ]);
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

define('vl-rich-data-field', VlRichDataField);
define('vl-rich-data-table', VlRichDataTable);
