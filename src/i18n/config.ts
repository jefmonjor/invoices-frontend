import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import commonEs from '@/locales/es/common.json';
import commonEn from '@/locales/en/common.json';
import invoicesEs from '@/locales/es/invoices.json';
import invoicesEn from '@/locales/en/invoices.json';
import authEs from '@/locales/es/auth.json';
import authEn from '@/locales/en/auth.json';
import clientsEs from '@/locales/es/clients.json';

/**
 * i18next Configuration
 *
 * Configuración de internacionalización para la aplicación
 * Soporta español (es) e inglés (en)
 *
 * Namespaces:
 * - common: Textos comunes (navegación, acciones, validaciones)
 * - invoices: Todo relacionado con facturas
 * - auth: Login, registro, perfil
 */

// Language detection from localStorage or browser
const getInitialLanguage = (): string => {
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    return savedLanguage;
  }

  // Detect browser language
  const browserLang = navigator.language.split('-')[0];
  return ['es', 'en'].includes(browserLang) ? browserLang : 'es';
};

i18n
  .use(initReactI18next)
  .init({
    // Recursos de traducción
    resources: {
      es: {
        common: commonEs,
        invoices: invoicesEs,
        auth: authEs,
        clients: clientsEs,
      },
      en: {
        common: commonEn,
        invoices: invoicesEn,
        auth: authEn,
      },
    },

    // Idioma inicial
    lng: getInitialLanguage(),

    // Idioma de respaldo
    fallbackLng: 'es',

    // Namespace por defecto
    defaultNS: 'common',

    // Namespaces disponibles
    ns: ['common', 'invoices', 'auth'],

    // Interpolación
    interpolation: {
      escapeValue: false, // React ya escapa por defecto
    },

    // Debug en desarrollo
    debug: import.meta.env.DEV,

    // React config
    react: {
      useSuspense: false,
    },
  });

// Guardar idioma cuando cambie
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
  document.documentElement.lang = lng;
});

export default i18n;
