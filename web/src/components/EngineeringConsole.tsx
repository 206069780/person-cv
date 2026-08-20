import { ArrowUpRight, ChevronDown, ChevronRight, Terminal } from 'lucide-react';
import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';

import {
  engineeringConsoleReducer,
  getEngineeringTerminals,
  initialEngineeringConsoleState,
} from '../data/engineering-console';
import { useLocale } from '../i18n';

interface EngineeringConsoleProps {
  variant: 'overlay' | 'inline';
  motionEnabled: boolean;
  onSelectExhibit?: (exhibitId: string) => void;
}

export function EngineeringConsole({ variant, motionEnabled, onSelectExhibit }: EngineeringConsoleProps) {
  const [state, dispatch] = useReducer(engineeringConsoleReducer, initialEngineeringConsoleState);
  const { t } = useTranslation();
  const terminals = getEngineeringTerminals(useLocale());

  return (
    <section
      className={`engineering-console engineering-console--${variant}`}
      data-motion={motionEnabled ? 'full' : 'reduced'}
      aria-labelledby={`engineering-console-${variant}`}
    >
      <header className="engineering-console__header">
        <div>
          <p className="eyebrow">CAREER EVIDENCE · STATIC DEMO</p>
          <h2 id={`engineering-console-${variant}`}><Terminal size={18} /> {t('console.title')}</h2>
        </div>
        <span className="engineering-console__stamp">{t('console.stamp')}</span>
      </header>

      <div className="engineering-console__modes" role="group" aria-label={t('console.channelsAria')}>
        {terminals.map((terminal) => {
          const isFocused = state.focusedTerminal === terminal.id;
          const isExpanded = state.inlineOpenTerminal === terminal.id;

          return (
            <button
              type="button"
              key={terminal.id}
              className={isFocused ? 'is-active' : ''}
              data-accent={terminal.accent}
              aria-pressed={isFocused}
              aria-expanded={variant === 'inline' ? isExpanded : undefined}
              aria-controls={`engineering-terminal-${variant}-${terminal.id}`}
              onClick={() => dispatch({
                type: variant === 'inline' ? 'toggle-inline' : 'focus',
                terminalId: terminal.id,
              })}
            >
              <span>{terminal.index}</span>
              <strong>{terminal.shortTitle}</strong>
              {variant === 'inline' && <ChevronDown size={15} aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <div className="engineering-console__deck">
        {terminals.map((terminal) => {
          const isFocused = state.focusedTerminal === terminal.id;
          const isInlineOpen = state.inlineOpenTerminal === terminal.id;
          const activeCommand = terminal.commands.find(
            (command) => command.id === state.activeCommandByTerminal[terminal.id],
          ) ?? terminal.commands[0];

          return (
            <article
              id={`engineering-terminal-${variant}-${terminal.id}`}
              className="terminal-window"
              key={terminal.id}
              data-terminal={terminal.id}
              data-accent={terminal.accent}
              data-focused={isFocused ? 'true' : 'false'}
              hidden={variant === 'inline' && !isInlineOpen}
              aria-hidden={variant === 'overlay' && !isFocused ? 'true' : undefined}
            >
              <button
                type="button"
                className="terminal-window__titlebar"
                tabIndex={isFocused ? 0 : -1}
                onClick={() => dispatch({ type: 'focus', terminalId: terminal.id })}
                aria-label={t('console.focusAria', { title: terminal.title })}
              >
                <span className="terminal-window__controls" aria-hidden="true"><i /><i /><i /></span>
                <strong><Terminal size={14} /> {terminal.title}</strong>
                <span>evidence/{terminal.id}</span>
              </button>

              <div className="terminal-window__body">
                <div className="terminal-window__commands" role="group" aria-label={t('console.commandsAria', { shortTitle: terminal.shortTitle })}>
                  {terminal.commands.map((command) => {
                    const isActive = command.id === activeCommand.id;
                    return (
                      <button
                        type="button"
                        key={command.id}
                        className={isActive ? 'is-active' : ''}
                        aria-pressed={isActive}
                        tabIndex={isFocused ? 0 : -1}
                        onClick={() => dispatch({ type: 'run', terminalId: terminal.id, commandId: command.id })}
                      >
                        {command.label}
                      </button>
                    );
                  })}
                </div>

                <div className="terminal-window__transcript" key={activeCommand.id}>
                  <div className="terminal-window__command">
                    <ChevronRight size={14} aria-hidden="true" />
                    <code>{activeCommand.command}</code>
                    <span className="terminal-window__caret" aria-hidden="true" />
                  </div>
                  <div className="terminal-window__output" aria-live={isFocused ? 'polite' : 'off'}>
                    {activeCommand.lines.map((line) => (
                      <p key={`${activeCommand.id}-${line.label}`} data-tone={line.tone ?? 'default'}>
                        <span>[{line.label}]</span>
                        <b>{line.value}</b>
                      </p>
                    ))}
                  </div>
                </div>

                <footer className="terminal-window__footer">
                  <span>STATIC CAREER DATA · NOT LIVE TELEMETRY</span>
                  {onSelectExhibit && (
                    <button
                      type="button"
                      tabIndex={isFocused ? 0 : -1}
                      onClick={() => onSelectExhibit(activeCommand.exhibitId)}
                    >
                      {t('console.viewExhibit')} <ArrowUpRight size={14} />
                    </button>
                  )}
                </footer>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
