/* =========================================================
   NEXUS SCHOOL - Main Application
   ========================================================= */
const APP = {
  user: null,
  profile: null,
  studentRecord: null,
  page: 'dashboard',
  theme: localStorage.getItem('nexus_theme') || 'dark',
  particlesOn: localStorage.getItem('nexus_particles') !== 'off',
  editing: null,
  chatChannel: null,
};

// Initialize application
async function initApp() {
  initParticles();
  applyTheme();
  await checkSession();
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
