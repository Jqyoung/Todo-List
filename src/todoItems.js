export default class TodoItem {
  constructor(title, description, dueDate) {
    this.id;
    this.title = title;
    this.description = description;
    this.dueDate;
    this.priority = false;
    this.completion = false;
    this.generateID();
  }

  static itemID = 0;

  generateID() {
    this.id = TodoItem.itemID++;
  }

  get uniqueID() {
    return this.id.toString();
  }

  get itemTitle() {
    return this.title;
  }

  get itemDescription() {
    return this.description;
  }

  get itemDueDate() {
    return this.dueDate;
  }

  set itemTitle(newTitle) {
    this.title = newTitle;
  }

  set itemDescription(newDescription) {
    this.description = newDescription;
  }

  set itemDueDate(newDueDate) {
    this.dueDate = newDueDate;
  }

  setItemPriority() {
    switch (this.priority) {
      case false:
        this.priority = true;
        break;
      case true:
        this.priority = false;
        break;
    }
  }

  setItemCompletion() {
    switch (this.completion) {
      case false:
        this.completion = true;
        break;
      case true:
        this.completion = false;
        break;
    }
  }

  get itemCompletion() {
    return this.completion;
  }

  get itemPriority() {
    return this.priority;
  }
}
