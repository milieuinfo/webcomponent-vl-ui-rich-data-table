import {VlElement, define} from '/node_modules/vl-ui-core/dist/vl-core.js';


export class VlRichDataSorter extends VlElement(HTMLElement) {
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