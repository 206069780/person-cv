export type TerminalId = 'java' | 'aiot' | 'agent';
export type TerminalAccent = 'signal' | 'safety' | 'cyber';
export type TerminalLineTone = 'default' | 'signal' | 'safety' | 'muted';

export interface EngineeringConsoleLine {
  label: string;
  value: string;
  tone?: TerminalLineTone;
}

export interface EngineeringCommand {
  id: string;
  label: string;
  command: string;
  exhibitId: string;
  lines: readonly EngineeringConsoleLine[];
}

export interface EngineeringTerminal {
  id: TerminalId;
  index: string;
  title: string;
  shortTitle: string;
  accent: TerminalAccent;
  commands: readonly EngineeringCommand[];
}

export const engineeringTerminals: readonly EngineeringTerminal[] = [
  {
    id: 'java',
    index: '01',
    title: 'Java Service Core',
    shortTitle: 'JAVA',
    accent: 'signal',
    commands: [
      {
        id: 'java-litree-overview',
        label: 'Litree 总览',
        command: 'resume project litree --overview',
        exhibitId: 'litree-overview',
        lines: [
          { label: 'PROJECT', value: 'Litree 智慧水务云平台', tone: 'signal' },
          { label: 'ROLE', value: '立升净水科技 · 高级 Java 开发工程师 · 2023.10 至今' },
          { label: 'SCALE', value: '面向国内外 10w+ 水站（项目覆盖口径）', tone: 'safety' },
          { label: 'STACK', value: 'Java 21 · Spring Boot 3 · Spring Cloud · Nacos · OpenFeign' },
          { label: 'FLOW', value: 'OA 主数据 -> 项目空间与水站 -> 网关与设备 -> 物模型 -> 监控 / 告警 / 分析' },
          { label: 'BOUNDARY', value: '参与平台服务协作，个人负责模块与团队能力分开呈现', tone: 'muted' },
        ],
      },
      {
        id: 'java-oa-hr',
        label: 'OA / HR',
        command: 'resume module oa-hr --trace',
        exhibitId: 'litree-oa',
        lines: [
          { label: 'MODULE', value: 'OA / HR 与智慧水务数据同步', tone: 'signal' },
          { label: 'SCOPE', value: '参与后端模块建设，负责或优化人员、组织、站点同步及统一登录' },
          { label: 'FLOW', value: '人员组织 -> 入转调离 -> 考勤 -> 绩效 -> 站点与项目空间权限联动' },
          { label: 'SYNC', value: '分页拉取 -> 业务主键去重 -> 分批 upsert -> 幂等更新' },
          { label: 'WORK', value: '考勤日月汇总、绩效评价流程、站点与水站数据映射' },
          { label: 'BOUNDARY', value: '以参与、负责模块和优化链路表述，不归为个人独立完成', tone: 'muted' },
        ],
      },
      {
        id: 'java-welink',
        label: '华为 WeLink',
        command: 'resume project welink --pipeline',
        exhibitId: 'welink-search',
        lines: [
          { label: 'PROJECT', value: '华为 WeLink · 小薇搜索', tone: 'signal' },
          { label: 'SCOPE', value: '搜人、搜群组、搜聊天记录、用户画像与人员亲密度规则' },
          { label: 'REALTIME', value: 'Kafka / Flink 实时数据接入' },
          { label: 'OFFLINE', value: 'Hadoop / Hive / Spark 历史回灌与缺失补偿' },
          { label: 'INDEX', value: '统一口径同步至 Elasticsearch，支撑一体化搜索' },
          { label: 'DELIVERY', value: '方案文档、QC / Review / Committer、上线评审与生产交付' },
        ],
      },
    ],
  },
  {
    id: 'aiot',
    index: '02',
    title: 'AIoT Protocol Link',
    shortTitle: 'AIoT',
    accent: 'safety',
    commands: [
      {
        id: 'aiot-ownership',
        label: '职责边界',
        command: 'resume aiot inspect --ownership',
        exhibitId: 'litree-aiot',
        lines: [
          { label: 'CONTEXT', value: '多厂商通信方式、设备标识与数据结构需要统一建模' },
          { label: 'PERSONAL', value: '有人云接入组件：连接配置 / HTTP 调用 / 周期拉取 / 数据转换 / Redis 状态', tone: 'signal' },
          { label: 'MODEL', value: '产品元数据 -> 物模型属性与事件 -> 设备监控与告警' },
          { label: 'TEAM', value: 'MQTT · Modbus TCP/RTU · TCP/UDP 水表 · 繁易 · 迈拓 · 巨控 OPC/HTTP', tone: 'safety' },
          { label: 'BOUNDARY', value: 'TEAM 项为团队多协议平台实践，不归为个人独立交付', tone: 'muted' },
          { label: 'EDGE', value: '认证、路由、字段映射、重连重试、异常隔离、粘包拆包与寄存器映射' },
        ],
      },
      {
        id: 'aiot-pipeline',
        label: '接入链路',
        command: 'resume aiot trace --pipeline',
        exhibitId: 'litree-aiot',
        lines: [
          { label: 'FLOW', value: '厂商平台 / 现场协议 -> 接入组件 -> 统一设备标识 -> 产品物模型', tone: 'signal' },
          { label: 'CONFIG', value: 'Nacos 管理连接配置，按租户与产品组织接入参数' },
          { label: 'SYNC', value: 'Quartz 周期拉取与主动上报共同进入数据转换链路' },
          { label: 'STATE', value: 'Redis 维护接入状态与必要的同步上下文' },
          { label: 'PLATFORM', value: '统一接入设备管理、监控、告警与运行数据处理' },
          { label: 'RESULT', value: '有人云设备纳入 Litree IoT 数据链路，与团队协议组件协同' },
        ],
      },
    ],
  },
  {
    id: 'agent',
    index: '03',
    title: 'Agent Engineering Lab',
    shortTitle: 'AGENT',
    accent: 'cyber',
    commands: [
      {
        id: 'agent-runtime',
        label: 'Agent 运行时',
        command: 'resume agent trace --evidence',
        exhibitId: 'litree-agent',
        lines: [
          { label: 'PROJECT', value: 'Litree 水务数据智能体与 Agent 工程化', tone: 'signal' },
          { label: 'SCOPE', value: '推进 AgentScope Java 2.0 二次开发及 Litree 适配', tone: 'safety' },
          { label: 'RUNTIME', value: 'HarnessAgent / ReActAgent / Model / Toolkit / Memory / Session / Workspace' },
          { label: 'TOOLS', value: '水站、设备、物模型、告警、工单、GIS、统计查询 -> Tool / MCP' },
          { label: 'GRAPH', value: '意图识别 -> Schema 召回 -> NL2SQL -> Planner -> Python -> HITL -> 报告' },
          { label: 'SAFETY', value: '租户与会话隔离 · 允许 / 人工审批 / 拒绝 · 沙箱 · 审计', tone: 'muted' },
        ],
      },
      {
        id: 'agent-ai-coding',
        label: 'AI Coding',
        command: 'resume ai-coding inspect --workflow',
        exhibitId: 'litree-agent',
        lines: [
          { label: 'CODING', value: 'Codex / Claude Code / Cursor / Trae 覆盖需求、实现、测试、Review 与文档', tone: 'signal' },
          { label: 'RULES', value: 'AGENTS.md 固化项目边界，Skills 封装可复用研发流程' },
          { label: 'TASK', value: '00-工作台 -> .ai -> 02-AI产出，形成可追踪三态任务目录' },
          { label: 'AGENTS', value: 'Plan / Subagents / Review 将复杂任务拆解为可审查交付单元' },
          { label: 'DELIVERY', value: '结合 GitLab CI 与人工审查，保留验证证据和发布决策边界' },
          { label: 'BOUNDARY', value: '以真实水务 Agent 项目支撑实践，不表述为简单工具使用', tone: 'muted' },
        ],
      },
    ],
  },
];

export interface EngineeringConsoleState {
  focusedTerminal: TerminalId;
  inlineOpenTerminal: TerminalId | null;
  activeCommandByTerminal: Record<TerminalId, string>;
}

export type EngineeringConsoleAction =
  | { type: 'focus'; terminalId: TerminalId }
  | { type: 'run'; terminalId: TerminalId; commandId: string }
  | { type: 'toggle-inline'; terminalId: TerminalId };

export const initialEngineeringConsoleState: EngineeringConsoleState = {
  focusedTerminal: 'java',
  inlineOpenTerminal: 'java',
  activeCommandByTerminal: {
    java: 'java-litree-overview',
    aiot: 'aiot-ownership',
    agent: 'agent-runtime',
  },
};

export function engineeringConsoleReducer(
  state: EngineeringConsoleState,
  action: EngineeringConsoleAction,
): EngineeringConsoleState {
  if (action.type === 'focus') {
    return { ...state, focusedTerminal: action.terminalId };
  }

  if (action.type === 'toggle-inline') {
    const isOpen = state.inlineOpenTerminal === action.terminalId;
    return {
      ...state,
      focusedTerminal: action.terminalId,
      inlineOpenTerminal: isOpen ? null : action.terminalId,
    };
  }

  const terminal = engineeringTerminals.find((item) => item.id === action.terminalId);
  if (!terminal?.commands.some((command) => command.id === action.commandId)) return state;

  return {
    ...state,
    focusedTerminal: action.terminalId,
    activeCommandByTerminal: {
      ...state.activeCommandByTerminal,
      [action.terminalId]: action.commandId,
    },
  };
}
