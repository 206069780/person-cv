import { MonitorUp, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MobileNoticeProps {
  onContinue: () => void;
}

export function MobileNotice({ onContinue }: MobileNoticeProps) {
  const { t } = useTranslation();

  return (
    <div className="mobile-notice" role="dialog" aria-modal="true" aria-labelledby="mobile-notice-title">
      <div className="mobile-notice__icon" aria-hidden="true">
        <MonitorUp size={30} strokeWidth={1.6} />
      </div>
      <p className="eyebrow">DESKTOP EXPERIENCE</p>
      <h1 id="mobile-notice-title">{t('mobileNotice.title')}</h1>
      <p>{t('mobileNotice.body')}</p>
      <button className="primary-command" type="button" onClick={onContinue}>
        {t('mobileNotice.continue')}
      </button>
      <button className="icon-command mobile-notice__close" type="button" onClick={onContinue} aria-label={t('mobileNotice.close')}>
        <X size={20} />
      </button>
    </div>
  );
}
