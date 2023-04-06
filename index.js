// const input = document.getElementById('todoInput');
// const listNode = document.getElementById('todo-list');
// const errorMessage = document.getElementById('error-message');

// function handleSubmit(event) {
//   event.preventDefault();
//   const task = input.value;

//   // 입력된 값이 없다면 에러메세지 렌더.
//   if (!task) {
//     errorMessage.textContent = '할 일을 입력해주세요.';
//     return;
//   }
//   const listElem = document.createElement('li');
//   listElem.innerText = task;
//   listNode.appendChild(listElem);

//   // 입력창 리셋
//   input.value = '';
// }

// document.querySelector('form').addEventListener('submit', handleSubmit);

class Todo {
  constructor(title, description, priority) {
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.completed = false;
    this.createdAt = new Date();
    this.completedAt = null;
  }
}

class TodoList {
  constructor() {
    this.list = [];
  }

  add(todo) {
    let i = 0;
    while (i < this.list.length && this.list[i].priority >= todo.priority) {
      i++;
    }
    this.list.splice(i, 0, todo);
  }

  remove(index) {
    this.list.splice(index, 1);
  }

  toggleCompleted(index) {
    this.list[index].completed = !this.list[index].completed;
    this.list[index].completedAt = new Date();
  }
}

const todoList = new TodoList();
const form = document.querySelector('form');
const errorMessage = document.getElementById('error-message');
const [titleInput, descriptionInput, prioritySelect, list] =
  document.querySelectorAll(
    '#title-input, #description-input, #priority-select, #todo-list'
  );
console.log(errorMessage);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const priority = Number(prioritySelect.value);

  if (!title || !description) {
    errorMessage.textContent = 'Please enter a title and description.';
    return;
  }
  todoList.add(new Todo(title, description, priority));
  render();
  form.reset();
  errorMessage.textContent = '';
});

function render() {
  list.innerHTML = todoList.list
    .map(
      (todo, index) => `
        <li${todo.completed ? ' class="completed"' : ''}>
            <div>
                <h3>${todo.title}</h3>
                <p>${todo.description}</p>
            </div>
                <small>${
                  todo.completed
                    ? `Completed at: ${todo.completedAt.toLocaleString()}`
                    : `Created at: ${todo.createdAt.toLocaleString()}`
                }</small>
                <br/>
                <button onclick="toggleCompleted(${index})">${
        todo.completed ? 'Undo' : 'Done'
      }</button>
                <button onclick="remove(${index})">Remove</button>
        </li>
      `
    )
    .join('');
}

function remove(index) {
  todoList.remove(index);
  render();
}

function toggleCompleted(index) {
  todoList.toggleCompleted(index);
  render();
}
