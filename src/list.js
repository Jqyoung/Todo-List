import TodoItem from "./todoItems";

let listID = 0;

const listFactory = (listName) => {
  const todoItems = [];
  let ID = listID++;

  const getListID = () => {
    return ID.toString();
  };

  const addTodoItem = (newItem) => {
    todoItems.push(newItem);
  };

  const getTodoItems = () => {
    return todoItems;
  };

  const setListName = (newName) => {
    listName = newName;
  };

  const getListName = () => {
    return listName;
  };

  const getTotalTodoItems = () => {
    let count = 0;
    todoItems.forEach((item) => {
      if (item.completion === false) {
        count++;
      }
    });
    return count;
  };

  return {
    getListID,
    addTodoItem,
    getTodoItems,
    setListName,
    getListName,
    getTotalTodoItems,
  };
};

export { listFactory };
