// LifeSync - Finance Manager
// Handles financial functionality

export class FinanceManager {
    constructor(storage) {
        this.storage = storage;
        this.transactions = this.storage.getData('transactions') || [];
        this.finance = this.storage.getData('finance') || {};
        this.chart = null;
    }
    
    // Add new transaction
    addTransaction() {
        const type = document.getElementById('transaction-type').value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const category = document.getElementById('transaction-category').value;
        const date = document.getElementById('transaction-date').value;
        const description = document.getElementById('transaction-description').value;
        
        const transaction = {
            type,
            amount,
            category,
            date,
            description,
            createdAt: new Date().toISOString()
        };
        
        const savedTransaction = this.storage.addItem('transactions', transaction);
        
        if (savedTransaction) {
            this.transactions = this.storage.getData('transactions');
            this.renderTransactions();
            this.renderCharts();
            window.app.showToast('success', 'Success', 'Transaction added successfully');
            return true;
        } else {
            window.app.showToast('error', 'Error', 'Failed to add transaction');
            return false;
        }
    }
    
    // Delete transaction
    deleteTransaction(id) {
        const success = this.storage.removeItem('transactions', id);
        
        if (success) {
            this.transactions = this.storage.getData('transactions');
            this.renderTransactions();
            this.renderCharts();
            window.app.showToast('success', 'Success', 'Transaction deleted successfully');
            return true;
        } else {
            window.app.showToast('error', 'Error', 'Failed to delete transaction');
            return false;
        }
    }
    
    // Calculate totals
    calculateTotals() {
        const totals = {
            income: 0,
            expenses: 0,
            balance: 0
        };
        
        this.transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                totals.income += transaction.amount;
            } else {
                totals.expenses += transaction.amount;
            }
        });
        
        totals.balance = totals.income - totals.expenses;
        return totals;
    }
    
    // Get budget remaining
    getBudgetRemaining() {
        const totals = this.calculateTotals();
        const budget = this.finance.budget || 0;
        return Math.max(0, budget - totals.expenses).toFixed(2);
    }
    
    // Populate categories dropdown based on transaction type
    populateCategories(type) {
        const categorySelect = document.getElementById('transaction-category');
        const categories = type === 'income' ? 
            this.finance.incomeCategories : 
            this.finance.expenseCategories;
        
        categorySelect.innerHTML = categories.map(category => 
            `<option value="${category}">${category}</option>`
        ).join('');
    }
    
    // Get monthly totals for charts
    getMonthlyTotals(months = 6) {
        const today = new Date();
        const data = {
            labels: [],
            income: [],
            expenses: []
        };
        
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const month = date.toLocaleString('default', { month: 'short' });
            const year = date.getFullYear();
            const label = `${month} ${year}`;
            
            const monthlyTransactions = this.transactions.filter(transaction => {
                const transDate = new Date(transaction.date);
                return transDate.getMonth() === date.getMonth() && 
                       transDate.getFullYear() === date.getFullYear();
            });
            
            const monthlyTotals = {
                income: 0,
                expenses: 0
            };
            
            monthlyTransactions.forEach(transaction => {
                if (transaction.type === 'income') {
                    monthlyTotals.income += transaction.amount;
                } else {
                    monthlyTotals.expenses += transaction.amount;
                }
            });
            
            data.labels.push(label);
            data.income.push(monthlyTotals.income);
            data.expenses.push(monthlyTotals.expenses);
        }
        
        return data;
    }
    
    // Get category totals for pie chart
    getCategoryTotals(type) {
        const categories = type === 'income' ? 
            this.finance.incomeCategories : 
            this.finance.expenseCategories;
        
        const totals = {};
        categories.forEach(category => totals[category] = 0);
        
        this.transactions
            .filter(t => t.type === type)
            .forEach(transaction => {
                totals[transaction.category] += transaction.amount;
            });
        
        return {
            labels: Object.keys(totals),
            data: Object.values(totals)
        };
    }
    
    // Render finance charts
    renderCharts() {
        const ctx = document.getElementById('finance-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Get monthly data
        const monthlyData = this.getMonthlyTotals();
        
        // Create new chart
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyData.labels,
                datasets: [
                    {
                        label: 'Income',
                        data: monthlyData.income,
                        backgroundColor: 'rgba(46, 196, 182, 0.5)',
                        borderColor: 'rgb(46, 196, 182)',
                        borderWidth: 1
                    },
                    {
                        label: 'Expenses',
                        data: monthlyData.expenses,
                        backgroundColor: 'rgba(230, 57, 70, 0.5)',
                        borderColor: 'rgb(230, 57, 70)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => '$' + value.toFixed(2)
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: context => {
                                const label = context.dataset.label;
                                const value = context.parsed.y;
                                return `${label}: $${value.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
        
        // Update summary numbers
        const totals = this.calculateTotals();
        document.getElementById('total-income').textContent = totals.income.toFixed(2);
        document.getElementById('total-expenses').textContent = totals.expenses.toFixed(2);
        document.getElementById('total-balance').textContent = totals.balance.toFixed(2);
    }
    
    // Render recent transactions
    renderTransactions() {
        const transactionsList = document.getElementById('transactions-list');
        
        // Sort transactions by date (newest first)
        const sortedTransactions = [...this.transactions].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        // Show only last 10 transactions
        const recentTransactions = sortedTransactions.slice(0, 10);
        
        if (recentTransactions.length === 0) {
            transactionsList.innerHTML = '<li class="placeholder-text">No transactions yet</li>';
            return;
        }
        
        transactionsList.innerHTML = recentTransactions.map(transaction => {
            const date = new Date(transaction.date).toLocaleDateString();
            
            return `
                <li class="${transaction.type}">
                    <div class="transaction-icon">
                        <i class="fas fa-${transaction.type === 'income' ? 'arrow-down' : 'arrow-up'}"></i>
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-title">${transaction.description || transaction.category}</div>
                        <div class="transaction-category">${transaction.category}</div>
                    </div>
                    <div class="transaction-amount">
                        ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                    </div>
                    <div class="transaction-date">${date}</div>
                    <button class="delete-transaction btn-icon" data-id="${transaction.id}" title="Delete transaction">
                        <i class="fas fa-trash"></i>
                    </button>
                </li>
            `;
        }).join('');
        
        // Add event listeners for delete buttons
        transactionsList.querySelectorAll('.delete-transaction').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this transaction?')) {
                    this.deleteTransaction(btn.dataset.id);
                }
            });
        });
    }
    
    // Update budget
    updateBudget(amount) {
        this.finance.budget = parseFloat(amount);
        const success = this.storage.updateData('finance', { budget: this.finance.budget });
        
        if (success) {
            window.app.updateDashboard();
            window.app.showToast('success', 'Success', 'Budget updated successfully');
            return true;
        } else {
            window.app.showToast('error', 'Error', 'Failed to update budget');
            return false;
        }
    }
    
    // Update categories
    updateCategories(type, categories) {
        const key = type === 'income' ? 'incomeCategories' : 'expenseCategories';
        this.finance[key] = categories;
        
        const success = this.storage.updateData('finance', { [key]: categories });
        
        if (success) {
            window.app.showToast('success', 'Success', 'Categories updated successfully');
            return true;
        } else {
            window.app.showToast('error', 'Error', 'Failed to update categories');
            return false;
        }
    }
}
