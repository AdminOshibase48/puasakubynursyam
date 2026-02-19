// Authentication Logic
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        // Check if already logged in
        const userProfile = JSON.parse(localStorage.getItem('puasaku_user'));
        if (userProfile && userProfile.name) {
            window.location.href = 'index.html';
        }
        
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const target = document.getElementById('target').value.trim();
            
            if (name && target) {
                // Save user profile
                const userProfile = {
                    name: name,
                    target: target,
                    loginDate: new Date().toISOString()
                };
                
                localStorage.setItem('puasaku_user', JSON.stringify(userProfile));
                
                // Initialize default data if not exists
                initializeUserData();
                
                // Redirect to transition page
                window.location.href = 'index.html';
            }
        });
    }
});

function initializeUserData() {
    // Initialize finance data
    if (!localStorage.getItem('puasaku_expenses')) {
        localStorage.setItem('puasaku_expenses', JSON.stringify([]));
    }
    
    // Initialize hutang data
    if (!localStorage.getItem('puasaku_hutang')) {
        localStorage.setItem('puasaku_hutang', JSON.stringify(0));
    }
    
    // Initialize tadarus data
    if (!localStorage.getItem('puasaku_last_page')) {
        localStorage.setItem('puasaku_last_page', JSON.stringify(0));
    }
}
