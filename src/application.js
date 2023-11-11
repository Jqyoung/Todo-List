import pubsub from "./helpers/pubsub";
import TodoItem from "./todoItems";
import { listFactory } from "./list";
import { format, isThisWeek } from "date-fns";

const list = [];
const defaultList = [];
let currentList;
let currentTodo;

function addDefaultList(name) {
  const newList = listFactory(name);
  defaultList.push(newList);
  currentList = defaultList[0];
}

function addList(name) {
  const newList = listFactory(name);
  pubsub.publish("newListAdded", { name: name, id: newList.getListID() });
  list.push(newList);
  selectCurrentList(newList.getListID());
}

function selectCurrentList(id) {
  let isList = list.find((listItem) => listItem.getListID() === id);
  if (isList) {
    currentList = isList;
    pubsub.publish("todoItemsInTheList", currentList);
  } else {
    currentList = defaultList.find((listItem) => listItem.getListID() === id);
    pubsub.publish("todoItemsInTheList", currentList);
  }
}

function addTodoItem(title, list = currentList) {
  const todoItem = new TodoItem(title);
  if (list.getListID() !== defaultList[2].getListID()) {
    defaultList[2].addTodoItem(todoItem);
  }
  list.addTodoItem(todoItem);
  pubsub.publish("todoAdded", { title: title, uniqueID: todoItem.uniqueID });
}

function removeTodo({
  unwantedTodo,
  selectedList = currentList,
  isChangePriority = false,
}) {
  if (isChangePriority === true) {
    const priorityItems = defaultList[1].getTodoItems();
    priorityItems.forEach((item, i) => {
      if (unwantedTodo.uniqueID === item.uniqueID) {
        priorityItems.splice(i, 1);
      }
    });
    return;
  }

  const todoItems = selectedList.getTodoItems();
  todoItems.forEach((item, i) => {
    if (unwantedTodo.uniqueID === item.uniqueID) {
      todoItems.splice(i, 1);
    }
  });

  list.forEach((listing) => {
    let todoItems = listing.getTodoItems();
    todoItems.forEach((item, i) => {
      if (unwantedTodo.uniqueID === item.uniqueID) {
        todoItems.splice(i, 1);
      }
    });
  });

  defaultList.forEach((list) => {
    let todoItems = list.getTodoItems();
    todoItems.forEach((item, i) => {
      if (unwantedTodo.uniqueID === item.uniqueID) {
        todoItems.splice(i, 1);
      }
    });
  });
}

function selectCurrentTodo(ID) {
  currentTodo = currentList
    .getTodoItems()
    .find((todoItem) => todoItem.uniqueID === ID);
  pubsub.publish("activeTodoDetail", {
    selectedTodo: currentTodo,
    currentList: currentList,
  });
}

function modifyDescription(newDescription) {
  currentTodo.itemDescription = newDescription;
}

function changePriority() {
  let priority;
  currentTodo.setItemPriority();
  priority = currentTodo.itemPriority;
  if (priority === true) defaultList[1].addTodoItem(currentTodo);
  else if (priority === false) {
    removeTodo({
      unwantedTodo: currentTodo,
      list: defaultList[1],
      isChangePriority: true,
    });
  }
}

function addDueDate({ date, time }) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  let combineDateTime;
  let dueTime;
  combineDateTime = time ? date + "T" + time : date + "T00:00:00";
  const dueDate = new Date(combineDateTime);
  currentTodo.itemDueDate = dueDate;

  if (!date && time) {
    currentTodo.itemDueDate = { date: "Today", time: time };
    pubsub.publish("addedDueDateData", currentTodo.itemDueDate);
    console.log("hi");
    return;
  } else if (!date) {
    pubsub.publish("addedDueDateData", "Due-date");
    return;
  }

  if (time) {
    dueTime = format(dueDate, "hh:mma");
  }

  if (dueDate.getDate() === today.getDate()) {
    currentTodo.itemDueDate = { date: "Today", time: dueTime };
    if (currentList.getListID() !== "0") {
      defaultList[0].addTodoItem(currentTodo);
    }
  } else if (dueDate.getDate() === tomorrow.getDate()) {
    currentTodo.itemDueDate = { date: "Tomorrow", time: dueTime };
  } else if (dueDate.getFullYear() !== today.getFullYear()) {
    currentTodo.itemDueDate = {
      date: format(dueDate, "EEE, MMM dd, yyyy"),
      time: dueTime,
    };
  } else {
    currentTodo.itemDueDate = {
      date: format(dueDate, "EEE, MMM dd"),
      time: dueTime,
    };
  }
  pubsub.publish("addedDueDateData", currentTodo.itemDueDate);
}

function changeCompletion(id) {
  currentTodo.setItemCompletion();
  pubsub.publish("completionUpdated", {
    completionStatus: currentTodo.itemCompletion,
    todoID: currentTodo.uniqueID,
  });
}

function getTodoCount() {
  const defaultCounters = [];
  const listCounters = [];
  defaultList.forEach((project, i) => {
    defaultCounters[i] = project.getTotalTodoItems();
  });
  if (list.length != 0) {
    list.forEach((list, i) => {
      listCounters[i] = list.getTotalTodoItems();
    });
  }
  const counters = defaultCounters.concat(listCounters);

  pubsub.publish("counterUpdated", counters);
}

function initiateLogic() {
  pubsub.subscribe("addDefaultList", addDefaultList);
  pubsub.subscribe("addNewList", addList);
  pubsub.subscribe("addTodoItem", addTodoItem);
  pubsub.subscribe("removeTodo", removeTodo);
  pubsub.subscribe("listSelected", selectCurrentList);
  pubsub.subscribe("todoSelected", selectCurrentTodo);
  pubsub.subscribe("modifyDescription", modifyDescription);
  pubsub.subscribe("changePriority", changePriority);
  pubsub.subscribe("dueDateSelected", addDueDate);
  pubsub.subscribe("changeCompletionStatus", changeCompletion);
  pubsub.subscribe("updateCounter", getTodoCount);
}
export { initiateLogic };
