const form = document.getElementById('transactionForm');
const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const categoryInput = document.getElementById('category');
const transactionList = document.getElementById('transactionList');
const searchInput = document.getElementById('searchInput');
const filterType = document.getElementById('filterType');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let editId = null;

function save() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function updateSummary() {
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  document.getElementById('totalIncome').textContent = `PKR ${income}`;
  document.getElementById('totalExpense').textContent = `PKR ${expense}`;
  document.getElementById('balance').textContent = `PKR ${income - expense}`;
}

function render() {
  const search = searchInput.value.toLowerCase();
  const filter = filterType.value;

  transactionList.innerHTML = '';
  transactions
    .filter(t => t.title.toLowerCase().includes(search))
    .filter(t => filter === 'all' || t.type === filter)
    .forEach(t => {
      const li = document.createElement('li');
      li.className = t.type === 'expense' ? 'expense-item' : '';
      li.innerHTML = `
        <div class="tx-info">
          <strong>${t.title}</strong>
          <small>${t.category} • ${t.type === 'income' ? '+' : '-'}PKR ${t.amount}</small>
        </div>
        <div class="tx-actions">
          <button onclick="editTransaction(${t.id})">✏️</button>
          <button onclick="deleteTransaction(${t.id})">🗑️</button>
        </div>
      `;
      transactionList.appendChild(li);
    });

  updateSummary();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;
  const category = categoryInput.value;

  if (!title || isNaN(amount) || amount <= 0) return;

  if (editId !== null) {
    transactions = transactions.map(t =>
      t.id === editId ? { ...t, title, amount, type, category } : t
    );
    editId = null;
    form.querySelector('button').textContent = 'Add Transaction';
  } else {
    transactions.push({ id: Date.now(), title, amount, type, category });
  }

  save();
  render();
  form.reset();
});

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  save();
  render();
}

function editTransaction(id) {
  const t = transactions.find(t => t.id === id);
  titleInput.value = t.title;
  amountInput.value = t.amount;
  typeInput.value = t.type;
  categoryInput.value = t.category;
  editId = id;
  form.querySelector('button').textContent = 'Update Transaction';
}

searchInput.addEventListener('input', render);
filterType.addEventListener('change', render);

render();