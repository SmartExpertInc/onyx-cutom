# Internationalization (i18n) Implementation

## Overview

This implementation adds comprehensive internationalization support to the application, allowing users to switch between English, Ukrainian, Spanish, and Russian languages. The system is designed to be scalable and easily extensible for additional languages.

## Features

### ✅ Language Selection
- **Language Dropdown**: Located in the top-right corner of the header
- **4 Supported Languages**: English (en), Ukrainian (uk), Spanish (es), Russian (ru)
- **Persistent Selection**: Language preference is saved in localStorage
- **Visual Indicators**: Flag icons and native language names
- **Accessibility**: Proper ARIA labels and keyboard navigation

### ✅ Comprehensive Translation Coverage
- **Interface Elements**: All UI text, buttons, labels, and messages
- **Projects Page**: Complete translation of the main products interface
- **Modals**: Folder creation, settings, and other modal dialogs
- **Navigation**: Sidebar, header, and navigation elements
- **Status Messages**: Loading states, error messages, and confirmations

### ✅ Scalable Architecture
- **Context-Based**: React Context for global language state management
- **Nested Translation Keys**: Support for complex nested object structures
- **Fallback System**: Graceful fallback to English if translation missing
- **Type Safety**: TypeScript support for language types and translations

## Implementation Details

### 1. Language Context Provider

**File**: `custom_extensions/frontend/src/contexts/LanguageContext.tsx`

The core of the i18n system that provides:
- Global language state management
- Translation function (`t`) for accessing localized strings
- Persistent language preference storage
- Document language attribute updates for accessibility

```typescript
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  locale: any;
}
```

### 2. Language Dropdown Component

**File**: `custom_extensions/frontend/src/components/LanguageDropdown.tsx`

A beautiful, accessible dropdown component that:
- Shows current language with flag and native name
- Provides smooth animations and hover effects
- Handles click-outside to close
- Supports keyboard navigation
- Responsive design (shows flag on small screens, full name on larger screens)

### 3. Translation Files

**Files**: 
- `custom_extensions/frontend/src/locales/en.ts`
- `custom_extensions/frontend/src/locales/ru.ts`
- `custom_extensions/frontend/src/locales/uk.ts`
- `custom_extensions/frontend/src/locales/es.ts`

Each locale file contains:
- **Common Elements**: Reusable translations for buttons, labels, etc.
- **Training Plan**: Course and lesson related translations
- **Quality Tiers**: Basic, Interactive, Advanced, Immersive
- **Video Lessons**: Video-specific interface elements
- **Quiz Elements**: Quiz and assessment related text
- **Modals**: Dialog and modal window content
- **Projects**: Project management interface
- **Interface**: Main application interface elements

### 4. Integration Points

#### Root Layout
**File**: `custom_extensions/frontend/src/app/layout.tsx`

The LanguageProvider wraps the entire application to make language context available everywhere.

#### Projects Page
**File**: `custom_extensions/frontend/src/app/projects/page.tsx`

Updated to:
- Include the LanguageDropdown in the header
- Use translation function for all text elements
- Support dynamic language switching

#### Folder Modal
**File**: `custom_extensions/frontend/src/app/projects/FolderModal.tsx`

Fully translated modal for folder management operations.

## Usage Examples

### Basic Translation
```typescript
import { useLanguage } from '../contexts/LanguageContext';

const MyComponent = () => {
  const { t } = useLanguage();
  
  return (
    <button>{t('interface.save', 'Save')}</button>
  );
};
```

### Nested Translation Keys
```typescript
// Access nested translations
const message = t('interface.modals.createFolder.title', 'Create Folder');
```

### With Fallback
```typescript
// Provide fallback text if translation is missing
const text = t('interface.someKey', 'Default English Text');
```

### Language Switching
```typescript
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <button onClick={() => setLanguage('es')}>
      Switch to Spanish
    </button>
  );
};
```

## Adding New Languages

### 1. Create Locale File
Create a new file `custom_extensions/frontend/src/locales/[lang].ts`:

```typescript
export const [lang] = {
  common: {
    // Common translations
  },
  interface: {
    // Interface translations
  },
  // ... other sections
};
```

### 2. Update Language Types
Add the new language code to the Language type in `LanguageContext.tsx`:

```typescript
export type Language = 'en' | 'ru' | 'uk' | 'es' | 'fr'; // Add new language
```

### 3. Update Locales Index
Add the new locale to `custom_extensions/frontend/src/locales/index.ts`:

```typescript
import { fr } from './fr';

export const locales = {
  en,
  ru,
  uk,
  es,
  fr // Add new locale
};
```

### 4. Add to Language Dropdown
Update the `languageOptions` array in `LanguageDropdown.tsx`:

```typescript
const languageOptions: LanguageOption[] = [
  // ... existing options
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷'
  }
];
```

## Best Practices

### 1. Translation Key Naming
- Use descriptive, hierarchical keys: `interface.modals.createFolder.title`
- Group related translations: `interface.`, `common.`, `projects.`
- Use consistent naming conventions across all locale files

### 2. Fallback Strategy
- Always provide fallback text in English
- Use the fallback parameter: `t('key', 'Fallback text')`
- Test with missing translations to ensure graceful degradation

### 3. Context-Aware Translations
- Consider cultural differences in date formats, number formats
- Use appropriate pluralization rules for each language
- Consider text length differences (some languages are longer/shorter)

### 4. Performance Considerations
- Translation files are loaded once and cached
- Context updates trigger re-renders only for components using translations
- Consider code-splitting for large translation files if needed

## Testing

### Manual Testing
1. **Language Switching**: Test switching between all languages
2. **Persistence**: Verify language preference is saved and restored
3. **Fallbacks**: Test with missing translation keys
4. **Accessibility**: Test keyboard navigation and screen readers

### Automated Testing
```typescript
// Example test for language switching
test('should switch language and update translations', () => {
  const { getByText } = render(<MyComponent />);
  
  // Initially in English
  expect(getByText('Save')).toBeInTheDocument();
  
  // Switch to Spanish
  fireEvent.click(getByText('Español'));
  expect(getByText('Guardar')).toBeInTheDocument();
});
```

## Future Enhancements

### 1. Dynamic Language Loading
- Load translation files on-demand for better performance
- Support for language packs and lazy loading

### 2. Pluralization Support
- Add proper pluralization rules for each language
- Support for complex plural forms (like Russian)

### 3. Date and Number Formatting
- Locale-specific date and time formatting
- Currency and number formatting based on language

### 4. RTL Support
- Right-to-left language support (Arabic, Hebrew)
- Layout adjustments for RTL languages

### 5. Translation Management
- Integration with translation management systems
- Support for translation workflows and collaboration

## Troubleshooting

### Common Issues

1. **Translation Not Showing**
   - Check if the key exists in all locale files
   - Verify the key path is correct (case-sensitive)
   - Ensure the component is wrapped in LanguageProvider

2. **Language Not Persisting**
   - Check localStorage permissions
   - Verify the language code is valid
   - Check browser console for errors

3. **Performance Issues**
   - Ensure translation files are not too large
   - Consider code-splitting for large applications
   - Monitor re-render frequency

### Debug Mode
Enable debug logging by adding to the translation function:

```typescript
const t = (key: string, fallback?: string): string => {
  // Add debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`Translation key: ${key}, Language: ${language}`);
  }
  // ... rest of function
};
```

## Conclusion

This internationalization implementation provides a robust, scalable foundation for multi-language support. The system is designed to be maintainable, performant, and user-friendly while following React and TypeScript best practices.

The modular architecture makes it easy to add new languages and extend functionality as the application grows. The comprehensive translation coverage ensures a consistent user experience across all supported languages. 