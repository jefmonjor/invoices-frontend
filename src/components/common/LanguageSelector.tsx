import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { Language as LanguageIcon, Check as CheckIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

/**
 * Language Selector Component
 *
 * Dropdown para cambiar el idioma de la aplicación
 * Se muestra en el Navbar/Header
 *
 * Features:
 * - Cambio instantáneo sin reload
 * - Persistencia en localStorage
 * - Iconos de banderas (ES/EN)
 * - Indicador visual del idioma actual
 */

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectLanguage = async (languageCode: string) => {
    await i18n.changeLanguage(languageCode);
    handleClose();
  };

  return (
    <Box>
      {/* Botón para abrir el dropdown */}
      <Tooltip title="Change Language / Cambiar Idioma">
        <IconButton
          onClick={handleClick}
          color="inherit"
          sx={{
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: 200,
            mt: 1,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {languages.map((language) => {
          const isActive = language.code === i18n.language;

          return (
            <MenuItem
              key={language.code}
              onClick={() => handleSelectLanguage(language.code)}
              selected={isActive}
              sx={{
                py: 1.5,
                ...(isActive && {
                  bgcolor: 'action.selected',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                }),
              }}
            >
              {/* Icono de check si es el idioma actual */}
              <ListItemIcon>
                {isActive ? (
                  <CheckIcon color="primary" fontSize="small" />
                ) : (
                  <Box sx={{ width: 20 }} /> // Espaciador
                )}
              </ListItemIcon>

              {/* Bandera y nombre del idioma */}
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{ fontSize: '1.5rem' }}>
                      {language.flag}
                    </Box>
                    <Box component="span" sx={{ fontWeight: isActive ? 'bold' : 'normal' }}>
                      {language.name}
                    </Box>
                  </Box>
                }
              />
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
};

export default LanguageSelector;
