const form = document.getElementById('taskForm');
const input = document.getElementById('taskInput');
const list = document.getElementById('taskList');
const emptyMsg = document.getElementById('empty');
const counter = document.getElementById('counter');
const filtersBox = document.getElementById('filters');
const clearBtn = document.getElementById('clearDone');
const themeBtn = document.getElementById('themeBtn');

let tasks = [];
let filter = 'all';

function load() {
  try { tasks = JSON.parse(localStorage.getItem('tasks') || '[]'); }
  catch (e) { tasks = []; }
}

function save() {
  try { localStorage.setItem('tasks', JSON.stringify(tasks)); }
  catch (e) {  }
}

function render() {
  list.innerHTML = '';

  const visible = tasks.filter(t =>
    filter === 'all' ? true : filter === 'done' ? t.done : !t.done
  );

  visible.forEach(task => {
    const li = document.createElement('li');
    li.dataset.id = task.id;
    if (task.done) li.classList.add('done');

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = task.done;
    check.className = 'toggle';

    const span = document.createElement('span');
    span.textContent = task.text; // textContent is safe from XSS

    const del = document.createElement('button');
    del.className = 'del';
    del.type = 'button';
    del.textContent = '✕';
    del.setAttribute('aria-label', 'حذف');

    li.append(check, span, del);
    list.appendChild(li);
  });

  emptyMsg.hidden = visible.length > 0;

  const left = tasks.filter(t => !t.done).length;
  counter.textContent = `المتبقي: ${left} من ${tasks.length}`;

  filtersBox.querySelectorAll('button').forEach(b =>
    b.classList.toggle('active', b.dataset.filter === filter)
  );
}

function addTask(text) {
  tasks.unshift({ id: Date.now(), text, done: false });
  save();
  render();
}


// Add task
form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text);
  input.value = '';
  input.focus();
});

list.addEventListener('click', e => {
  const li = e.target.closest('li');
  if (!li) return;
  const id = Number(li.dataset.id);

  if (e.target.classList.contains('del')) {
    tasks = tasks.filter(t => t.id !== id);
  } else if (e.target.classList.contains('toggle')) {
    const t = tasks.find(t => t.id === id);
    t.done = e.target.checked;
  } else {
    return;
  }

  save();
  render();
});

// Double-click to edit
list.addEventListener('dblclick', e => {
  if (e.target.tagName !== 'SPAN') return;

  const li = e.target.closest('li');
  const id = Number(li.dataset.id);
  const task = tasks.find(t => t.id === id);

  const edit = document.createElement('input');
  edit.type = 'text';
  edit.className = 'edit';
  edit.value = task.text;
  e.target.replaceWith(edit);
  edit.focus();

  let finished = false;
  const finish = commit => {
    if (finished) return;
    finished = true;
    const v = edit.value.trim();
    if (commit && v) task.text = v;
    save();
    render();
  };

  edit.addEventListener('keydown', ev => {
    if (ev.key === 'Enter') finish(true);
    if (ev.key === 'Escape') finish(false);
  });
  edit.addEventListener('blur', () => finish(true));
});

filtersBox.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  filter = btn.dataset.filter;
  render();
});

clearBtn.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.done);
  save();
  render();
});

themeBtn.addEventListener('click', () => {
  const root = document.documentElement;
  const isDark =
    root.dataset.theme === 'dark' ||
    (!root.dataset.theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.dataset.theme = isDark ? 'light' : 'dark';
});

load();
render();
