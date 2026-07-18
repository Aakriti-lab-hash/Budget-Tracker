import { auth, db } from './firebase-config.js';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

class Income {
  constructor() {
    this.auth = auth;
    this.db = db;
    this.userId = null;
    this.income = 0;
    
  
    this.incomeSources = {};  // ✅ Added
    this.budget = 0;
    this.budgetCategories = {};

    this.incomeInput = document.getElementById('newIncomeInput');
    this.sourceInput = document.getElementById('existingIncomeSourceInput');
    this.customSourceInput = document.getElementById('newIncomeSourceInput');
    this.budgetInput = document.getElementById('budgetInput');
    this.budgetCategoryInput = document.getElementById('budgetCategoryInput');
    this.budgetAddBtn = document.getElementById('budgetAddBtn');
    this.incomeForm = document.getElementById('incomeAddForm');
    this.budgetTableBody = document.getElementById('incomeBudgetTableBody');
    this.totalIncomeDisplay = document.getElementById('incomeValue');
    this.totalBudgetDisplay = document.getElementById('incomeBudgetValue');
    this.savingsDisplay = document.getElementById('estimatedSavingsValue');

    this.incomeChartCanvas = document.getElementById('incomeChart');
    this.compareChartCanvas = document.getElementById('incBudCompareChart');

    this.init();
  }

 async init() {
  this.auth.onAuthStateChanged(async (user) => {
    if (user) {
      this.userId = user.uid;
      await this.loadData();         // Wait until data is fetched
      this.renderUI();               // ✅ Only render UI after data is ready
      this.addEventListeners();
    }
  });
}


  async loadData() {
    try {
      const docRef = doc(this.db, "users", this.userId, "data", "income");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.income = data.income || 0;
        
        this.incomeSources = data.incomeSources || {};  // ✅
        this.budgetCategories = data.budgetCategories || {};
        console.log("Loaded sources from Firestore:", this.incomeSources);  
      }
    } catch (err) {
      console.error("Error loading income data:", err);
    }
  }

  async saveData() {
    if (!this.userId) return;
    try {
      const docRef = doc(this.db, "users", this.userId, "data", "income");
      await setDoc(docRef, {
        income: this.income,
       // ✅ optional
        incomeSources: this.incomeSources,  // ✅
        budgetCategories: this.budgetCategories
      });
    } catch (err) {
      console.error("Error saving income data:", err);
    }
  }

  addEventListeners() {
    this.incomeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = parseFloat(this.incomeInput.value);
     let source = this.customSourceInput.value.trim();
if (!source) {
  source = this.sourceInput.value.trim();
}


      if (!isNaN(amount) && source) {
        this.income += amount;

        if (!this.incomeSources[source]) {
          this.incomeSources[source] = 0;
        }
        this.incomeSources[source] += amount;

        this.incomeInput.value = '';
        this.customSourceInput.value = '';
        this.sourceInput.value = '';

        this.saveData();
        this.renderUI();
      }
    });

    this.budgetAddBtn.addEventListener('click', () => {
      const category = this.budgetCategoryInput.value;
      const amount = parseFloat(this.budgetInput.value);
      if (!isNaN(amount)) {
        if (!this.budgetCategories[category]) {
          this.budgetCategories[category] = 0;
        }
        this.budgetCategories[category] += amount;
        this.budgetInput.value = '';
        this.saveData();
        this.renderUI();
      }
    });
  }

  renderUI() {
    this.totalIncomeDisplay.textContent = this.income;
    this.budget = 0;
    this.budgetTableBody.innerHTML = '';

    for (const [category, amount] of Object.entries(this.budgetCategories)) {
      this.budget += amount;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${category}</td>
        <td>${amount}</td>
        <td>
          <button data-category="${category}" class="delete-btn budget-action-btn">Delete</button>
          <button data-category="${category}" class="edit-btn budget-action-btn">Edit</button>
        </td>
      `;
      this.budgetTableBody.appendChild(row);

      row.querySelector('.delete-btn').addEventListener('click', () => {
        delete this.budgetCategories[category];
        this.saveData();
        this.renderUI();
      });

      row.querySelector('.edit-btn').addEventListener('click', () => {
        const newAmount = prompt(`Enter new amount for ${category}:`, amount);
        if (newAmount !== null && !isNaN(newAmount) && newAmount.trim() !== '') {
          this.budgetCategories[category] = Number(newAmount);
          this.saveData();
          this.renderUI();
        }
      });
    }

    this.totalBudgetDisplay.textContent = this.budget;
    this.savingsDisplay.textContent = this.income - this.budget;

    this.renderCharts();
  }

  renderCharts() {
    if (this.incomeChart) this.incomeChart.destroy();
    if (this.compareChart) this.compareChart.destroy();

    // ✅ Chart for Income Sources
    this.incomeChart = new Chart(this.incomeChartCanvas, {
      type: 'doughnut',
      data: {
        labels: Object.keys(this.incomeSources),
        datasets: [{
          label: 'Income Sources',
          data: Object.values(this.incomeSources),
          backgroundColor: ['#41dd66', '#3dc3d6', '#fe5460', '#ffc107', '#9c27b0']
        }]
      }
    });

    // ✅ Comparison Chart
    this.compareChart = new Chart(this.compareChartCanvas, {
      type: 'bar',
      data: {
        labels: ['Income', 'Budget', 'Savings'],
        datasets: [{
          label: 'Comparison',
          data: [this.income, this.budget, this.income - this.budget],
          backgroundColor: ['#41dd66', '#fe5460', '#3dc3d6']
        }]
      }
    });
  }
getTotalIncome() {
  let total = 0;
  for (const key in this.incomeSources) {
    total += this.incomeSources[key];
  }
  return total;
}

 

  getBudgetCategories() {
    return this.budgetCategories || {};
  }
  
}
const incomeObj = new Income();
export default incomeObj;


