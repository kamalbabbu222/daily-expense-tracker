
const budgetInput = document.getElementById("budget");
const saveBudgetBtn = document.getElementById("saveBudget");
const expenseForm = document.getElementById("expenseForm");

const totalBudget = document.getElementById("totalBudget");
const totalSpent = document.getElementById("totalSpent");
const remaining = document.getElementById("remaining");
const percentage = document.getElementById("percentage");
const progress = document.getElementById("progress");
const expenseList = document.getElementById("expenseList");

let budget = Number(localStorage.getItem("monthlyBudget")) || 0;

let expenses = JSON.parse(
    localStorage.getItem("expenses") || "[]"
);

document.getElementById("date").value =
    new Date().toLocaleDateString("en-CA");

function formatMoney(amount) {
    return "₹" + amount.toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}

function saveData() {
    localStorage.setItem("monthlyBudget", budget);
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

saveBudgetBtn.addEventListener("click", function () {
    const newBudget = Number(budgetInput.value);

    if (!Number.isFinite(newBudget) || newBudget <= 0) {
        alert("Please enter a valid monthly budget!");
        return;
    }

    budget = newBudget;
    saveData();
    updateDashboard();
    budgetInput.value = "";
});

expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    if (
        !title ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !date
    ) {
        alert("Please enter valid expense details!");
        return;
    }

    const expense = {
        id: Date.now(),
        title: title,
        amount: amount,
        category: category,
        date: date
    };

    expenses.push(expense);

    saveData();
    updateDashboard();
    expenseForm.reset();

    document.getElementById("date").value =
        new Date().toLocaleDateString("en-CA");
});

function deleteExpense(id) {
    expenses = expenses.filter(function (expense) {
        return expense.id !== id;
    });

    saveData();
    updateDashboard();
}

function updateDashboard() {
    const today = new Date().toLocaleDateString("en-CA");
    const month = today.slice(0, 7);

    // Only the current month's expenses count toward this budget.
    const monthlyExpenses = expenses.filter(function (expense) {
        return expense.date.slice(0, 7) === month;
    });

    const spent = monthlyExpenses.reduce(function (sum, expense) {
        return sum + expense.amount;
    }, 0);

    const balance = budget - spent;
    const usedPercent = budget > 0
        ? (spent / budget) * 100
        : 0;

    totalBudget.textContent = formatMoney(budget);
    totalSpent.textContent = formatMoney(spent);
    remaining.textContent = formatMoney(balance);

    percentage.textContent = Math.round(usedPercent) + "%";
    progress.style.width = Math.min(usedPercent, 100) + "%";

    if (usedPercent >= 100) {
        progress.style.background = "#dc2626";
    } else {
        progress.style.background = "#0f766e";
    }

    expenseList.innerHTML = "";

    if (monthlyExpenses.length === 0) {
        expenseList.innerHTML =
            '<p class="empty">No expenses added this month yet.</p>';
        return;
    }

    const sortedExpenses = [...monthlyExpenses].sort(function (a, b) {
        return b.date.localeCompare(a.date) || b.id - a.id;
    });

    sortedExpenses.forEach(function (expense) {
        const item = document.createElement("div");
        item.className = "expense-item";

        const details = document.createElement("div");

        const name = document.createElement("strong");
        name.textContent = expense.title;

        const info = document.createElement("p");
        info.textContent = expense.category + " • " + expense.date;

        details.append(name, info);

        const right = document.createElement("div");
        right.className = "expense-right";

        const amount = document.createElement("strong");
        amount.textContent = formatMoney(expense.amount);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";

        deleteBtn.addEventListener("click", function () {
            deleteExpense(expense.id);
        });

        right.append(amount, deleteBtn);
        item.append(details, right);
        expenseList.appendChild(item);
    });
}

updateDashboard();
