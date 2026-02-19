// Dashboard Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const userProfile = JSON.parse(localStorage.getItem('puasaku_user'));
    if (!userProfile || !userProfile.name) {
        window.location.href = 'login.html';
        return;
    }

    // Display user info
    document.getElementById('userName').textContent = userProfile.name;
    document.getElementById('userTarget').textContent = `Target: ${userProfile.target}`;

    // Initialize all features
    initializeNavigation();
    initializeFinance();
    initializeIbadah();
    initializeTadarus();
    initializeHutang();
    initializeRandomizer();
    initializeLogout();
});

// Navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            // Show corresponding section
            const sectionId = this.dataset.section;
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === sectionId) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// Finance Feature
function initializeFinance() {
    const expenseForm = document.getElementById('expenseForm');
    const expenseList = document.getElementById('expenseList');
    const remainingBudget = document.getElementById('remainingBudget');

    // Load expenses
    loadExpenses();

    // Set daily budget (example: Rp 100,000 per day)
    const DAILY_BUDGET = 100000;

    function loadExpenses() {
        const expenses = JSON.parse(localStorage.getItem('puasaku_expenses')) || [];
        displayExpenses(expenses);
        updateRemainingBudget(expenses);
    }

    function displayExpenses(expenses) {
        expenseList.innerHTML = '';
        
        if (expenses.length === 0) {
            expenseList.innerHTML = '<li class="expense-item">Belum ada pengeluaran</li>';
            return;
        }

        expenses.forEach((expense, index) => {
            const li = document.createElement('li');
            li.className = 'expense-item';
            li.innerHTML = `
                <span>${expense.name}</span>
                <span>Rp ${formatNumber(expense.amount)}</span>
                <button class="delete-expense" data-index="${index}">×</button>
            `;
            expenseList.appendChild(li);
        });

        // Add delete functionality
        document.querySelectorAll('.delete-expense').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.dataset.index;
                deleteExpense(index);
            });
        });
    }

    function deleteExpense(index) {
        const expenses = JSON.parse(localStorage.getItem('puasaku_expenses')) || [];
        expenses.splice(index, 1);
        localStorage.setItem('puasaku_expenses', JSON.stringify(expenses));
        loadExpenses();
    }

    function updateRemainingBudget(expenses) {
        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const remaining = DAILY_BUDGET - total;
        remainingBudget.textContent = `Rp ${formatNumber(remaining)}`;
        
        if (remaining < 0) {
            remainingBudget.style.color = '#ff6b6b';
        } else {
            remainingBudget.style.color = 'var(--gold-light)';
        }
    }

    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('expenseName').value.trim();
        const amount = parseInt(document.getElementById('expenseAmount').value);

        if (name && amount > 0) {
            const expenses = JSON.parse(localStorage.getItem('puasaku_expenses')) || [];
            expenses.push({ name, amount, date: new Date().toISOString() });
            localStorage.setItem('puasaku_expenses', JSON.stringify(expenses));
            
            expenseForm.reset();
            loadExpenses();
        }
    });
}

// Ibadah Feature
function initializeIbadah() {
    const today = new Date().toDateString();
    const checkboxes = document.querySelectorAll('.prayer-checklist input[type="checkbox"]');
    const progressSpan = document.getElementById('prayerProgress');
    const progressBar = document.getElementById('prayerProgressBar');

    // Display current date
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Load saved state for today
    const savedState = JSON.parse(localStorage.getItem(`puasaku_prayer_${today}`)) || {};

    checkboxes.forEach(checkbox => {
        const id = checkbox.id;
        if (savedState[id]) {
            checkbox.checked = savedState[id];
        }

        checkbox.addEventListener('change', function() {
            savedState[this.id] = this.checked;
            localStorage.setItem(`puasaku_prayer_${today}`, JSON.stringify(savedState));
            updatePrayerProgress();
        });
    });

    function updatePrayerProgress() {
        const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
        progressSpan.textContent = `${checked}/6`;
        const percentage = (checked / 6) * 100;
        progressBar.style.width = `${percentage}%`;
    }

    updatePrayerProgress();
}

// Tadarus Feature
function initializeTadarus() {
    const lastPageInput = document.getElementById('lastPage');
    const updateBtn = document.getElementById('updatePageBtn');
    const pageProgress = document.getElementById('pageProgress');
    const quranProgressBar = document.getElementById('quranProgressBar');
    const motivationMessage = document.getElementById('motivationMessage');

    const TOTAL_PAGES = 604;

    // Load saved page
    const lastPage = JSON.parse(localStorage.getItem('puasaku_last_page')) || 0;
    lastPageInput.value = lastPage;
    updateProgress(lastPage);

    updateBtn.addEventListener('click', function() {
        let page = parseInt(lastPageInput.value);
        
        if (isNaN(page) || page < 0) page = 0;
        if (page > TOTAL_PAGES) page = TOTAL_PAGES;

        localStorage.setItem('puasaku_last_page', JSON.stringify(page));
        updateProgress(page);
    });

    function updateProgress(page) {
        pageProgress.textContent = `${page}/${TOTAL_PAGES}`;
        const percentage = (page / TOTAL_PAGES) * 100;
        quranProgressBar.style.width = `${percentage}%`;

        // Update motivation message
        if (page === 0) {
            motivationMessage.textContent = '✨ Mulai tadarus hari ini!';
        } else if (page >= TOTAL_PAGES) {
            motivationMessage.textContent = '🎉 Alhamdulillah! Khatam Al-Qur\'an!';
        } else {
            const remaining = TOTAL_PAGES - page;
            motivationMessage.textContent = `📖 Sisa ${remaining} halaman lagi. Semangat!`;
        }
    }
}

// Hutang Puasa Feature
function initializeHutang() {
    const hutangCount = document.getElementById('hutangCount');
    const incrementBtn = document.getElementById('incrementHutang');
    const decrementBtn = document.getElementById('decrementHutang');
    const resetBtn = document.getElementById('resetHutang');

    let count = JSON.parse(localStorage.getItem('puasaku_hutang')) || 0;
    updateDisplay();

    incrementBtn.addEventListener('click', function() {
        count++;
        updateStorage();
    });

    decrementBtn.addEventListener('click', function() {
        if (count > 0) {
            count--;
            updateStorage();
        }
    });

    resetBtn.addEventListener('click', function() {
        count = 0;
        updateStorage();
    });

    function updateStorage() {
        localStorage.setItem('puasaku_hutang', JSON.stringify(count));
        updateDisplay();
    }

    function updateDisplay() {
        hutangCount.textContent = count;
    }
}

// Randomizer Feature
function initializeRandomizer() {
    const randomizeBtn = document.getElementById('randomizeBtn');
    const randomResult = document.getElementById('randomResult');
    const randomIdea = document.getElementById('randomIdea');
    const modal = document.getElementById('randomModal');
    const modalIdea = document.getElementById('modalIdea');
    const closeModal = document.querySelector('.close-modal');

    const menuIdeas = [
        "Takjil: Kolak Pisang 🍌",
        "Takjil: Es Buah 🍉",
        "Takjil: Kurma & Susu 🥛",
        "Takjil: Bubur Sumsum 🥣",
        "Takjil: Cendol Dawet 🍧",
        "Sahur: Nasi Goreng 🍳",
        "Sahur: Omelette & Roti 🍞",
        "Sahur: Bubur Ayam 🍲",
        "Sahur: Mie Goreng Telur 🍜",
        "Sahur: Lontong Sayur 🥘",
        "Takjil: Gorengan & Teh Manis ☕",
        "Sahur: Salad Buah 🥗",
        "Takjil: Es Pisang Ijo 🍌",
        "Sahur: Nasi Uduk 🍚",
        "Takjil: Puding Buah 🍮"
    ];

    randomizeBtn.addEventListener('click', function() {
        const randomIndex = Math.floor(Math.random() * menuIdeas.length);
        const idea = menuIdeas[randomIndex];
        
        // Show in card
        randomIdea.textContent = idea;
        randomResult.classList.remove('hidden');
        
        // Show in modal
        modalIdea.textContent = idea;
        modal.classList.add('show');
        
        // Auto hide modal after 3 seconds
        setTimeout(() => {
            modal.classList.remove('show');
        }, 3000);
    });

    closeModal.addEventListener('click', function() {
        modal.classList.remove('show');
    });

    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
}

// Logout Function
function initializeLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    logoutBtn.addEventListener('click', function() {
        if (confirm('Apakah Anda yakin ingin keluar?')) {
            localStorage.removeItem('puasaku_user');
            window.location.href = 'login.html';
        }
    });
}

// Utility function to format numbers
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
