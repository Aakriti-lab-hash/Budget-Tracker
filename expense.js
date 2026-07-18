// Expense.js
import incomeObj from './Income.js';
import { auth, db } from './firebase-config.js';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";


class Expense {
  constructor() {
    this.auth = auth;
    this.db = db;
    this.userId = null;

    this.expenses = [];
    this.categoryTotals = {}; 
    this.category = incomeObj.budgetCategories;
    this.expenseForm = document.getElementById('expenseAddForm');
    this.expenseDropDown = document.getElementById('existingExpenseCategorySelect');
    this.expenseCategoryInput = document.getElementById('newExpenseCategoryInput');

   this.expenseAmountInput = document.getElementById('newExpenseInput'); 
   this.expenseStore=document.getElementById('catExpensesList')


    this.expenseTableBody = document.getElementById('allExpensesBody');
    this.expenceLatestbody=document.getElementById("catLatestExpensesList")

    this.expenseChartCanvas = document.getElementById('expenseChart');
    

    this.init();
  }

 async init() {
  this.auth.onAuthStateChanged(async (user) => {
    if (user) {
      this.userId = user.uid;

      // ✅ Load expenses
      await this.loadData();

      // ✅ Load income budget categories directly from Firebase
      const incomeRef = doc(this.db, "users", this.userId, "data", "income");
      const incomeSnap = await getDoc(incomeRef);
      if (incomeSnap.exists()) {
        this.category = incomeSnap.data().budgetCategories || {};
        console.log("Loaded Categories From Firebase:", this.category);
      } else {
        console.log("No income data found!");
        this.category = {};
      }

      this.renderUI();
      this.addEventListeners();
    }
  });
}


  async loadData() {
    try {
      const docRef = doc(this.db, "users", this.userId, "data", "expenses");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.expenses = docSnap.data().expenses || [];
      }
    } catch (error) {
      console.error("Error loading expenses:", error);
    }
  }

  async saveData() {
    if (!this.userId) return;
    try {
      const docRef = doc(this.db, "users", this.userId, "data", "expenses");
      await setDoc(docRef, { expenses: this.expenses });
    } catch (error) {
      console.error("Error saving expenses:", error);
    }
  }

  addEventListeners() {
    this.expenseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const category = this.expenseCategoryInput.value || this.expenseDropDown.value;
      const amount = parseFloat(this.expenseAmountInput.value);
      const dateInput = this.expenseForm.querySelector('input[type="date"]');
      const date = dateInput ? dateInput.value : '';

      if (!isNaN(amount) && category) {
        this.expenses.push({ category, amount,date });
        this.expenseCategoryInput.value = '';
        this.expenseAmountInput.value = '';
        if (dateInput) dateInput.value = '';
        this.saveData();
        this.renderUI();
      }
    });
  }

  renderUI() {
  // Clear previous options
this.expenseDropDown.innerHTML = '';

// Optional: Add placeholder
const placeholder = document.createElement('option');
placeholder.textContent = '-- Select Category --';
placeholder.value = '';
placeholder.disabled = true;
placeholder.selected = true;
this.expenseDropDown.appendChild(placeholder);

// Load from incomeObj.budgetCategories
for (const cat in this.category) {
  const option = document.createElement('option');
  option.value = cat;
  option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1); // Capitalize
  this.expenseDropDown.appendChild(option);
}


    // Update Latest Transactions Table
this.expenceLatestbody.innerHTML = '';  // Clear old entries

this.expenses.forEach((expense, index) => {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${index + 1}</td>
    <td>${expense.category}</td>
    <td>${expense.amount}</td>
    <td>${expense.date||""}</td>
  `;
  this.expenceLatestbody.appendChild(row);
});

   this.expenseStore.innerHTML = '';
this.categoryTotals = {}; // Reset

// Group expenses by category
this.expenses.forEach(exp => {
  if (!this.categoryTotals[exp.category]) this.categoryTotals[exp.category] = 0;
  this.categoryTotals[exp.category] += exp.amount;
});

// Get budget from Firebase
const budgetCategories = this.category || {};

// Render each category summary row
Object.entries(this.categoryTotals).forEach(([category, expenseTotal], index) => {
  const budget = budgetCategories[category] || 0;
  const percentUsed = budget > 0 ? Math.min((expenseTotal / budget) * 100, 100).toFixed(1) : 0;

  const row = document.createElement('tr');
  row.innerHTML = `
    <td style="font-weight: 500;">${category}</td>
    <td>
      <div style="position: relative; background: #eee; border-radius: 20px; height: 20px; width: 220px;">
        <div style="background:#3dc3d6; width: ${percentUsed}%; height: 100%; border-radius: 20px;"></div>
        <div style="position: absolute; top: 0; left: 0; right: 0; text-align: center; font-size: 12px; line-height: 20px; color: white;">
          ₹${budget} / ₹${expenseTotal}
        </div>
      </div>
    </td>
    <td><button class="delete-category-btn" data-category="${category}" style="background-color: #f44336; border: none; color: white; padding: 6px 12px; border-radius: 5px; cursor: pointer;">❌</button></td>
  `;
  this.expenseStore.appendChild(row);
});

// Add delete functionality by category
this.expenseStore.querySelectorAll('.delete-category-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const categoryToDelete = btn.getAttribute('data-category');
    this.expenses = this.expenses.filter(exp => exp.category !== categoryToDelete);
    await this.saveData();
    this.renderUI();
  });
});


    // Add delete logic
    this.expenseStore.querySelectorAll('.delete-expense-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = btn.getAttribute('data-index');
        this.expenses.splice(index, 1);
        this.saveData();
        this.renderUI();
      });
    });

    this.renderChart();
  }

  renderChart() {
    if (this.expenseChart) {
  this.expenseChart.destroy();  // ✅ properly destroy previous chart
}


    this.categoryTotals = {};  // <-- Reset before recalculate
    this.expenses.forEach(exp => {
    if (!this.categoryTotals[exp.category]) this.categoryTotals[exp.category] = 0;
    this.categoryTotals[exp.category] += exp.amount;
    });

    this.expenseChart = new Chart(this.expenseChartCanvas, {
      type: 'doughnut',
      data: {
        labels: Object.keys(this.categoryTotals),
        datasets: [{
          label: 'Expenses',
          data: Object.values(this.categoryTotals),
          backgroundColor: ['#fe5460', '#ffc107', '#3dc3d6', '#9c27b0', '#41dd66']
        }]
      }
    });
  }

  getTotalExpense() {
    return this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }

  getExpenses() {
    return this.expenses;
  }
  getCategoryExpenses() {
  return this.categoryTotals || {};
}


}

const expenseObj = new Expense();
export default expenseObj;