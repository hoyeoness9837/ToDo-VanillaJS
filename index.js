// 각 투두객체의 기본 스트럭쳐.
class TodoItem {
  constructor(text, priority) {
    this.id = ParseItem.generateUniqueId();
    this.text = text;
    this.completed = false;
    this.stars = ParseItem.convertToStars(priority);
    this.createdAt = new Date();
    this.completedAt = null;
  }
}

class ParseItem {
  // 각 투두에 붙여질 유니크아이디 생성함수.
  static generateUniqueId() {
    return 'xxxx-yxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  //우선순위의 숫자 크기에 따라 별 모영의 갯수로 중요도를 표시.
  static convertToStars(num) {
    let stars = '';
    for (let i = 0; i < num; i++) {
      stars += '⭐';
    }
    return stars;
  }

  static getTimeDifference(start, end) {
    // 시작 시간과 끝 시간의 차이를 밀리초 단위로 계산
    const diff = Math.abs(Date.parse(end) - Date.parse(start));

    // 차이를 일, 시간, 분, 초 단위로 변환
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    // 결과를 텍스트로 반환
    let result = '';
    if (hours > 0) {
      result += `${hours}hrs `;
    }
    if (minutes > 0) {
      result += `${minutes}min `;
    }
    if (seconds > 0) {
      result += `${seconds}sec`;
    }
    return result;
  }
}

// client가 입력한 텍스트를 이용하여 로컬스토리지에 CRUD 하고, 요소들을 생성해 렌더링해줌.
class TodoList {
  // 투두의 디폴트 상태
  constructor(modal) {
    this.todoItems = [];
    this.modal = modal;
    this.init(); // 생성자에서 메소드를 직접 불러 new TodoList()로 새로운 객체를 만들때 마다 init()이 먼저 작동함.
  }

  init() {
    // 과거 작성한 기록이 있는지 로드.
    this.loadFromStorage();
    // 이벤트 핸들러를 폼태그와 버튼에 바인딩하여 DOM 리스닝 하도록 함.
    const form = document.querySelector('form');
    form.addEventListener('submit', this.addTodo.bind(this));

    const clearBtn = document.getElementById('clearBtn');
    clearBtn.addEventListener('click', this.clearAll.bind(this));
  }

  loadFromStorage() {
    const todoItemsString = localStorage.getItem('todoItems');
    if (todoItemsString) {
      const copytext = JSON.parse(todoItemsString);
      this.todoItems = copytext;
      this.renderTodoList();
    }
  }

  updateToStorage() {
    localStorage.setItem('todoItems', JSON.stringify(this.todoItems));
  }

  addTodo(event) {
    event.preventDefault();
    const input = document.getElementById('todoInput');
    const errorMessage = document.getElementById('error-message');
    const text = input.value.trim();
    const priority = document.querySelector('#priority-select');
    if (text) {
      const todoItem = new TodoItem(text, Number(priority.value));
      this.todoItems.push(todoItem);
      this.renderTodoList();
      this.updateToStorage();
      input.value = '';
    } else {
      //투두 인풋이 비어있으면 errorMessage 반환
      errorMessage.textContent = 'PLEASE ENTER TASKS.';
      setTimeout(() => {
        errorMessage.textContent = '';
      }, 3 * 1000);
    }
  }

  deleteTodo(id) {
    this.todoItems = this.todoItems.filter((item) => item.id !== id);
    this.renderTodoList();
    this.updateToStorage();
  }

  editTodo(id) {
    const todo = this.todoItems.find((item) => item.id === id);
    if (todo) {
      this.modal.onSave = (newText) => {
        todo.text = newText;
        this.renderTodoList();
        this.updateToStorage();
      };
      this.modal.open(todo.text);
    }
  }

  toggleCompleted(id) {
    const index = this.todoItems.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.todoItems[index].completed = !this.todoItems[index].completed;
      this.todoItems[index].completed
        ? (this.todoItems[index].completedAt = new Date())
        : (this.todoItems[index].completedAt = null);
      this.renderTodoList();
      this.updateToStorage();
    }
  }

  //모든 투두 아이템 삭제.
  clearAll() {
    this.todoItems = [];
    this.renderTodoList();
    this.updateToStorage();
  }

  renderTodoList() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';

    // 렌더링 되기 이전 높은 우선순위가 맨 위로 올라오도록 정렬.
    const sortedItems = this.todoItems.sort(
      (a, b) => b.stars.length - a.stars.length
    );

    // 각 투두리스트에 들어가는 요소 생성.
    for (const item of sortedItems) {
      const todoItemEl = document.createElement('div');
      todoItemEl.className = 'todoItem';

      const priorityEl = document.createElement('span');
      priorityEl.classList.add('star');
      priorityEl.textContent = item.stars;
      todoItemEl.appendChild(priorityEl);

      const checkboxEl = document.createElement('input');
      checkboxEl.type = 'checkbox';
      checkboxEl.checked = item.completed;
      checkboxEl.addEventListener(
        'change',
        this.toggleCompleted.bind(this, item.id)
      );
      todoItemEl.appendChild(checkboxEl);

      const textEl = document.createElement('div');
      textEl.className = 'text';
      textEl.textContent = item.text;
      if (item.completed) {
        textEl.classList.add('completed');
      }
      todoItemEl.appendChild(textEl);

      const timestampEl = document.createElement('small');
      timestampEl.classList.add('timeStamp');
      item.completed
        ? (timestampEl.textContent = `Took ${ParseItem.getTimeDifference(
            item.createdAt,
            item.completedAt
          )} to finish`)
        : (timestampEl.textContent = `${item.createdAt.toLocaleString()}`);
      todoItemEl.appendChild(timestampEl);

      const deleteBtnEl = document.createElement('button');
      deleteBtnEl.id = 'deleteBtn';
      deleteBtnEl.textContent = 'Delete';
      deleteBtnEl.addEventListener(
        'click',
        this.deleteTodo.bind(this, item.id)
      );
      todoItemEl.appendChild(deleteBtnEl);

      const editBtnEl = document.createElement('button');
      editBtnEl.textContent = 'Edit';
      editBtnEl.id = 'edit-button';
      editBtnEl.addEventListener('click', this.editTodo.bind(this, item.id));
      todoItemEl.appendChild(editBtnEl);

      // append all element to todolist elem
      todoList.appendChild(todoItemEl);
    }
  }
}

class Modal {
  constructor(modalElementId, editTodoInputId) {
    this.modal = document.getElementById(modalElementId);
    this.editTodoInput = document.getElementById(editTodoInputId);
    this.saveButton = document.getElementById('save-button');
    this.isOpen = false;
    this.onSave = () => {};
  }

  open(todoText) {
    this.editTodoInput.value = todoText;
    this.modal.style.display = 'block';
    this.isOpen = true;
    this.saveButton.addEventListener('click', this.handleButtonClick);
  }

  close() {
    this.modal.style.display = 'none';
    this.editTodoInput.value = '';
    this.isOpen = false;
    this.saveButton.removeEventListener('click', this.handleButtonClick);
  }

  handleButtonClick = () => {
    const editedTodoText = this.editTodoInput.value.trim();

    if (editedTodoText) {
      this.onSave(editedTodoText);
      this.close();
    }
    const closeButton = document.getElementById('close-button');
    closeButton.addEventListener('click', this.close.bind(this));
  };
}

const modal = new Modal('modal', 'edit-todo-input');
const todoList = new TodoList(modal);
