const input = document.getElementById('todoInput');
const listNode = document.getElementById('todo-list');
const errorMessage = document.getElementById('error-message');

function handleSubmit(event) {
  event.preventDefault();
  const task = input.value;

  // 입력된 값이 없다면 에러메세지 렌더.
  if (!task) {
    errorMessage.textContent = '할 일을 입력해주세요.';
    return;
  }
  const listElem = document.createElement('li');
  listElem.innerText = task;
  listNode.appendChild(listElem);

  // 입력창 리셋
  input.value = '';
}

document.querySelector('form').addEventListener('submit', handleSubmit);
