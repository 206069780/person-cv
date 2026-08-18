import { MonitorUp, X } from 'lucide-react';

interface MobileNoticeProps {
  onContinue: () => void;
}

export function MobileNotice({ onContinue }: MobileNoticeProps) {
  return (
    <div className="mobile-notice" role="dialog" aria-modal="true" aria-labelledby="mobile-notice-title">
      <div className="mobile-notice__icon" aria-hidden="true">
        <MonitorUp size={30} strokeWidth={1.6} />
      </div>
      <p className="eyebrow">DESKTOP EXPERIENCE</p>
      <h1 id="mobile-notice-title">建议使用电脑端浏览</h1>
      <p>完整版本包含电影式入场、实时 3D 数字展馆与自由探索。手机端将呈现内容完整的轻量纵向简历。</p>
      <button className="primary-command" type="button" onClick={onContinue}>
        继续查看简历
      </button>
      <button className="icon-command mobile-notice__close" type="button" onClick={onContinue} aria-label="关闭提示">
        <X size={20} />
      </button>
    </div>
  );
}
