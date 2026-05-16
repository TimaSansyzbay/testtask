import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

export const chatTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#4a7dff',
    colorBgBase: '#0a1222',
    colorBgContainer: '#111d33',
    colorBgElevated: '#162544',
    colorBorder: 'rgba(100, 140, 220, 0.2)',
    colorText: '#ffffff',
    colorTextSecondary: '#8fa3c4',
    colorTextPlaceholder: '#6b7f9e',
    borderRadius: 12,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Button: {
      primaryShadow: 'none',
    },
    Input: {
      colorBgContainer: 'transparent',
    },
  },
};
