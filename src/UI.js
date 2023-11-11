import { createDomElement } from "./helpers/createDomElement";
import pubsub from "./helpers/pubsub";
import icon from "./images/checkmark.svg";
import removeIcon from "./images/trash-with-lines.svg";

function loadPage() {
  const body = document.querySelector("body");
  const header = createHeader();
  const sidebar = createSidebar();
  const mainContent = createMainContent();
  const footer = createFooter();
  document.body.append(header, sidebar, mainContent, footer);
}

function createHeader() {
  const header = document.createElement("div");
  header.classList.add("header");
  const headerTitle = document.createElement("h1");
  headerTitle.textContent = "Todo List";
  header.appendChild(headerTitle);
  return header;
}

function createMainContent() {
  const mainContent = document.createElement("div");
  mainContent.classList.add("main");
  const todoContainer = document.createElement("div");
  todoContainer.classList.add("todo-container");
  const todoItems = document.createElement("div");
  todoItems.classList.add("todo-items");
  const todoDetails = document.createElement("div");
  todoDetails.classList.add("todo-details");
  todoDetails.style.display = "none";

  const addTodoField = document.createElement("div");
  addTodoField.classList.add("add-todo-field");
  const addTodoForm = document.createElement("form");
  const inputTodo = createDomElement({
    elementTag: "input",
    className: "add-todo-input",
    attr: { type: "text", placeholder: "Add Task" },
  });
  const addTodoButton = createDomElement({
    elementTag: "button",
    textContent: "+",
    className: "add-todo-button",
    attr: { disabled: "" },
  });
  const completedContainer = createDomElement({
    elementTag: "div",
    className: "completed-container",
  });
  const completedTitle = createDomElement({
    elementTag: "h3",
    textContent: "Completed",
    className: "completed-title",
  });
  const completedItems = createDomElement({
    elementTag: "div",
    className: "completed",
  });

  inputTodo.addEventListener("input", () => {
    addTodoButton.disabled = false;
  });
  addTodoButton.addEventListener("click", (e) => {
    e.preventDefault();
    pubsub.publish("addTodoItem", inputTodo.value);
    inputTodo.value = "";
    addTodoButton.disabled = true;
  });
  pubsub.subscribe("todoAdded", displayNewTodo);
  pubsub.subscribe("completionUpdated", displayCompletion);
  pubsub.subscribe("counterUpdated", updateCounterDisplay);

  addTodoField.append(addTodoForm);
  addTodoForm.append(addTodoButton, inputTodo);
  completedContainer.append(completedTitle, completedItems);
  todoContainer.append(addTodoField, todoItems, completedContainer);
  mainContent.append(todoContainer, todoDetails);

  return mainContent;
}

//display newly added todo item
function displayNewTodo({ title, uniqueID, isComplete }) {
  const todoItemContainer = document.querySelector(".todo-items");
  const todoItem = createDomElement({
    elementTag: "div",
    className: "todo-item",
    attr: { "data-id": uniqueID },
  });
  const radioButton = createDomElement({
    elementTag: "button",
    className: "radio-button",
  });
  const checkIcon = createDomElement({
    elementTag: "img",
    className: "checkmark",
    attr: { src: icon },
  });
  const todoTitle = document.createElement("span");
  todoTitle.textContent = title;

  radioButton.append(checkIcon);

  todoItem.append(radioButton, todoTitle);
  if (isComplete === true) {
    displayCompletion({
      completionStatus: isComplete,
      todoID: uniqueID,
      todoElement: todoItem,
    });
  } else todoItemContainer.prepend(todoItem);

  todoItem.addEventListener("click", (e) => {
    const target = e.target;
    let todoID;
    if (
      target.classList.contains("radio-button") ||
      target.classList.contains("checkmark")
    ) {
      const todoClicked = target.closest(".todo-item");
      todoID = todoClicked.getAttribute("data-id");
      pubsub.publish("todoSelected", todoID);
      pubsub.publish("changeCompletionStatus");
    } else {
      todoID = e.currentTarget.getAttribute("data-id");
      pubsub.publish("todoSelected", todoID);
    }
  });
  radioButton.addEventListener.onclick;

  pubsub.publish("updateCounter");
  pubsub.subscribe("activeTodoDetail", displayTodoDetails());
}

//display all todo items in a selected list
function displayTodoItems(list) {
  document.querySelector(".todo-items").innerHTML = "";
  document.querySelector(".completed").innerHTML = "";
  list.getTodoItems().forEach((item) => {
    displayNewTodo({
      title: item.itemTitle,
      uniqueID: item.uniqueID,
      isComplete: item.itemCompletion,
    });
  });
}

function removeTodo(id) {
  let removeTodo = document.querySelector(`[data-id="${id}"]`);
  removeTodo.remove();
  pubsub.publish("updateCounter");
}
function clearTodoDetails() {
  const todoDetails = document.querySelector(".todo-details");
  todoDetails.innerHTML = " ";
}

function displayCompletion({ completionStatus, todoID, todoElement }) {
  const completed = document.querySelector(".completed");
  const completedContainer = document.querySelector(".completed-container");
  const completedTodo = document.querySelector(`[data-id="${todoID}"]`);
  let checkMark;
  if (completionStatus === true) {
    if (todoElement) {
      todoElement.classList.add("completed-todo");
      checkMark = todoElement.firstChild.firstChild;
      checkMark.classList.add("checkmark-visible");
      completed.append(todoElement);
    } else {
      completedTodo.classList.add("completed-todo");
      checkMark = completedTodo.firstChild.firstChild;
      checkMark.classList.add("checkmark-visible");
      completed.append(completedTodo);
    }
  } else if (completionStatus === false) {
    const todoContainer = document.querySelector(".todo-items");
    completedTodo.classList.remove("completed-todo");
    todoContainer.append(completedTodo);
    checkMark = completedTodo.firstChild.firstChild;
    checkMark.classList.remove("checkmark-visible");
  }
  pubsub.publish("updateCounter");

  if (completed.hasChildNodes() === true) {
    completedContainer.style.display = "block";
  } else {
    completedContainer.style.display = "none";
  }
}

//display todo details page using closure to create and maintain the value of a private variable perviousTodo
function displayTodoDetails() {
  let previousTodo;
  function renderDetails({ selectedTodo, currentList }) {
    if (selectedTodo === previousTodo) return;

    const detailContainer = document.querySelector(".todo-details");
    while (detailContainer.firstChild) {
      detailContainer.removeChild(detailContainer.firstChild);
    }
    document.querySelector(".todo-details").style.display = "flex";
    const title = createDomElement({
      elementTag: "div",
      className: "todo-detail-header",
      textContent: selectedTodo.itemTitle,
    });
    const description = createDomElement({
      elementTag: "textarea",
      className: "description",
      textContent: selectedTodo.itemDescription,
      attr: {
        placeholder: "Enter description",
      },
    });
    const priority = createDomElement({
      elementTag: "button",
      className: "priority",
      textContent: "Priority",
    });
    const dueDate = createDomElement({
      elementTag: "button",
      className: "due-date",
    });
    displayDueDate(selectedTodo.itemDueDate, dueDate);

    const remove = createDomElement({
      elementTag: "button",
      className: "remove",
    });
    const removeImage = createDomElement({
      elementTag: "img",
      attr: { src: removeIcon },
    });

    description.addEventListener("input", () => {
      pubsub.publish("modifyDescription", description.value);
    });

    priority.addEventListener("click", (e) => {
      pubsub.publish("changePriority");
      pubsub.publish("updateCounter");
      if (currentList.getListID() === "1") {
        displayTodoItems(currentList);
      }
    });

    dueDate.addEventListener("click", () => {
      if (document.querySelector(".due-date-modal")) return;
      dueDateUI(detailContainer);
    });

    remove.addEventListener("click", () => {
      pubsub.publish("removeTodo", { unwantedTodo: selectedTodo });
      removeTodo(selectedTodo.uniqueID);
      clearTodoDetails();
    });
    remove.append(removeImage);
    detailContainer.append(title, description, priority, dueDate, remove);

    previousTodo = selectedTodo;
  }

  return renderDetails;
}

function dueDateUI(container) {
  let date;
  let time;

  const dueDateBackDrop = createDomElement({
    elementTag: "div",
    className: "due-date-backdrop",
  });
  const dueDateModal = createDomElement({
    elementTag: "div",
    className: "due-date-modal",
  });
  const datePickerLabel = createDomElement({
    elementTag: "label",
    className: "date-label",
    textContent: "Date",
    attr: { for: "date-picker" },
  });
  const datePicker = createDomElement({
    elementTag: "input",
    className: "date-picker",
    attr: { id: "date-picker", type: "date" },
  });
  const timePickerLabel = createDomElement({
    elementTag: "label",
    className: "time-label",
    textContent: "Time",
    attr: { for: "time-picker" },
  });
  const timePicker = createDomElement({
    elementTag: "input",
    className: "time-picker",

    attr: { id: "time-picker", type: "time" },
  });
  const setButton = createDomElement({
    elementTag: "button",
    className: "setDueDate",
    textContent: "Set",
  });
  const cancelButton = createDomElement({
    elementTag: "button",
    className: "cancel-button",
    textContent: "Cancel",
  });
  dueDateBackDrop.append(dueDateModal);
  dueDateModal.append(
    datePickerLabel,
    timePickerLabel,
    datePicker,
    timePicker,
    cancelButton,
    setButton
  );
  container.append(dueDateBackDrop);
  dueDateBackDrop.addEventListener("click", (e) => {
    if (!e.target.closest(".due-date-modal")) {
      e.currentTarget.remove();
    }
  });

  datePicker.addEventListener("input", (e) => {
    date = e.target.value;
  });
  timePicker.addEventListener("input", (e) => {
    time = e.target.value;
  });
  setButton.addEventListener("click", (e) => {
    pubsub.publish("dueDateSelected", { date: date, time: time });
    dueDateBackDrop.remove();
  });
  cancelButton.addEventListener("click", (e) => {
    dueDateBackDrop.remove();
  });
  pubsub.subscribe("addedDueDateData", displayDueDate);
}

function displayDueDate(
  { date, time } = {},
  dueDateButton = document.querySelector(".due-date")
) {
  dueDateButton.textContent = "Due-date";
  if (time) dueDateButton.textContent = date + ", " + time;
  else if (date && !time) dueDateButton.textContent = date;
}

//sidebar
function createSidebar() {
  const sidebar = document.createElement("div");
  sidebar.classList.add("sidebar");

  const staticListDivider = document.createElement("div");
  staticListDivider.classList.add("divider");

  const addNewProject = document.createElement("button");
  addNewProject.classList.add("add-new");
  addNewProject.textContent = "New list";
  addNewProject.addEventListener("click", () => {
    displayNewListPopup();
  });

  const staticListCount = 3;
  const staticListTitle = ["Today", "Priority", "All Tasks"];
  for (let i = 0; i < staticListCount; i++) {
    displayNewList({
      name: staticListTitle[i],
      parent: sidebar,
      id: i,
      className: staticListTitle[i].replace(/ /g, "-"),
    });
    pubsub.publish("addDefaultList", staticListTitle[i]);
  }
  pubsub.subscribe("newListAdded", displayNewList);
  pubsub.subscribe("todoItemsInTheList", displayTodoItems);
  sidebar.append(staticListDivider, addNewProject);
  return sidebar;
}

//Add new list to the display
function displayNewList({
  name,
  id,
  parent = document.querySelector(".sidebar"),
  className,
}) {
  const newList = document.createElement("button");
  newList.textContent = name;
  newList.setAttribute("data-list", id);
  if (className) {
    newList.classList.add(className);
    if (id === 0) {
      newList.classList.add("active-list");
    }
  } else {
    newList.classList.add("custom-list");
    toggleActiveList(newList);
    document.querySelector(".todo-details").style.display = "none";
  }
  const counter = document.createElement("span");
  newList.append(counter);
  parent.append(newList);

  newList.addEventListener("click", (e) => {
    document.querySelector(".todo-items").innerHTML = " ";
    document.querySelector(".todo-details").style.display = "none";
    pubsub.publish("listSelected", e.currentTarget.getAttribute("data-list"));
    toggleActiveList(e.currentTarget);

    clearTodoDetails();
  });
}

function updateCounterDisplay(countersData) {
  const counters = document.querySelectorAll("[data-list]>span");
  counters.forEach((counter, i) => {
    if (countersData[i] === 0) {
      counter.textContent = "";
    } else {
      counter.textContent = countersData[i];
    }
  });
}

function toggleActiveList(activeList) {
  const allList = document.querySelectorAll("[data-list]");
  allList.forEach((list) => {
    if (list.classList.contains("active-list")) {
      list.classList.remove("active-list");
    }
  });
  activeList.classList.add("active-list");
}

function displayNewListPopup() {
  const sidebar = document.querySelector(".sidebar");
  const backdrop = document.createElement("div");
  backdrop.classList.add("backdrop");
  backdrop.style.display = "flex";
  backdrop.addEventListener(
    "click",
    (e) => {
      if (e.target.matches(".backdrop")) {
        backdrop.remove();
      }
    },
    { once: true }
  );

  const modal = createDomElement({ elementTag: "div", className: "modal" });
  const form = createDomElement({
    elementTag: "form",
    className: "modal-form",
  });
  const closeButton = createDomElement({
    elementTag: "button",
    className: "close-button",
    textContent: "X",
  });
  closeButton.addEventListener(
    "click",
    (e) => {
      e.preventDefault();
      backdrop.remove();
    },
    { once: true }
  );

  const inputList = createDomElement({
    elementTag: "input",
    attr: {
      type: "text",
      placeholder: "Add a list title",
      maxlength: 200,
      value: "",
    },
  });
  inputList.addEventListener("input", (event) => {
    continueButton.disabled = false;
    event.stopPropagation();
  });

  const continueButton = createDomElement({
    elementTag: "button",
    className: "continueButton",
    textContent: "Continue",
    attr: { disabled: "" },
  });
  continueButton.addEventListener(
    "click",
    (e) => {
      e.preventDefault();
      pubsub.publish("addNewList", inputList.value);
      backdrop.remove();
    },
    { once: true }
  );

  sidebar.append(backdrop);
  backdrop.append(modal);
  modal.append(form);
  form.append(closeButton, inputList, continueButton);
}

function createFooter() {
  const footer = document.createElement("div");
  footer.classList.add("footer");
  const footerText = document.createElement("p");
  footerText.innerHTML = "Copyright &copy; 2023 Joey Young";
  footer.append(footerText);

  return footer;
}

export default loadPage;
