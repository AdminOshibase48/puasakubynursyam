// State Management
const PuasakuData = {
  user: {
    username: '',
    isLoggedIn: false,
    firstTime: true
  },
  finance: {
    budget: 50000,
    dailyTotal: 0,
    expenses: []
  },
  ibadah: {
    shalat: {
      subuh: false,
      dzuhur: false,
      ashar: false,
      maghrib: false,
      isya: false,
      tarawih: false
    },
    tadarus: {
      juz: 0,
      ayat: 0
    },
    hutangPuasa: 0
  },
  settings: {
    theme: 'light',
    notifications: true
  }
};

// LocalStorage Operations
function saveData() {
  try {
    localStorage.setItem('puasakuData', JSON.stringify(PuasakuData));
    return true;
  } catch (e) {
    showAlert('Gagal menyimpan data', 'error');
    return false;
  }
}

function loadData() {
  try {
    const savedData = localStorage.getItem('puasakuData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      Object.assign(PuasakuData, parsedData);
    }
  } catch (e) {
    showAlert('Gagal memuat data', 'error');
  }
}

// Auth Functions
function login(username) {
  if (!username || username.trim() === '') {
    showAlert('Nama tidak boleh kosong!', 'error');
    return false;
  }
  
  PuasakuData.user.username = username.trim();
  PuasakuData.user.isLoggedIn = true;
  
  if (saveData()) {
    return true;
  }
  return false;
}

function logout() {
  PuasakuData.user.isLoggedIn = false;
  saveData();
  window.location.href = 'login.html';
}

function checkAuth() {
  loadData();
  if (!PuasakuData.user.isLoggedIn) {
    window.location.href = 'login.html';
  }
}

function isFirstTime() {
  return PuasakuData.user.firstTime;
}

function setFirstTimeDone() {
  PuasakuData.user.firstTime = false;
  saveData();
}

// UI Functions
function showAlert(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  
  const container = document.querySelector('.container');
  if (container) {
    container.insertBefore(alertDiv, container.firstChild);
    setTimeout(() => {
      alertDiv.remove();
    }, 3000);
  }
}

function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka);
}

// Finance Functions
function addExpense(name, price) {
  if (!name || name.trim() === '') {
    showAlert('Nama item tidak boleh kosong!', 'error');
    return false;
  }
  
  price = parseInt(price);
  if (isNaN(price) || price < 0) {
    showAlert('Harga tidak valid!', 'error');
    return false;
  }
  
  const expense = {
    id: Date.now(),
    name: name.trim(),
    price: price
  };
  
  PuasakuData.finance.expenses.push(expense);
  updateDailyTotal();
  
  if (saveData()) {
    renderFinance();
    showAlert('Pengeluaran berhasil ditambahkan');
    return true;
  }
  return false;
}

function deleteExpense(id) {
  PuasakuData.finance.expenses = PuasakuData.finance.expenses.filter(
    expense => expense.id !== id
  );
  updateDailyTotal();
  saveData();
  renderFinance();
  showAlert('Pengeluaran dihapus');
}

function updateDailyTotal() {
  PuasakuData.finance.dailyTotal = PuasakuData.finance.expenses.reduce(
    (total, expense) => total + expense.price, 0
  );
}

function getSisaBudget() {
  return PuasakuData.finance.budget - PuasakuData.finance.dailyTotal;
}

// Ibadah Functions
function toggleIbadah(shalatType) {
  if (PuasakuData.ibadah.shalat.hasOwnProperty(shalatType)) {
    PuasakuData.ibadah.shalat[shalatType] = !PuasakuData.ibadah.shalat[shalatType];
    saveData();
    renderIbadah();
    
    const status = PuasakuData.ibadah.shalat[shalatType] ? 'selesai' : 'belum';
    showAlert(`Shalat ${shalatType} ditandai ${status}`);
  }
}

function updateTadarus(juz, ayat) {
  juz = parseInt(juz);
  ayat = parseInt(ayat);
  
  if (isNaN(juz) || juz < 0 || juz > 30) {
    showAlert('Juz tidak valid (1-30)', 'error');
    return false;
  }
  
  if (isNaN(ayat) || ayat < 0) {
    showAlert('Ayat tidak valid', 'error');
    return false;
  }
  
  PuasakuData.ibadah.tadarus.juz = juz;
  PuasakuData.ibadah.tadarus.ayat = ayat;
  
  if (saveData()) {
    renderTadarus();
    showAlert('Progress tadarus diperbarui');
    return true;
  }
  return false;
}

function updateHutangPuasa(change) {
  const newValue = PuasakuData.ibadah.hutangPuasa + change;
  if (newValue >= 0) {
    PuasakuData.ibadah.hutangPuasa = newValue;
    saveData();
    renderHutangPuasa();
    showAlert(`Hutang puasa: ${newValue} hari`);
  }
}

// Menu Randomizer
const menuResep = [
  "Nasi Goreng Spesial",
  "Ayam Bakar Madu",
  "Sate Ayam",
  "Gulai Kambing",
  "Tempe Orek",
  "Sayur Asem",
  "Sop Buntut",
  "Rendang",
  "Mie Goreng",
  "Bubur Ayam",
  "Kolak Pisang",
  "Es Buah",
  "Puding Coklat",
  "Kurma Medjool",
  "Roti Maryam",
  "Martabak Telur",
  "Sop Ayam",
  "Gado-gado",
  "Ketoprak",
  "Bakso"
];

function randomizeMenu() {
  const randomIndex = Math.floor(Math.random() * menuResep.length);
  const menu = menuResep[randomIndex];
  const menuDisplay = document.getElementById('menuDisplay');
  if (menuDisplay) {
    menuDisplay.textContent = menu;
  }
  showAlert(`Menu pilihan: ${menu}`);
}

// Tour Functions
const tourSteps = [
  {
    icon: 'fa-mosque',
    title: 'Selamat Datang di Puasaku!',
    description: 'Aplikasi ini akan membantu Anda mencatat ibadah dan aktivitas selama Ramadan.'
  },
  {
    icon: 'fa-wallet',
    title: 'Finance Tracker',
    description: 'Catat pengeluaran harian Anda dengan budget Rp50.000 per hari.'
  },
  {
    icon: 'fa-pray',
    title: 'Ibadah Checklist',
    description: 'Tandai shalat 5 waktu dan tarawih yang sudah dikerjakan.'
  },
  {
    icon: 'fa-book',
    title: 'Tadarus Tracker',
    description: 'Catat progress bacaan Al-Quran Anda (Juz dan Ayat).'
  },
  {
    icon: 'fa-utensils',
    title: 'Menu Randomizer',
    description: 'Bingung mau buka apa? Klik tombol "Buka Apa Ya?" untuk ide menu.'
  }
];

let currentTourStep = 0;

function startTour() {
  currentTourStep = 0;
  showTourStep();
  document.getElementById('tourModal').classList.add('active');
}

function showTourStep() {
  const step = tourSteps[currentTourStep];
  document.getElementById('tourIcon').className = `fas ${step.icon} tour-icon`;
  document.getElementById('tourTitle').textContent = step.title;
  document.getElementById('tourDescription').textContent = step.description;
  
  // Update progress dots
  const progressContainer = document.getElementById('tourProgress');
  progressContainer.innerHTML = '';
  tourSteps.forEach((_, index) => {
    const dot = document.createElement('span');
    dot.className = `progress-dot ${index === currentTourStep ? 'active' : ''}`;
    progressContainer.appendChild(dot);
  });
  
  // Update buttons
  document.getElementById('prevTourBtn').style.display = currentTourStep === 0 ? 'none' : 'block';
  document.getElementById('nextTourBtn').textContent = currentTourStep === tourSteps.length - 1 ? 'Selesai' : 'Lanjut';
}

function nextTourStep() {
  if (currentTourStep < tourSteps.length - 1) {
    currentTourStep++;
    showTourStep();
  } else {
    closeTour();
  }
}

function prevTourStep() {
  if (currentTourStep > 0) {
    currentTourStep--;
    showTourStep();
  }
}

function closeTour() {
  document.getElementById('tourModal').classList.remove('active');
  setFirstTimeDone();
}

// Render Functions
function renderFinance() {
  const financeContainer = document.getElementById('financeContent');
  if (!financeContainer) return;
  
  const sisa = getSisaBudget();
  const sisaClass = sisa < 0 ? 'text-danger' : '';
  
  financeContainer.innerHTML = `
    <div class="finance-summary">
      <div class="summary-item">
        <h4>Budget Harian</h4>
        <div class="amount">${formatRupiah(PuasakuData.finance.budget)}</div>
      </div>
      <div class="summary-item">
        <h4>Total Pengeluaran</h4>
        <div class="amount">${formatRupiah(PuasakuData.finance.dailyTotal)}</div>
      </div>
      <div class="summary-item">
        <h4>Sisa Budget</h4>
        <div class="amount ${sisaClass}">${formatRupiah(sisa)}</div>
      </div>
    </div>
    
    <form id="expenseForm" onsubmit="event.preventDefault(); handleAddExpense()">
      <div class="form-group">
        <input type="text" id="expenseName" class="form-control" placeholder="Nama item" required>
      </div>
      <div class="form-group">
        <input type="number" id="expensePrice" class="form-control" placeholder="Harga" min="0" required>
      </div>
      <button type="submit" class="btn btn-primary btn-block">
        <i class="fas fa-plus-circle"></i> Tambah Pengeluaran
      </button>
    </form>
    
    <div class="expense-list" id="expenseList">
      ${PuasakuData.finance.expenses.map(expense => `
        <div class="expense-item">
          <span>${expense.name}</span>
          <div>
            <span>${formatRupiah(expense.price)}</span>
            <i class="fas fa-trash delete-expense" onclick="deleteExpense(${expense.id})"></i>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderIbadah() {
  const ibadahContainer = document.getElementById('ibadahContent');
  if (!ibadahContainer) return;
  
  const shalatList = [
    { id: 'subuh', label: 'Shalat Subuh' },
    { id: 'dzuhur', label: 'Shalat Dzuhur' },
    { id: 'ashar', label: 'Shalat Ashar' },
    { id: 'maghrib', label: 'Shalat Maghrib' },
    { id: 'isya', label: 'Shalat Isya' },
    { id: 'tarawih', label: 'Shalat Tarawih' }
  ];
  
  ibadahContainer.innerHTML = `
    <div class="ibadah-list">
      ${shalatList.map(shalat => `
        <div class="ibadah-item">
          <input type="checkbox" 
                 id="shalat_${shalat.id}" 
                 ${PuasakuData.ibadah.shalat[shalat.id] ? 'checked' : ''}
                 onchange="toggleIbadah('${shalat.id}')">
          <label for="shalat_${shalat.id}">${shalat.label}</label>
          ${PuasakuData.ibadah.shalat[shalat.id] ? 
            '<span class="ibadah-checked"><i class="fas fa-check-circle"></i></span>' : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function renderTadarus() {
  const tadarusContainer = document.getElementById('tadarusContent');
  if (!tadarusContainer) return;
  
  tadarusContainer.innerHTML = `
    <div class="tadarus-input">
      <input type="number" id="tadarusJuz" class="form-control" placeholder="Juz (1-30)" 
             min="0" max="30" value="${PuasakuData.ibadah.tadarus.juz}">
      <input type="number" id="tadarusAyat" class="form-control" placeholder="Ayat" 
             min="0" value="${PuasakuData.ibadah.tadarus.ayat}">
      <button class="btn btn-primary" onclick="handleUpdateTadarus()">
        <i class="fas fa-save"></i>
      </button>
    </div>
    <div class="tadarus-stats">
      <h3>Juz ${PuasakuData.ibadah.tadarus.juz}</h3>
      <p>Ayat ${PuasakuData.ibadah.tadarus.ayat}</p>
    </div>
  `;
}

function renderHutangPuasa() {
  const hutangContainer = document.getElementById('hutangContent');
  if (!hutangContainer) return;
  
  hutangContainer.innerHTML = `
    <div class="hutang-counter">
      <button class="counter-btn" onclick="updateHutangPuasa(-1)">
        <i class="fas fa-minus"></i>
      </button>
      <span class="counter-value">${PuasakuData.ibadah.hutangPuasa}</span>
      <button class="counter-btn" onclick="updateHutangPuasa(1)">
        <i class="fas fa-plus"></i>
      </button>
    </div>
    <div class="hutang-note">
      <i class="fas fa-info-circle"></i>
      Jumlah hari tidak puasa
    </div>
  `;
}

function renderMenu() {
  const menuContainer = document.getElementById('menuContent');
  if (!menuContainer) return;
  
  menuContainer.innerHTML = `
    <div class="menu-card">
      <div class="menu-display" id="menuDisplay">
        <i class="fas fa-utensils"></i> Klik tombol untuk memilih menu
      </div>
      <button class="btn btn-primary btn-block" onclick="randomizeMenu()">
        <i class="fas fa-random"></i> Buka Apa Ya?
      </button>
    </div>
  `;
}

// Event Handlers
function handleAddExpense() {
  const name = document.getElementById('expenseName').value;
  const price = document.getElementById('expensePrice').value;
  
  if (addExpense(name, price)) {
    document.getElementById('expenseName').value = '';
    document.getElementById('expensePrice').value = '';
  }
}

function handleUpdateTadarus() {
  const juz = document.getElementById('tadarusJuz').value;
  const ayat = document.getElementById('tadarusAyat').value;
  updateTadarus(juz, ayat);
}

// Initialize Dashboard
function initDashboard() {
  renderFinance();
  renderIbadah();
  renderTadarus();
  renderHutangPuasa();
  renderMenu();
  
  // Set username in navbar
  const usernameElement = document.getElementById('username');
  if (usernameElement) {
    usernameElement.textContent = PuasakuData.user.username;
  }
  
  // Show tour for first time users
  if (isFirstTime()) {
    setTimeout(() => {
      startTour();
    }, 500);
  }
}

// Check localStorage availability
function checkLocalStorage() {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    alert('Browser Anda tidak mendukung localStorage. Data tidak akan tersimpan.');
    return false;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  checkLocalStorage();
  
  // Handle different pages
  const path = window.location.pathname.split('/').pop() || 'index.html';
  
  if (path === 'login.html') {
    // Check if already logged in
    loadData();
    if (PuasakuData.user.isLoggedIn) {
      window.location.href = 'dashboard.html';
    }
    
    // Handle login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        if (login(username)) {
          window.location.href = 'dashboard.html';
        }
      });
    }
  } 
  else if (path === 'index.html' || path === '') {
    // Loader page
    setTimeout(() => {
      loadData();
      if (PuasakuData.user.isLoggedIn) {
        window.location.href = 'dashboard.html';
      } else {
        window.location.href = 'login.html';
      }
    }, 1500);
  } 
  else if (path === 'dashboard.html') {
    // Check authentication
    checkAuth();
    initDashboard();
  }
});
