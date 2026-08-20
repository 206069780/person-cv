import { useTranslation } from 'react-i18next';

import { changeAppLanguage, useLocale } from './index';

export function LanguageSwitcher() {
  const locale = useLocale();
  const { t } = useTranslation();

  return (
    <div className="language-switcher" role="group" aria-label={t('language.switchToEn')}>
      <button
        type="button"
        className={locale === 'zh' ? 'text-command text-command--cyan' : 'text-command'}
        aria-pressed={locale === 'zh'}
        aria-label={t('language.switchToZh')}
        onClick={() => void changeAppLanguage('zh')}
      >
        {t('language.zh')}
      </button>
      <button
        type="button"
        className={locale === 'en' ? 'text-command text-command--cyan' : 'text-command'}
        aria-pressed={locale === 'en'}
        aria-label={t('language.switchToEn')}
        onClick={() => void changeAppLanguage('en')}
      >
        {t('language.en')}
      </button>
    </div>
  );
}
