import { describe, expect, it } from 'vitest';

import { EXHIBITS } from '../scene/scene-layout';
import {
  engineeringConsoleReducer,
  engineeringTerminals,
  initialEngineeringConsoleState,
} from './engineering-console';

describe('engineering console', () => {
  it('exposes three evidence terminals with valid exhibit targets', () => {
    expect(engineeringTerminals.map((item) => item.id)).toEqual(['java', 'aiot', 'agent']);

    const exhibitIds = new Set(EXHIBITS.map((item) => item.id));
    const commands = engineeringTerminals.flatMap((item) => item.commands);

    expect(new Set(commands.map((item) => item.id)).size).toBe(commands.length);
    expect(commands.every((item) => exhibitIds.has(item.exhibitId))).toBe(true);
  });

  it('keeps confirmed facts and explicit ownership boundaries', () => {
    const text = JSON.stringify(engineeringTerminals);

    expect(text).toContain('10w+');
    expect(text).toContain('项目覆盖口径');
    expect(text).toContain('有人云');
    expect(text).toContain('团队');
    expect(text).toContain('AgentScope Java 2.0');
    expect(text).not.toMatch(/QPS|并发量|项目金额|团队人数|性能提升\s*\d+%|SYSTEM ONLINE/);
  });

  it('switches focus, command and inline expansion predictably', () => {
    const focused = engineeringConsoleReducer(initialEngineeringConsoleState, {
      type: 'focus',
      terminalId: 'agent',
    });
    expect(focused.focusedTerminal).toBe('agent');

    const command = engineeringConsoleReducer(focused, {
      type: 'run',
      terminalId: 'agent',
      commandId: 'agent-ai-coding',
    });
    expect(command.activeCommandByTerminal.agent).toBe('agent-ai-coding');

    const collapsed = engineeringConsoleReducer(command, {
      type: 'toggle-inline',
      terminalId: 'java',
    });
    expect(collapsed.inlineOpenTerminal).toBeNull();
  });
});
