import { createTheme, alpha } from '@mui/material';

// Fintech Professional Palette
// Slate & Blue based for trust and clarity

export const getTheme = (mode: 'light' | 'dark') => {
    return createTheme({
        palette: {
            mode,
            primary: {
                main: '#2563eb', // Blue 600
                light: '#60a5fa', // Blue 400
                dark: '#1e40af', // Blue 800
                contrastText: '#ffffff',
            },
            secondary: {
                main: '#0f172a', // Slate 900
                light: '#334155', // Slate 700
                dark: '#020617', // Slate 950
                contrastText: '#ffffff',
            },
            background: {
                default: mode === 'light' ? '#f8fafc' : '#0b1120', // Slate 50 / Slate 950
                paper: mode === 'light' ? '#ffffff' : '#1e293b', // White / Slate 800
            },
            text: {
                primary: mode === 'light' ? '#0f172a' : '#f8fafc', // Slate 900 / Slate 50
                secondary: mode === 'light' ? '#64748b' : '#94a3b8', // Slate 500 / Slate 400
            },
            success: {
                main: '#10b981', // Emerald 500
                light: '#34d399',
                dark: '#059669',
            },
            warning: {
                main: '#f59e0b', // Amber 500
                light: '#fbbf24',
                dark: '#d97706',
            },
            error: {
                main: '#ef4444', // Red 500
                light: '#f87171',
                dark: '#b91c1c',
            },
            info: {
                main: '#3b82f6', // Blue 500
                light: '#60a5fa',
                dark: '#1d4ed8',
            },
        },
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h1: { fontWeight: 700 },
            h2: { fontWeight: 700 },
            h3: { fontWeight: 600 },
            h4: { fontWeight: 600 },
            h5: { fontWeight: 600 },
            h6: { fontWeight: 600 },
            button: { fontWeight: 600, textTransform: 'none' },
        },
        shape: {
            borderRadius: 12, // Modern rounded corners
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        scrollbarColor: mode === 'dark' ? '#334155 #0b1120' : '#cbd5e1 #f8fafc',
                        '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                            backgroundColor: 'transparent',
                            width: '8px',
                            height: '8px',
                        },
                        '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                            borderRadius: 8,
                            backgroundColor: mode === 'dark' ? '#334155' : '#cbd5e1',
                            minHeight: 24,
                        },
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        boxShadow: mode === 'light'
                            ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                            : '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)',
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: mode === 'light'
                                ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                                : '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)',
                        },
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        padding: '8px 16px',
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: 'none',
                        },
                    },
                    containedPrimary: {
                        '&:hover': {
                            backgroundColor: '#1d4ed8', // Blue 700
                        },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        borderBottom: `1px solid ${mode === 'light' ? '#e2e8f0' : '#334155'}`, // Slate 200 / Slate 700
                    },
                    head: {
                        fontWeight: 600,
                        backgroundColor: mode === 'light' ? '#f1f5f9' : '#1e293b', // Slate 100 / Slate 800
                        color: mode === 'light' ? '#475569' : '#cbd5e1', // Slate 600 / Slate 300
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'light' ? '#ffffff' : '#0f172a', // White / Slate 900
                        color: mode === 'light' ? '#0f172a' : '#f8fafc',
                        boxShadow: mode === 'light'
                            ? '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                            : '0 1px 3px 0 rgb(0 0 0 / 0.5)',
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundColor: mode === 'light' ? '#ffffff' : '#0f172a',
                        borderRight: `1px solid ${mode === 'light' ? '#e2e8f0' : '#1e293b'}`,
                    },
                },
            },
        },
    });
};
