import {VlElement as e, define as t} from "/node_modules/vl-ui-core/vl-core.js";
import "/node_modules/vl-ui-data-table/vl-data-table.js";
import "/node_modules/vl-ui-grid/vl-grid.js";
import "/node_modules/vl-ui-icon/vl-icon.js";
import {VlPager as i} from "/node_modules/vl-ui-pager/vl-pager.js";
import "/node_modules/vl-ui-input-field/vl-input-field.js";
import "/node_modules/vl-ui-select/vl-select.js";
import "/node_modules/vl-ui-search-filter/vl-search-filter.js";

const r = {DESCENDING: "desc", ASCENDING: "asc"}, a = r.ASCENDING,
    s = r.DESCENDING;
var n = "[name=sortable-span] {\n  cursor: pointer;\n}\n\n[name=sortable-text] {\n  font-size: x-small;\n  vertical-align: super;\n}\n\nth.vl-sortable > [is=vl-icon] {\n  vertical-align: middle;\n}\n\ncaption {\n  caption-side: bottom;\n}";
!function (e, t) {
  void 0 === t && (t = {});
  var i = t.insertAt;
  if (e && "undefined" != typeof document) {
    var r = document.head || document.getElementsByTagName("head")[0],
        a = document.createElement("style");
    a.type = "text/css", "top" === i && r.firstChild ? r.insertBefore(a,
        r.firstChild) : r.appendChild(a), a.styleSheet
        ? a.styleSheet.cssText = e : a.appendChild(document.createTextNode(e))
  }
}(n);

class l extends (e(HTMLElement)) {
  get sortCriteria() {
    return this._sortCriteria
  }

  set sortCriteria(e) {
    this._sortCriteria = e
  }

  static get _observedAttributes() {
    return ["data"]
  }

  constructor() {
    super(), this._data = [], this._sortCriteria = [], this._searchCriteria = {}
  }

  connectedCallback() {
    this._shadow = this.attachShadow(
        {mode: "open"}), this._shadow.innerHTML = `\n        <style>\n          ${n}\n        </style>\n        <slot></slot>\n        ${this._renderSearchable(
        `\n            <style>\n              @import "/node_modules/vl-ui-data-table/style.css";\n            </style>\n            <table is="vl-data-table" ${this._dataTableAttributes}>\n              <thead>\n                <tr>\n                </tr>\n              </thead>\n              <tbody>\n              </tbody>\n              <caption></caption>\n            </table>`)}`, this.shadowRoot.querySelector(
        "slot").addEventListener("slotchange", () => this._createRows());
    const e = this.shadowRoot.querySelector("slot[name=filter]");
    e && e.addEventListener("slotchange", () => {
      e.assignedElements().forEach(e => {
        let t;
        (t = e.shadowRoot ? e.shadowRoot : e).querySelectorAll(
            "input, select").forEach(e => {
          e.addEventListener(
              "input" === e.tagName.toLowerCase() ? "input" : "change", e => {
                const i = {};
                t.querySelectorAll("input, select").forEach(e => {
                  e.value && (i[e.name] = e.value)
                }), this.dispatchEvent(new CustomEvent("search",
                    {detail: {searchCriteria: i}, bubbles: !0}))
              })
        })
      })
    })
  }

  _renderSearchable(e) {
    return `${null != this.getAttribute("searchable")
        ? '\n        <style>\n          @import "/node_modules/vl-ui-grid/style.css";\n        </style>\n        <div is="vl-grid">\n          <div is="vl-column" size="4" small-size="12">\n          <slot name="filter"></slot>\n          </div>\n          <div is="vl-column" size="8" small-size="12">'
        : ""}\n            ${e}\n            ${null != this.getAttribute(
        "searchable") ? "" : "\n          </div>\n        </div>"}`
  }

  get _dataTableAttributes() {
    return (null != this.getAttribute("zebra") ? " zebra" : "") + (null
    != this.getAttribute("lined") ? " lined" : "") + (null != this.getAttribute(
        "hover") ? " hover" : "")
  }

  _createRows() {
    Array.from(this._tableBody.children).forEach(
        e => e.remove()), this.content.forEach(e => {
      const t = document.createElement("tr");
      Array.from(this.fields).forEach(i => {
        const r = document.createElement("td");
        r.appendChild(i.renderTableData(e[i.fieldName])), t.appendChild(r)
      }), this._tableBody.appendChild(t)
    })
  }

  _dataChangedCallback(e, t) {
    this.data = JSON.parse(t)
  }

  updateSortCriteria(e) {
    setTimeout(() => {
      if (e.direction === a || e.direction === s) {
        if (e.priority) {
          const t = e.priority - 1;
          this.sortCriteria[t] = {name: e.name, direction: e.direction}
        } else {
          this.sortCriteria = this.sortCriteria.filter(
              t => t.name !== e.name), this.sortCriteria.push(
              e);
        }
      } else {
        this.sortCriteria = this.sortCriteria.filter(
            t => t.name !== e.name);
      }
      this.dispatchEvent(
          new CustomEvent("sort", {detail: {sortCriteria: this.sortCriteria}}))
    }, 0)
  }

  get fields() {
    return Array.from(this.children).filter(
        e => "vl-rich-table-field" === e.tagName.toLowerCase())
  }

  get data() {
    return this._data
  }

  set data(e) {
    this._data = e, this._isReady() && this._createRows(), Array.isArray(
        this.data) || this.dispatchEvent(
        new CustomEvent("data_update_from_object", this.data))
  }

  get content() {
    if (Array.isArray(this.data)) {
      return this.data;
    }
    if (Array.isArray(this.data.content)) {
      return this.data.content;
    }
    throw new Error("data is geen geldige array van objecten")
  }

  get headers() {
    return this.shadowRoot.querySelectorAll("th")
  }

  _isReady() {
    return Array.from(this.fields).every(e => e.richTable === this)
  }

  get _table() {
    return this.shadowRoot.querySelector("table")
  }

  get _tableHeaderRow() {
    return this._table.querySelector("thead > tr")
  }

  get _tableBody() {
    return this._table.querySelector("tbody")
  }

  get _tableFooterRow() {
    return this._table.querySelector("caption")
  }

  addTableHeaderCell(e) {
    this._tableHeaderRow.appendChild(e)
  }

  addTableFooterCell(e) {
    this._tableFooterRow.append(e)
  }
}

const o = e => (class extends e {
  _dressSortableHeader() {
    const e = this._headerCell;
    e.classList.add("vl-sortable");
    const t = document.createElement("span", "vl-icon");
    t.setAttribute("before", ""), t.setAttribute("icon",
        "sort"), t.setAttribute("name", "sortable-span");
    const i = document.createElement("label");
    i.setAttribute("name", "sortable-text"), e.appendChild(t), e.appendChild(
        i), t.addEventListener("click", () => {
      this._sortButtonClicked()
    }), this.richTable.addEventListener("sort", () => {
      this._updateSortableHeader()
    })
  }

  get direction() {
    return this.getAttribute("direction")
  }

  get priority() {
    return this.getAttribute("priority")
  }

  _sortButtonClicked(e) {
    let t;
    switch (this.direction) {
      case a:
        t = null;
        break;
      case s:
        t = a;
        break;
      default:
        t = s
    }
    this.richTable.updateSortCriteria({name: this.fieldName, direction: t})
  }

  _updateSortableHeader() {
    const e = this._headerCell.querySelector('[name="sortable-span"]'),
        t = this._headerCell.querySelector('[name="sortable-text"]'),
        i = this.richTable.sortCriteria.findIndex(
            e => e && e.name === this.fieldName);
    this._priority = i > -1 ? i + 1 : null;
    const r = null !== i ? this.richTable.sortCriteria[i] : null;
    if (r) {
      switch (this._direction = r.direction, r.direction) {
        case a:
          this.setAttribute("direction", a), this.setAttribute("priority",
              this._priority), t.innerHTML = this._priority, e.setAttribute(
              "icon", "nav-up");
          break;
        case s:
          this.setAttribute("direction", s), this.setAttribute("priority",
              this._priority), t.innerHTML = this.priority, e.setAttribute(
              "icon",
              "nav-down");
          break;
        default:
          console.error(`${r.direction} is niet een geldige sort direction`)
      }
    } else {
      this._direction = null, this.removeAttribute(
          "direction"), this.removeAttribute(
          "priority"), t.innerHTML = "", e.setAttribute("icon", "sort")
    }
  }

  _directionChangedCallback(e, t) {
    this.priority && t !== this._direction && this.richTable.updateSortCriteria(
        {name: this.fieldName, direction: t, priority: this.priority})
  }

  _priorityChangedCallback(e, t) {
    this.direction && parseInt(t) !== this._priority
    && this.richTable.updateSortCriteria(
        {name: this.fieldName, direction: this.direction, priority: t})
  }
}), d = {
  string: e => document.createTextNode(e),
  datetime: e => document.createTextNode((
      e => new Date(e).toLocaleString("nl-BE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).replace(/\//g, "."))(e)),
  date: e => document.createTextNode((
      e => new Date(e).toLocaleDateString("nl-BE",
          {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\//g,
          "."))(e)),
  default: e => document.createTextNode(e)
};

class h extends (o(e(HTMLElement))) {
  static get _observedAttributes() {
    return ["direction", "priority"]
  }

  constructor() {
    super(
        '\n        <style>\n          @import "/node_modules/vl-ui-data-table/style.css";\n        </style>\n    '), this._searchValue
  }

  renderTableData(e) {
    return d[this._validDataType()](e)
  }

  get fieldName() {
    return this.getAttribute("data-value")
  }

  _validDataType() {
    const e = this.getAttribute("data-type");
    return null != e && d.hasOwnProperty(e) ? e : "default"
  }

  get _headerCell() {
    return this.__headerCell
  }

  set _headerCell(e) {
    this.__headerCell = e
  }

  connectedCallback() {
    if (this.richTable) {
      const e = document.createElement("th");
      this._headerCell = e, e.appendChild(document.createTextNode(
          this.getAttribute("label"))), this.hasAttribute("sortable")
      && this._dressSortableHeader(), this.richTable.addTableHeaderCell(e)
    } else {
      console.log(
          "Een VlRichTableField moet altijd als parent een vl-rich-table hebben.")
    }
  }

  get richTable() {
    if (this.parentNode && "vl-rich-table"
        === this.parentNode.tagName.toLowerCase()) {
      return this.parentNode
    }
  }

  get searchable() {
    return this.hasAttribute("searchable")
  }

  get searchValue() {
    return this._searchValue
  }
}

class c extends i {
  connectedCallback() {
    super.connectedCallback(), this._tableToInsert
        ? (this._appended = !0, this._tableToInsert.addTableFooterCell(
            this), this.addEventListener("pagechanged", e => {
          this.richTable.dispatchEvent(
              new CustomEvent("pagechanged", {detail: e.detail}))
        }), this._updatePageable(), this.richTable.addEventListener(
            "data_update_from_object", e => {
              this._updatePageable()
            })) : this._appended || console.log(
        "Een VlRichTablePager moet altijd als parent een vl-rich-table hebben.")
  }

  _updatePageable() {
    const e = this.richTable.data;
    null != e.totalElements && e.size && e.number + 1 && (this.setAttribute(
        "total-items", e.totalElements), this.setAttribute("items-per-page",
        e.size), this.setAttribute("current-page", e.number + 1))
  }

  get _tableToInsert() {
    if (this.parentNode && "vl-rich-table"
        === this.parentNode.tagName.toLowerCase()) {
      return this.parentNode
    }
  }

  get richTable() {
    if (this.getRootNode() && this.getRootNode().host && "vl-rich-table"
        === this.getRootNode().host.tagName.toLowerCase()) {
      return this.getRootNode().host
    }
  }
}

class u extends (e(HTMLElement)) {
  constructor() {
    super()
  }

  connectedCallback() {
    this._shadow = this.attachShadow(
        {mode: "open"}), this._shadow.innerHTML = `\n        <style>\n          @import "/node_modules/vl-ui-search-filter/style.css";\n        </style>\n        <div is="vl-search-filter" title="Verfijn uw zoekopdracht" alt>\n          <form>\n            <section>\n              ${this._renderSearchFields()}\n            </section>\n          </form>\n        </div>\n    `
  }

  get richTable() {
    if (this.parentElement && this.parentElement && "vl-rich-table"
        === this.parentElement.tagName.toLowerCase()) {
      return this.parentElement
    }
  }

  _renderSearchFields() {
    return this.richTable.fields.map(
        e => `\n      <div>\n        <label is="form-label" for="${e.getAttribute(
            "data-value")}">\n          ${e.getAttribute(
            "label")}\n        </label>\n        ${this._renderSearchField(
            e)}\n      </div>\n  `)
  }

  _renderSearchField(e) {
    return null != e.getAttribute("search-options")
        ? this._renderSelectSearchField(e) : (e.getAttribute(
            "data-type"), this._renderInputSearchField(e))
  }

  _renderSelectSearchField(e) {
    return `\n    <style>\n      @import "/node_modules/vl-ui-select/style.css";\n    </style>\n    <select is="vl-select" data-vl-select name="${e.getAttribute(
        "data-value")}" data-vl-select-deletable>\n      <option placeholder value="">Kies een ${e.getAttribute(
        "label").toLowerCase()}</option>\n      ${JSON.parse(
        e.getAttribute("search-options")).map(
        e => `\n      <option value="${e.value}">${e.text}</option>`)}\n    </select>`
  }

  _renderInputSearchField(e) {
    return `\n    <style>\n      @import "/node_modules/vl-ui-input-field/style.css";\n    </style>\n    <input is="vl-input-field" type="text" name="${e.getAttribute(
        "data-value")}" value="" block/>`
  }
}

t("vl-rich-table", l), t("vl-rich-table-field", h), t("vl-rich-table-pager",
    c), t("vl-rich-table-search-filter", u);
export {
  d as RenderFunctions,
  r as SortDirections,
  l as VlRichTable,
  h as VlRichTableField,
  c as VlRichTablePager,
  u as VlRichTableSearchFilter,
  a as asc,
  s as desc
};
