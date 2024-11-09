module.exports = {
    content: ["./html/*.{html,js}"],
  
    plugins: [require("daisyui")],
  
    // config docs: https://daisyui.com/docs/config/
    daisyui: {
      darkTheme: 'dark', // name of one of the included themes for dark mode
      themes: [
        {
          light: {
            primary: '#0e7490',
            secondary: '#0891b2',
            accent: '#008eff',
            neutral: '#101608',
            'base-100': '#fff7fc',
            info: '#00beff',
            success: '#00ab5a',
            warning: '#fb923c',
            error: '#e11d48',
            '--rounded-box': '2rem', // border radius rounded-box utility class, used in card and other large boxes
            '--rounded-btn': '2rem', // border radius rounded-btn utility class, used in buttons and similar element
            '--rounded-badge': '2rem', // border radius rounded-badge utility class, used in badges and similar
          },
        },
        {
          dark: {
            primary: '#06b6d4',//'#0e7490',
            secondary: '#164e63',
            accent: '#2563eb',
            neutral: '#181818',
            'base-100': '#262626',
            info: '#00beff',
            success: '#00ab5a',
            warning: '#fb923c',
            error: '#e11d48',
            '--rounded-box': '2rem', // border radius rounded-box utility class, used in card and other large boxes
            '--rounded-btn': '2rem', // border radius rounded-btn utility class, used in buttons and similar element
            '--rounded-badge': '2rem', // border radius rounded-badge utility class, used in badges and similar
          },
        },
      ],
    },
  }
  