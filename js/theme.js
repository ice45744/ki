// Dark Mode System
function initDarkMode() {
    const body = document.body;
    const isDark = localStorage.getItem('dark-mode') === 'enabled';
    
    if (isDark) {
        body.classList.add('dark-mode');
    }

    const toggles = document.querySelectorAll('#darkModeToggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            body.classList.toggle('dark-mode');
            const enabled = body.classList.contains('dark-mode');
            localStorage.setItem('dark-mode', enabled ? 'enabled' : 'disabled');
            
            // Update icon if it exists in the toggle
            const icon = toggle.querySelector('i');
            if (icon) {
                icon.className = enabled ? 'fas fa-sun text-yellow-500' : 'fas fa-moon text-blue-500';
            }
        });
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    
    // Global Profile Dropdown Logic
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            profileDropdown.classList.remove('show');
        });
    }
});
