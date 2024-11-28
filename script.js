// Estado inicial
const users = {
  1: { balance: 3000 },
  2: { balance: 3000 },
};
let history = [];
let fixedAccountsLocked = false;
let streamingLocked = false;

// Exibir calendário animado
document.addEventListener("DOMContentLoaded", () => {
  displayCalendar();
});

// Função para exibir calendário
function displayCalendar() {
  const now = new Date();
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  const day = now.getDate();
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();

  document.getElementById("calendar-day").textContent = day;
  document.getElementById("calendar-month").textContent = month;
  document.getElementById("calendar-year").textContent = year;
}

// Função para habilitar/desabilitar o formulário de alteração de saldo
function toggleBalanceForm() {
  const form = document.getElementById("balance-form");
  const toggleSwitch = document.getElementById("toggle-balance-form");
  if (toggleSwitch.checked) {
    form.style.display = "block";
  } else {
    form.style.display = "none";
  }
}

// Função para alterar o saldo de um usuário
function updateUserBalance() {
  const userId = parseInt(document.getElementById("user-select").value);
  const newBalance = parseFloat(document.getElementById("new-balance").value);

  if (isNaN(newBalance) || newBalance < 0) {
    alert("Por favor, insira um saldo válido.");
    return;
  }

  // Atualizar saldo do usuário
  users[userId].balance = newBalance;

  // Recalcular e atualizar saldos no sistema
  updateBalances();
  alert(`O saldo do Usuário ${userId} foi atualizado para R$ ${newBalance.toFixed(2)}.`);
}

// Função para adicionar dinheiro extra ao saldo de um usuário
function addExtraBalance() {
  const userId = parseInt(document.getElementById("user-extra-select").value);
  const extraBalance = parseFloat(document.getElementById("extra-amount").value);

  if (isNaN(extraBalance) || extraBalance <= 0) {
    alert("Por favor, insira um valor extra válido.");
    return;
  }

  // Atualizar saldo do usuário com o dinheiro extra
  users[userId].balance += extraBalance;

  // Atualizar histórico
  history.push({
    userId,
    item: "Entrada de dinheiro extra",
    value: extraBalance,
    date: new Date().toISOString().split("T")[0],
  });

  // Recalcular e atualizar saldos no sistema
  updateBalances();
  updateHistory();
  alert(`R$ ${extraBalance.toFixed(2)} foram adicionados ao saldo do Usuário ${userId}.`);
}

// Função para adicionar itens de gasto
function addItem(userId) {
  const itemInput = document.getElementById(`item${userId}`);
  const valueInput = document.getElementById(`value${userId}`);
  const dateInput = document.getElementById(`date${userId}`);
  const item = itemInput.value.trim();
  const value = parseFloat(valueInput.value);
  const date = dateInput.value;

  if (!item || isNaN(value) || value <= 0 || !date) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  if (users[userId].balance < value) {
    alert("Saldo insuficiente.");
    return;
  }

  // Atualizar saldo do usuário
  users[userId].balance -= value;

  // Atualizar histórico
  history.push({ userId, item, value, date });

  // Limpar campos
  itemInput.value = "";
  valueInput.value = "";
  dateInput.value = "";

  // Recalcular saldos
  updateBalances();
  updateHistory();
}

// Função para processar contas fixas
function processVariableAccounts() {
  if (fixedAccountsLocked) {
    alert("As contas fixas já foram confirmadas para este mês.");
    return;
  }

  const payer = parseInt(document.getElementById("payer-fixed").value);

  const accounts = [
    { id: "rent", name: "Aluguel" },
    { id: "condo", name: "Condomínio" },
    { id: "water", name: "Água" },
    { id: "electricity", name: "Luz" },
    { id: "internet", name: "Internet" },
    { id: "groceries", name: "Compras" },
  ];

  accounts.forEach((account) => {
    const input = document.getElementById(account.id);
    const value = parseFloat(input.value);

    if (!isNaN(value) && value > 0) {
      if (users[payer].balance < value) {
        alert(`Saldo insuficiente para pagar: ${account.name}`);
        return;
      }

      users[payer].balance -= value;
      history.push({
        userId: payer,
        item: account.name,
        value,
        date: new Date().toISOString().split("T")[0],
      });

      input.value = "";
      input.disabled = true;
    }
  });

  document.getElementById("payer-fixed").disabled = true;
  fixedAccountsLocked = true;

  updateBalances();
  updateHistory();
}

// Função para processar serviços de streaming
function processStreaming() {
  if (streamingLocked) {
    alert("Os serviços de streaming já foram confirmados para este mês.");
    return;
  }

  const payer = parseInt(document.getElementById("payer-streaming").value);
  const checkboxes = document.querySelectorAll("#streaming-form .form-check-input:checked");

  checkboxes.forEach((checkbox) => {
    const value = parseFloat(checkbox.value);
    const description = checkbox.nextElementSibling.textContent.split("(")[0].trim();

    if (users[payer].balance < value) {
      alert(`Saldo insuficiente para pagar: ${description}`);
      return;
    }

    users[payer].balance -= value;
    history.push({
      userId: payer,
      item: description,
      value,
      date: new Date().toISOString().split("T")[0],
    });

    checkbox.checked = false;
    checkbox.disabled = true;
  });

  document.getElementById("payer-streaming").disabled = true;
  streamingLocked = true;

  updateBalances();
  updateHistory();
}

// Atualizar saldos
function updateBalances() {
  document.getElementById("balance1").textContent = users[1].balance.toFixed(2);
  document.getElementById("balance2").textContent = users[2].balance.toFixed(2);

  const totalBalance = users[1].balance + users[2].balance;
  document.getElementById("total-balance").textContent = totalBalance.toFixed(2);
}

// Atualizar histórico
function updateHistory() {
  const historyTable = document.getElementById("history-table");
  historyTable.innerHTML = "";

  history.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>Usuário ${entry.userId}</td>
      <td>${entry.date}</td>
      <td>${entry.item}</td>
      <td>R$ ${entry.value.toFixed(2)}</td>
    `;
    historyTable.appendChild(row);
  });
}

// Baixar planilha
function downloadSpreadsheet() {
  let csvContent = "data:text/csv;charset=utf-8,Usuário,Data,Descrição,Valor\n";
  history.forEach((entry) => {
    const row = `Usuário ${entry.userId},${entry.date},${entry.item},R$ ${entry.value.toFixed(2)}`;
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "gastos_usuarios.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Resetar tudo
function resetData() {
  if (!confirm("Tem certeza que deseja zerar todos os dados?")) return;

  users[1].balance = 3000;
  users[2].balance = 3000;
  history = [];
  fixedAccountsLocked = false;
  streamingLocked = false;

  const fixedInputs = document.querySelectorAll("#fixed-accounts-form input");
  fixedInputs.forEach((input) => input.disabled = false);
  document.getElementById("payer-fixed").disabled = false;

  const streamingCheckboxes = document.querySelectorAll("#streaming-form .form-check-input");
  streamingCheckboxes.forEach((checkbox) => checkbox.disabled = false);
  document.getElementById("payer-streaming").disabled = false;

  updateBalances();
  updateHistory();
}
