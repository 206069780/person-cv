import type { Locale } from '../i18n/locale';

export interface ModelComponentMetaphor {
  name: string;
  metaphor: string;
}

export interface ModelRepresentation {
  id: string;
  order: string;
  shortLabel: string;
  title: string;
  subTitle: string;
  entityName: string;
  entityDescription: string;
  visualMetaphorSummary: string;
  components: readonly ModelComponentMetaphor[];
  keyMetrics: readonly string[];
  accentColor: string;
}

const sharedMeta = {
  'litree-overview': {
    id: 'litree-overview',
    order: '01',
    shortLabel: 'ARCH',
    subTitle: 'Microservice & Multi-Tenant Sharding',
    accentColor: '#28d7e5',
  },
  'litree-aiot': {
    id: 'litree-aiot',
    order: '02',
    shortLabel: 'AIoT',
    subTitle: 'Industrial IoT & Spatial GIS Engine',
    accentColor: '#00a89d',
  },
  'litree-agent': {
    id: 'litree-agent',
    order: '03',
    shortLabel: 'AGENT',
    subTitle: 'Water Data Agent & AI Coding Runtime',
    accentColor: '#c084fc',
  },
  'oa-hr': {
    id: 'oa-hr',
    order: '04',
    shortLabel: 'OA',
    subTitle: 'Independent OA/HR Business Platform',
    accentColor: '#00a89d',
  },
  'welink-search': {
    id: 'welink-search',
    order: '05',
    shortLabel: 'SEARCH',
    subTitle: 'Enterprise Unified Search & Scoring Engine',
    accentColor: '#ff6b3d',
  },
  'welink-data': {
    id: 'welink-data',
    order: '06',
    shortLabel: 'LAKE',
    subTitle: 'Dual-Engine Real-Time & Offline Data Lake',
    accentColor: '#28d7e5',
  },
  'senge-gateway': {
    id: 'senge-gateway',
    order: '07',
    shortLabel: 'GATEWAY',
    subTitle: 'Netty Gateway & Alarm Storm Engine',
    accentColor: '#ff6b3d',
  },
  'senge-platform': {
    id: 'senge-platform',
    order: '08',
    shortLabel: 'SENGE',
    subTitle: 'Water Platform 0-1 Architecture & Cloud Delivery',
    accentColor: '#00a89d',
  },
} as const;

type ModelCatalog = Record<string, ModelRepresentation>;

const zhCatalog: ModelCatalog = {
  'litree-overview': {
    ...sharedMeta['litree-overview'],
    title: '微服务与数据底座',
    entityName: '立升 10w+ 工业水站分布式微服务中枢与多租户分库底座',
    entityDescription: '负责立升全国 10w+ 净水/商用水站的设备身份识别、租户隔离、业务逻辑流转与分布式事务协调。',
    visualMetaphorSummary: '中央万向事务中枢 + 环绕数据分片 + 超导能量底座',
    components: [
      { name: '中央悬浮双轴万向核', metaphor: '象征 Seata 分布式事务协调器与 Redis/Caffeine 两级缓存核心' },
      { name: '环绕多阶数据分片', metaphor: '象征 ShardingSphere 动态分库分表与冷热数据分级存储池' },
      { name: '超导承托能量底座', metaphor: '象征 10w+ 水站多租户数据底座与动态数据源路由基座' },
      { name: '双向穿梭能量脉冲', metaphor: '象征 TransmittableThreadLocal 租户上下文与高并发流量管道' },
    ],
    keyMetrics: ['10w+ 联网水站', '2000+ QPS 峰值', '零租户数据越权'],
  },
  'litree-aiot': {
    ...sharedMeta['litree-aiot'],
    title: 'AIoT 与空间拓扑',
    entityName: '工业物联网协议引擎与 PostGIS 空间管网拓扑计算引擎',
    entityDescription: '负责全国供水管网与水质监测设备的毫秒级遥测采集、二进制协议编解码及空间流向拓扑分析。',
    visualMetaphorSummary: 'GIS 六边形空间拓扑网盘 + 旋转雷达探头 + 多协议工业网关机柜列',
    components: [
      { name: '空间六边形蜂窝网盘', metaphor: '象征 PostGIS GIST 空间索引与「设备-水站-管网」三级拓扑关系树' },
      { name: '空间雷达旋转扫描探头', metaphor: '象征 15km 空间缓冲区分析、BFS 连通性剪枝与实时流向追踪' },
      { name: 'AIoT 工业网关机柜列', metaphor: '象征 有人云 HTTP、MQTT、Modbus、TCP/UDP 与 OPC/HTTP 多协议接入及粘包拆包' },
      { name: '拓扑测点动态激光连线', metaphor: '象征 水质/流量/压力实时监测点位与故障管段快速拓扑溯源' },
    ],
    keyMetrics: ['千万级日遥测报文', '<50ms 空间查询', '15km 缓冲区秒级计算'],
  },
  'litree-agent': {
    ...sharedMeta['litree-agent'],
    title: '水务数据智能体',
    entityName: '立升智慧水务平台内的数据智能体与 AI Coding 工程运行时',
    entityDescription: '在水务微服务内落地可控、可恢复、可审计的 NL2SQL 智能体，并以真实项目固化 AI Coding 流程。',
    visualMetaphorSummary: 'AI 神经网络推理核心 + 3轴任务编排轨道 + 沙箱执行卫星',
    components: [
      { name: '中央正二十面体推理核心', metaphor: '象征 Spring AI Alibaba StateGraph 与 AgentScope Java 认知推理中枢' },
      { name: '3轴陀螺仪任务编排轨道', metaphor: '象征 意图识别 / NL2SQL / HITL 审批的状态图与 Checkpointer' },
      { name: '环绕多智能体工作卫星', metaphor: '象征 Tool Calling、只读数据查询与 Docker 沙箱执行' },
      { name: '底座全息智脑承托台', metaphor: '象征 AST 校验、Self-Correction 与可审计轨迹沉淀基座' },
    ],
    keyMetrics: ['HITL 人工审批', 'NL2SQL AST 校验', 'Docker 沙箱隔离'],
  },
  'oa-hr': {
    ...sharedMeta['oa-hr'],
    title: '立升 OA / HR',
    entityName: '立升企业内部 OA/HR 业务中台（考勤 / 绩效 / 主数据）',
    entityDescription: '独立于智慧水务监控的企业业务系统，承担组织人事、考勤排班、绩效考核，并向水务平台同步主数据。',
    visualMetaphorSummary: '中央状态机枢纽 + 双层状态流转星环 + 四向数据中继节点',
    components: [
      { name: '中央状态机枢纽', metaphor: '象征 Spring StateMachine 绩效全生命周期与考勤排班规则引擎' },
      { name: '双层状态流转星环', metaphor: '象征 考勤日结打卡、绩效考核审批与组织人事联动闭环' },
      { name: '四向数据中继节点', metaphor: '象征 组织架构、考勤排班、绩效核算与统一认证四条核心业务' },
      { name: '主数据同步脉冲', metaphor: '象征 Quartz 分页拉取、xtUserId 去重与 PostgreSQL 分批 upsert' },
    ],
    keyMetrics: ['弹性跨夜排班', '绩效状态机', '跨系统幂等同步'],
  },
  'welink-search': {
    ...sharedMeta['welink-search'],
    title: 'WeLink 统一搜索',
    entityName: '华为 WeLink 千万级企业统一搜索中台与个性化相关性打分引擎',
    entityDescription: '支撑千万级企业用户的联系人、群聊、文档、应用全网秒级聚合搜索与个性化权重打分。',
    visualMetaphorSummary: '倒金字塔多维打分棱镜 + ES 搜索机柜阵列 + 切片扫描激光',
    components: [
      { name: '倒金字塔多维打分棱镜', metaphor: '象征 BM25 文本相关性 + 组织距离 + 历史行为时效性的多因子打分路由' },
      { name: '4联分布式搜索机柜阵列', metaphor: '象征 Elasticsearch 亿级倒排索引集群与基于拼音/N-Gram 的中文纠错分词' },
      { name: '动态水平切片扫描激光', metaphor: '象征 毫秒级语义索引检索、高亮匹配与动态敏感词过滤拦截' },
      { name: '悬浮索引分片数据块', metaphor: '象征 Canal + Kafka 构筑的实时 CDC 增量索引同步流水线' },
    ],
    keyMetrics: ['千万级企业用户', '<80ms 搜索耗时', '多维度打分模型'],
  },
  'welink-data': {
    ...sharedMeta['welink-data'],
    title: 'WeLink 双路数据湖',
    entityName: 'Flink 实时计算流与 Spark 离线批处理双路数据湖治理系统',
    entityDescription: '实现华为 WeLink 实时行为埋点采集、指标实时聚合与 TB 级离线数据湖 ACID 事务一致性沉淀。',
    visualMetaphorSummary: '实时流处理柱 + 离线批处理柱 + ACID 版本协调桥',
    components: [
      { name: '左侧青蓝涡流反应柱', metaphor: '象征 Flink 实时流处理计算引擎与毫秒级滑动窗口聚合分析' },
      { name: '右侧活力橙离线反应柱', metaphor: '象征 Spark 离线海量批处理与每日多维报表调度引擎' },
      { name: '中央 ACID 版本治理协调桥', metaphor: '象征 Hudi/Iceberg 数据湖 ACID 事务保障、快照隔离与乐观锁治理' },
      { name: '双向穿梭闭环数据流', metaphor: '象征 实时流水线与离线批处理之间的增量校准与版本一致性治理' },
    ],
    keyMetrics: ['TB 级数据湖吞吐', '秒级流式聚合', 'ACID 事务一致性'],
  },
  'senge-gateway': {
    ...sharedMeta['senge-gateway'],
    title: '森格实时通信网关',
    entityName: 'Netty 50w+ 工业长连接通信网关与突发告警风暴治理集群',
    entityDescription: '负责森格水务海量工业设备实时长连接挂载、控制指令双向透传及突发海量告警聚合抑制。',
    visualMetaphorSummary: '中央主通信塔与天线阵列 + 告警风暴抑制波 + 网关矩阵底座',
    components: [
      { name: '中央主通信塔与天线阵列', metaphor: '象征 Netty 50w+ 工业长连接集群、心跳保活与毫秒级指令反向推送' },
      { name: '多阶电磁波扩散抑制环', metaphor: '象征 Redis 令牌桶平滑限流、滑动时间窗口聚合与突发告警风暴智能抑制' },
      { name: '分布式网关矩阵底座节点', metaphor: '象征 边缘网关集群、多协议适配层（Modbus/MQTT）与负载均衡' },
      { name: '高频脉冲发射光流', metaphor: '象征 工业控制指令与毫秒级传感器告警遥测流' },
    ],
    keyMetrics: ['50w+ 长连接维持', '90%+ 告警风暴过滤', '双向控制指令通道'],
  },
  'senge-platform': {
    ...sharedMeta['senge-platform'],
    title: '森格 0-1 平台架构',
    entityName: '智慧水务平台 0-1 微服务技术基座与 K8s 容器化编排底座',
    entityDescription: '带领初创团队从 0 到 1 完成智慧水务业务底座规划、容器化 DevOps 流水线搭建与多租户交付。',
    visualMetaphorSummary: '云原生 Pod 集群模块 + 工业管路阀门 + 服务网格光环',
    components: [
      { name: '3层阶梯式云原生 Pod 模块', metaphor: '象征 从 0 到 1 规划的微服务模块（设备/告警/监控）与 K8s 弹性伸缩 Pod' },
      { name: '工业流体管路与控制阀门', metaphor: '象征 智慧水务管网监测数据流转与全自动远程阀控闭环业务' },
      { name: '顶部服务网格负载均衡光环', metaphor: '象征 Spring Cloud Gateway 服务网格、熔断降级与链路追踪 (SkyWalking)' },
      { name: '全息遥测监控面板', metaphor: '象征 综合态势大屏、实时工艺流程组态图与端到端可视化运维看板' },
    ],
    keyMetrics: ['0-1 架构自研落地', 'CI/CD 自动化交付', '高可用微服务集群'],
  },
};

const enCatalog: ModelCatalog = {
  'litree-overview': {
    ...sharedMeta['litree-overview'],
    title: 'Microservices & Data Foundation',
    entityName: 'Litree 10w+ station microservice hub and multi-tenant sharding base',
    entityDescription:
      'Owns device identity, tenant isolation, business flow, and distributed-transaction coordination for 10w+ Litree stations.',
    visualMetaphorSummary: 'Central gimbal transaction core + surrounding data shards + superconductor energy base',
    components: [
      {
        name: 'Floating dual-axis gimbal core',
        metaphor: 'Stands for the Seata distributed-transaction coordinator and Redis/Caffeine two-level cache core',
      },
      {
        name: 'Surrounding multi-tier data shards',
        metaphor: 'Stands for ShardingSphere dynamic sharding and hot/cold data tiered storage pools',
      },
      {
        name: 'Superconductor energy base',
        metaphor: 'Stands for the 10w+ station multi-tenant data base and dynamic datasource routing foundation',
      },
      {
        name: 'Bidirectional shuttling energy pulses',
        metaphor: 'Stands for TransmittableThreadLocal tenant context and high-concurrency traffic pipes',
      },
    ],
    keyMetrics: ['10w+ connected stations', '2000+ peak QPS', 'Zero cross-tenant reads'],
  },
  'litree-aiot': {
    ...sharedMeta['litree-aiot'],
    title: 'AIoT & Spatial Topology',
    entityName: 'Industrial IoT protocol engine and PostGIS spatial pipe-network topology compute engine',
    entityDescription:
      'Handles millisecond telemetry collection, binary protocol codec, and spatial flow topology analysis for national water networks and quality sensors.',
    visualMetaphorSummary: 'GIS hexagonal spatial topology grid + rotating radar probe + multi-protocol industrial gateway racks',
    components: [
      {
        name: 'Spatial hexagonal honeycomb grid',
        metaphor: 'Stands for the PostGIS GIST spatial index and the device-station-network three-level topology tree',
      },
      {
        name: 'Spatial radar rotating scan probe',
        metaphor: 'Stands for 15km buffer analysis, BFS connectivity pruning, and realtime flow tracing',
      },
      {
        name: 'AIoT industrial gateway racks',
        metaphor:
          'Stands for UsrCloud HTTP, MQTT, Modbus, TCP/UDP, and OPC/HTTP multi-protocol ingest with sticky-packet framing',
      },
      {
        name: 'Topology point dynamic laser links',
        metaphor: 'Stands for realtime quality/flow/pressure monitor points and fast topology tracing of faulty pipe segments',
      },
    ],
    keyMetrics: ['10M+ daily telemetry messages', '<50ms spatial query', '15km buffer in seconds'],
  },
  'litree-agent': {
    ...sharedMeta['litree-agent'],
    title: 'Water Data Agent',
    entityName: 'Water data agent and AI Coding engineering runtime inside the Litree smart-water platform',
    entityDescription:
      'Lands a controllable, recoverable, auditable NL2SQL agent inside water microservices and turns a real project into an AI Coding workflow.',
    visualMetaphorSummary: 'AI neural inference core + 3-axis task orchestration track + sandbox execution satellites',
    components: [
      {
        name: 'Central icosahedral inference core',
        metaphor: 'Stands for the Spring AI Alibaba StateGraph and AgentScope Java cognitive reasoning hub',
      },
      {
        name: '3-axis gyroscope task orchestration track',
        metaphor: 'Stands for the intent / NL2SQL / HITL approval state graph and Checkpointer',
      },
      {
        name: 'Surrounding multi-agent worker satellites',
        metaphor: 'Stands for Tool Calling, read-only data queries, and Docker sandbox execution',
      },
      {
        name: 'Holographic brain base platform',
        metaphor: 'Stands for AST validation, Self-Correction, and the auditable trail sediment base',
      },
    ],
    keyMetrics: ['HITL human approval', 'NL2SQL AST validation', 'Docker sandbox isolation'],
  },
  'oa-hr': {
    ...sharedMeta['oa-hr'],
    title: 'Litree OA / HR',
    entityName: 'Litree internal OA/HR business platform (attendance / performance / master data)',
    entityDescription:
      'An enterprise business system independent of smart-water monitoring. Owns org/HR, attendance scheduling, performance review, and master-data sync to the water platform.',
    visualMetaphorSummary: 'Central state-machine hub + dual-layer state-flow star ring + four-way data relay nodes',
    components: [
      {
        name: 'Central state-machine hub',
        metaphor: 'Stands for the Spring StateMachine performance life cycle and attendance scheduling rule engine',
      },
      {
        name: 'Dual-layer state-flow star ring',
        metaphor: 'Stands for the daily attendance close, performance review approval, and org-HR linkage loop',
      },
      {
        name: 'Four-way data relay nodes',
        metaphor: 'Stands for the four core businesses: org structure, attendance scheduling, performance accounting, and unified auth',
      },
      {
        name: 'Master-data sync pulse',
        metaphor: 'Stands for Quartz paged pull, xtUserId dedupe, and PostgreSQL batch upsert',
      },
    ],
    keyMetrics: ['Flexible overnight shifts', 'Performance state machine', 'Idempotent cross-system sync'],
  },
  'welink-search': {
    ...sharedMeta['welink-search'],
    title: 'WeLink Unified Search',
    entityName: 'Huawei WeLink 10M-scale enterprise unified search platform and personalized relevance scoring engine',
    entityDescription:
      'Serves 10M-scale enterprise users with second-level aggregated search across contacts, groups, documents, and apps, plus personalized weight scoring.',
    visualMetaphorSummary: 'Inverted-pyramid multi-dimensional scoring prism + ES search rack array + slice scan laser',
    components: [
      {
        name: 'Inverted-pyramid multi-dimensional scoring prism',
        metaphor: 'Stands for the BM25 text relevance + org distance + historical behavior recency multi-factor scoring route',
      },
      {
        name: '4-unit distributed search rack array',
        metaphor: 'Stands for the Elasticsearch billion-scale inverted index cluster and pinyin/N-Gram Chinese correction tokenizer',
      },
      {
        name: 'Dynamic horizontal slice scan laser',
        metaphor: 'Stands for millisecond semantic index retrieval, highlight matching, and dynamic sensitive-word filtering',
      },
      {
        name: 'Floating index shard data blocks',
        metaphor: 'Stands for the Canal + Kafka realtime CDC incremental index sync pipeline',
      },
    ],
    keyMetrics: ['10M-scale enterprise users', '<80ms search latency', 'Multi-dimensional scoring model'],
  },
  'welink-data': {
    ...sharedMeta['welink-data'],
    title: 'WeLink Dual-Path Data Lake',
    entityName: 'Flink realtime stream and Spark offline batch dual-path data lake governance system',
    entityDescription:
      'Implements Huawei WeLink realtime behavior tracking, realtime metric aggregation, and TB-scale offline data lake ACID transaction consistency.',
    visualMetaphorSummary: 'Realtime stream pillar + offline batch pillar + ACID version coordination bridge',
    components: [
      {
        name: 'Left cyan-blue vortex reaction pillar',
        metaphor: 'Stands for the Flink realtime stream compute engine and millisecond sliding-window aggregation',
      },
      {
        name: 'Right vivid-orange offline reaction pillar',
        metaphor: 'Stands for the Spark offline massive batch processing and daily multi-dimensional report scheduling engine',
      },
      {
        name: 'Central ACID version governance bridge',
        metaphor: 'Stands for Hudi/Iceberg data lake ACID guarantees, snapshot isolation, and optimistic-lock governance',
      },
      {
        name: 'Bidirectional shuttling closed-loop data flow',
        metaphor: 'Stands for incremental calibration and version consistency between realtime and offline pipelines',
      },
    ],
    keyMetrics: ['TB-scale data lake throughput', 'Second-level stream aggregation', 'ACID transaction consistency'],
  },
  'senge-gateway': {
    ...sharedMeta['senge-gateway'],
    title: 'Senge Realtime Gateway',
    entityName: 'Netty 50w+ industrial long-lived connection gateway and alarm-storm governance cluster',
    entityDescription:
      'Handles Senge water massive industrial device realtime long-lived connections, bidirectional control command passthrough, and burst alarm aggregation suppression.',
    visualMetaphorSummary: 'Central main communication tower with antenna array + alarm-storm suppression wave + gateway matrix base',
    components: [
      {
        name: 'Central main communication tower and antenna array',
        metaphor: 'Stands for the Netty 50w+ industrial long-lived cluster, heartbeat keepalive, and millisecond reverse command push',
      },
      {
        name: 'Multi-tier electromagnetic diffusion suppression ring',
        metaphor: 'Stands for Redis token-bucket smooth rate limiting, sliding time-window aggregation, and burst alarm-storm smart suppression',
      },
      {
        name: 'Distributed gateway matrix base nodes',
        metaphor: 'Stands for the edge gateway cluster, multi-protocol adapter layer (Modbus/MQTT), and load balancing',
      },
      {
        name: 'High-frequency pulse emission light stream',
        metaphor: 'Stands for industrial control commands and millisecond sensor alarm telemetry streams',
      },
    ],
    keyMetrics: ['50w+ long-lived connections', '90%+ alarm-storm filtered', 'Bidirectional control channel'],
  },
  'senge-platform': {
    ...sharedMeta['senge-platform'],
    title: 'Senge 0-to-1 Platform',
    entityName: 'Smart-water platform 0-to-1 microservice foundation and K8s container orchestration base',
    entityDescription:
      'Led a startup team from 0 to 1 through smart-water business foundation planning, containerized DevOps pipeline setup, and multi-tenant delivery.',
    visualMetaphorSummary: 'Cloud-native Pod cluster modules + industrial pipe valves + service mesh halo',
    components: [
      {
        name: '3-tier stepped cloud-native Pod modules',
        metaphor: 'Stands for the 0-to-1 planned microservice modules (device/alarm/monitor) and K8s elastic-scaling Pods',
      },
      {
        name: 'Industrial fluid pipes and control valves',
        metaphor: 'Stands for smart-water network monitoring data flow and the fully automated remote valve-control loop',
      },
      {
        name: 'Top service-mesh load-balancing halo',
        metaphor: 'Stands for Spring Cloud Gateway service mesh, circuit-breaker fallback, and tracing (SkyWalking)',
      },
      {
        name: 'Holographic telemetry dashboard',
        metaphor: 'Stands for the situational-awareness big screen, realtime process flow SCADA, and end-to-end visual ops board',
      },
    ],
    keyMetrics: ['0-to-1 architecture self-built', 'CI/CD automated delivery', 'High-availability microservice cluster'],
  },
};

const catalogs: Record<Locale, ModelCatalog> = {
  zh: zhCatalog,
  en: enCatalog,
};

export const MODEL_REPRESENTATIONS: ModelCatalog = zhCatalog;

export function getModelRepresentation(id: string, locale: Locale = 'zh'): ModelRepresentation | undefined {
  return catalogs[locale][id];
}
