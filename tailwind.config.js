// BeautyCat.kr Tailwind CSS Configuration v2.8.8.1.52
// 파스텔 라벤더 & 블러쉬 디자인 시스템

module.exports = {
  content: [
    "./*.html",
    "./js/**/*.js",
    "./css/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          lavender: '#E0D7E6',
          'lavender-dark': '#C8B8D6',
          'lavender-light': '#F0EBF4',
          blush: '#F3E6E6',
          'blush-dark': '#E8CFCF',
          'blush-light': '#FAF3F3',
        },
        
        // Secondary Colors
        secondary: {
          purple: '#D0C7E8',
          'purple-dark': '#B8A8D6',
          pink: '#F8D7DC',
          'pink-dark': '#F0BFC7',
        },
        
        // Background Colors
        bg: {
          primary: '#FFFFFF',
          secondary: '#F9F7FB',
          tertiary: '#F3F0F6',
          overlay: 'rgba(0, 0, 0, 0.05)',
        },
        
        // Text Colors
        text: {
          primary: '#2D2D2D',
          secondary: '#6B6B6B',
          muted: '#A0A0A0',
          link: '#8B7BB8',
          white: '#FFFFFF',
        },
        
        // Accent Colors
        accent: {
          success: '#B8E0B8',
          warning: '#FFE5B4',
          error: '#FFD4D4',
          info: '#D4E5FF',
        },
      },
      
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      
      fontSize: {
        'heading-1': ['28px', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '700' }],
        'heading-2': ['22px', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-3': ['18px', { lineHeight: '1.5', fontWeight: '600' }],
        'heading-4': ['16px', { lineHeight: '1.5', fontWeight: '500' }],
        'body-large': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-regular': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-small': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['11px', { lineHeight: '1.4', fontWeight: '400' }],
        'label': ['13px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
      
      borderRadius: {
        'small': '12px',
        'medium': '16px',
        'large': '20px',
        'xl': '24px',
        'full': '50%',
      },
      
      boxShadow: {
        'soft': '0 2px 12px rgba(0, 0, 0, 0.06)',
        'card': '0 8px 24px rgba(0, 0, 0, 0.1)',
        'button': '0 2px 8px rgba(224, 215, 230, 0.4)',
        'fab': '0 4px 16px rgba(224, 215, 230, 0.5)',
      },
      
      transitionDuration: {
        'fast': '200ms',
        'normal': '300ms',
        'slow': '500ms',
      },
      
      transitionTimingFunction: {
        'ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      backgroundImage: {
        'gradient-lavender-blush': 'linear-gradient(135deg, #E0D7E6 0%, #F3E6E6 100%)',
        'gradient-purple': 'linear-gradient(180deg, #D0C7E8 0%, #E8DCF5 100%)',
      },
      
      aspectRatio: {
        '16/9': '16 / 9',
        '1/1': '1 / 1',
      },
    },
  },
  plugins: [],
}
