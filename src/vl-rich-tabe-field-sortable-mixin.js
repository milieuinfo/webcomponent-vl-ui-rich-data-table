import {asc, desc} from "./domain/sortable";

export const sortableMixin = baseClass => class extends baseClass {

  _dressSortableHeader() {
    const headerCell = this._headerCell;
    headerCell.classList.add('vl-sortable');
    const span = document.createElement('span', 'vl-icon');
    span.setAttribute('before', '');
    span.setAttribute('icon', 'sort');
    span.setAttribute('name', 'sortable-span');
    const text = document.createElement('label');
    text.setAttribute('name', 'sortable-text');
    headerCell.appendChild(span);
    headerCell.appendChild(text);
    span.addEventListener("click", () => {
      this._sortButtonClicked();
    });

    this.richTable.addEventListener('sort', () => {
      this._updateSortableHeader();
    });
  };

  get direction() {
    return this.getAttribute('direction');
  };

  get priority() {
    return this.getAttribute('priority');
  };

  _sortButtonClicked(e) {
    let direction;
    switch (this.direction) {
      case asc:
        direction = null;
        break;
      case desc:
        direction = asc;
        break;
      default:
        direction = desc;
    }
    this.richTable.updateSortCriteria(
        {name: this.fieldName, direction: direction});
  };

  _updateSortableHeader() {
    const sortableSpan = this._headerCell.querySelector(
        '[name="sortable-span"]'),
        sortableText = this._headerCell.querySelector('[name="sortable-text"]');

    const index = this.richTable.sortCriteria.findIndex(
        criteria => criteria && criteria.name === this.fieldName);
    this._priority = index > -1 ? (index + 1) : null;

    const criteria = index !== null
        ? this.richTable.sortCriteria[index] : null;

    if (criteria) {
      this._direction = criteria.direction;
      switch (criteria.direction) {
        case asc:
          this.setAttribute('direction', asc);
          this.setAttribute('priority', this._priority);
          sortableText.innerHTML = this._priority;
          sortableSpan.setAttribute("icon", "nav-up");
          break;
        case desc:
          this.setAttribute('direction', desc);
          this.setAttribute('priority', this._priority);
          sortableText.innerHTML = this.priority;
          sortableSpan.setAttribute("icon", "nav-down");
          break;
        default:
          console.error(
              `${criteria.direction} is niet een geldige sort direction`);
      }
    } else {
      this._direction = null;
      this.removeAttribute('direction');
      this.removeAttribute('priority');
      sortableText.innerHTML = '';
      sortableSpan.setAttribute("icon", "sort");
    }
  };

  _directionChangedCallback(oldValue, newValue) {
    if (this.priority && newValue !== this._direction) {
      this.richTable.updateSortCriteria(
          {
            name: this.fieldName,
            direction: newValue,
            priority: this.priority
          });
    }
  };

  _priorityChangedCallback(oldValue, newValue) {
    if (this.direction && parseInt(newValue) !== this._priority) {
      this.richTable.updateSortCriteria({
        name: this.fieldName,
        direction: this.direction,
        priority: newValue
      });
    }
  }
};
