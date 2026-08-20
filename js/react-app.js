(function () {
  const { createElement, useEffect, useState } = React;
  const { createRoot } = ReactDOM;

  function ThemeToggle() {
    const [theme, setTheme] = useState(
      localStorage.getItem('yatrii_theme') || document.documentElement.getAttribute('data-theme') || 'light'
    );

    useEffect(() => {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('yatrii_theme', theme);
    }, [theme]);

    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const icon = theme === 'dark' ? 'ri-moon-fill' : 'ri-sun-fill';

    return createElement(
      'button',
      {
        className: 'theme-toggle-btn',
        id: 'react-theme-toggle-btn',
        title: `Switch to ${nextTheme} mode`,
        'aria-label': `Switch to ${nextTheme} mode`,
        onClick: () => setTheme(nextTheme)
      },
      createElement('i', { className: icon })
    );
  }

  const rootElement = document.getElementById('react-theme-root');
  if (rootElement && window.React && window.ReactDOM) {
    createRoot(rootElement).render(createElement(ThemeToggle));
  }
})();
