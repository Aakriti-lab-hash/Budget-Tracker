// Tracker.js
import incomeObj from './Income.js';
import expenseObj from './expense.js';

class Tracker {
  constructor() {
    this.showTotalDropdown = document.getElementById('showTotal');
    this.carryOverDropdown = document.getElementById('carryOver');
    this.incomeBtn = document.getElementById('incomeBtn');
    this.expenseBtn = document.getElementById('expenseBtn');
    this.summaryBtn = document.getElementById('summaryBtn');

    this.incomeDiv = document.getElementById('incomeContainer');
    this.expenseDiv = document.getElementById('expenseContainer');
    this.summaryDiv = document.getElementById('summaryContainer');

    this.totalSummaryText = document.getElementById('totalSummaryText');
    this.carryOverText = document.getElementById('carryOverText');
    

    this.attachEventListeners();
    this.showSection('income');

    // Wait until Firebase user is loaded
    setTimeout(() => {
      this.updateSummary();
    }, 3000);

    // Also update summary whenever user toggles checkboxes
    this.showTotalDropdown.addEventListener('change', () => this.updateSummary());
this.carryOverDropdown.addEventListener('change', () => this.updateSummary());
  }

  attachEventListeners() {
    this.incomeBtn.addEventListener('click', () => this.showSection('income'));
    this.expenseBtn.addEventListener('click', () => this.showSection('expense'));
    this.summaryBtn.addEventListener('click', () => this.showSection('summary'));
  }

  showSection(section) {
    this.incomeDiv.style.display = section === 'income' ? 'block' : 'none';
    this.expenseDiv.style.display = section === 'expense' ? 'block' : 'none';
    this.summaryDiv.style.display = section === 'summary' ? 'block' : 'none';

    if (section === 'summary') {
      this.updateSummary();
    }
  }

updateSummary() {
  // Income summary (Budget Plan)
const incomeBudget = incomeObj.getBudgetCategories ? incomeObj.getBudgetCategories() : {};
const incomeTableBody = document.getElementById('summaryIncomeBudgetTableBody');
const incomeChartCanvas = document.getElementById('SummaryIncomeChart');


// Fill Budget Plan Table
incomeTableBody.innerHTML = '';
for (const [category, amount] of Object.entries(incomeBudget)) {
  const row = document.createElement('tr');
  row.innerHTML = `<td>${category}</td><td>₹${amount}</td>`;
  incomeTableBody.appendChild(row);
}

// Render Income Doughnut Chart (same as Income.js)
// ✅ NEW CODE: Render Income Source Doughnut Chart (same as Income.js)
if (this.incomeChart) this.incomeChart.destroy?.();
if (incomeChartCanvas) {
  const ctx = incomeChartCanvas.getContext('2d');
  const sourceData = incomeObj.incomeSources || {};

  this.incomeChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(sourceData),
      datasets: [{
        label: 'Income Sources',
        data: Object.values(sourceData),
        backgroundColor: ['#41dd66', '#3dc3d6', '#fe5460', '#ffc107', '#9c27b0']
      }]
    }
    

  });
}


  // --- Expense Summary ---
  const expenseCategories = expenseObj.getCategoryExpenses ? expenseObj.getCategoryExpenses() : {};
  const expenseTableBody = document.getElementById('summaryCatExpensesList');
  const expenseChartCanvas = document.getElementById('SummaryExpenseChart');

  

expenseTableBody.innerHTML = '';

for (const category in expenseCategories) {
  const spentAmount = expenseCategories[category];
  const budgetAmount = incomeBudget[category] || 0;
  const percent = budgetAmount > 0 ? Math.min((spentAmount / budgetAmount) * 100, 100) : 0;

  const row = document.createElement('tr');
  row.innerHTML = `
    <td style="vertical-align: middle;">${category}</td>
    <td style="width: 100%;">
      <div style="background-color: #e0e0e0; border-radius: 20px; overflow: hidden; position: relative; height: 25px;">
        <div style="
          width: ${percent}%;
          background-color: #3dc3d6;
          height: 100%;
          border-radius: 20px;
          text-align: center;
          color: white;
          font-size: 14px;
          line-height: 25px;
        ">
          ₹${spentAmount} / ₹${budgetAmount}
        </div>
      </div>
    </td>
  `;
  expenseTableBody.appendChild(row);
}



  // Render Expense Doughnut Chart
  if (this.expenseChart) this.expenseChart.destroy?.();
  if (expenseChartCanvas) {
    const ctx = expenseChartCanvas.getContext('2d');
    this.expenseChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(expenseCategories),
        datasets: [{
          data: Object.values(expenseCategories),
          backgroundColor: ['#ff5722', '#03a9f4', '#8bc34a', '#ffc107', '#e91e63']
        }]
      }
    });
  }

  // --- Total Summary & Carry Over ---
  const totalIncome = incomeObj.getTotalIncome ? incomeObj.getTotalIncome() : 0;
  const totalExpenses = expenseObj.getTotalExpense ? expenseObj.getTotalExpense() : 0;
  const carryOver = totalIncome - totalExpenses;

  if (this.showTotalDropdown.value === 'yes') {
    this.totalSummaryText.innerText = `Total Income: ₹${totalIncome.toFixed(2)}\nTotal Expenses: ₹${totalExpenses.toFixed(2)}`;
  } else {
    this.totalSummaryText.innerText = '';
  }

  if (this.carryOverDropdown.value === 'on') {
    this.carryOverText.innerText = `Carry Over: ₹${carryOver.toFixed(2)}`;
  } else {
    this.carryOverText.innerText = '';
  }

  // --- Savings Display ---
  const summarySpan = document.getElementById('summarySpan');
  if (summarySpan) {
    summarySpan.innerText = `₹${(totalIncome - totalExpenses).toFixed(2)}`;
  }
}

}

  const buttons = document.querySelectorAll(".add-btn");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(btn => btn.classList.remove("active-tab"));
      button.classList.add("active-tab");
    });
  });

  const summaryHeader = document.getElementById("summaryHeader");

  // Detect all tab buttons (change this selector as per your buttons)
  const addButtons = document.querySelectorAll(".add-btn");

 addButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Remove active class from all
      addButtons.forEach(b => b.classList.remove("active-tab"));
      btn.classList.add("active-tab");

      // ✅ Show Home + Filter only if "Summary" is clicked
      if (btn.textContent.trim().toLowerCase() === "summary") {
        summaryHeader.style.display = "flex";  // or "block" if using block style
      } else {
        summaryHeader.style.display = "none";
      }
    });
  });

  // ✅ Optional: show Home+Filter if Summary is active by default
  window.addEventListener("DOMContentLoaded", () => {
    const active = document.querySelector(".add-btn.active-tab");
    if (active && active.textContent.trim().toLowerCase() === "summary") {
      summaryHeader.style.display = "flex";
    }
  });





const trackerObj = new Tracker();
export default trackerObj;