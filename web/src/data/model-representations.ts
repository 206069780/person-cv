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

export const MODEL_REPRESENTATIONS: Record<string, ModelRepresentation> = {
  'litree-overview': {
    id: 'litree-overview',
    order: '01',
    shortLabel: 'ARCH',
    title: '微服务与数据底座',
    subTitle: 'Microservice & Multi-Tenant Sharding',
    entityName: '立升 10w+ 工业水站分布式微服务中枢与多租户分库底座',
    entityDescription: '负责立升全国 10w+ 净水/商用水站的设备身份识别、租户隔离、业务逻辑流转与分布式事务协调。',
    visualMetaphorSummary: '中央万向事务中枢 + 4角多租户计算立柱 + 环绕数据分片',
    components: [
      { name: '中央悬浮双轴万向核', metaphor: '象征 Seata 分布式事务协调器与 Redis/Caffeine 两级缓存核心' },
      { name: '4角高耸服务计算立柱', metaphor: '象征 10w+ 水站网关路由与 ShardingSphere 动态分库分表集群' },
      { name: '环绕多阶数据分片', metaphor: '象征 MyBatis-Plus 多租户 SQL 拦截与冷热数据分级存储池' },
      { name: '双向穿梭能量脉冲', metaphor: '象征 TransmittableThreadLocal 租户上下文与高并发流量管道' },
    ],
    keyMetrics: ['10w+ 联网水站', '2000+ QPS 峰值', '零租户数据越权'],
    accentColor: '#28d7e5',
  },
  'litree-aiot': {
    id: 'litree-aiot',
    order: '02',
    shortLabel: 'AIoT',
    title: 'AIoT 与空间拓扑',
    subTitle: 'Industrial IoT & Spatial GIS Engine',
    entityName: '工业物联网协议引擎与 PostGIS 空间管网拓扑计算引擎',
    entityDescription: '负责全国供水管网与水质监测设备的毫秒级遥测采集、二进制协议编解码及空间流向拓扑分析。',
    visualMetaphorSummary: 'GIS 六边形空间拓扑网盘 + 旋转雷达探头 + 工业网关机柜列',
    components: [
      { name: '空间六边形蜂窝网盘', metaphor: '象征 PostGIS GIST 空间索引与「设备-水站-管网」三级拓扑关系树' },
      { name: '空间雷达旋转扫描探头', metaphor: '象征 15km 空间缓冲区分析、BFS 连通性剪枝与实时流向追踪' },
      { name: 'AIoT 工业网关机柜列', metaphor: '象征 自定义私有二进制协议解码、Netty 粘包拆包与千万级遥测吞吐' },
      { name: '拓扑测点动态激光连线', metaphor: '象征 水质/流量/压力实时监测点位与故障管段快速拓扑溯源' },
    ],
    keyMetrics: ['千万级日遥测报文', '<50ms 空间查询', '15km 缓冲区秒级计算'],
    accentColor: '#00a89d',
  },
  'litree-agent': {
    id: 'litree-agent',
    order: '03',
    shortLabel: 'AGENT',
    title: 'OA 中台与 Agent',
    subTitle: 'OA/HR Business Middle Platform & AI Agent Engine',
    entityName: '企业级 OA/HR 业务编排中台与 ReAct 智能体推理决策中枢',
    entityDescription: '融合企业考勤、绩效、流程编排与大模型智能体，支持复杂业务自然语言推理与自动化工单流转。',
    visualMetaphorSummary: 'AI 神经网络推理核心 + 3轴任务编排轨道 + 分布式中台基座',
    components: [
      { name: '中央正二十面体推理核心', metaphor: '象征 基于 LangChain4j + Spring AI 构建的 ReAct 认知推理与决策中枢' },
      { name: '3轴陀螺仪任务编排轨道', metaphor: '象征 考勤/绩效/审批工作流的 Spring StateMachine 状态机与分布式锁' },
      { name: '4座分布式执行中台立柱', metaphor: '象征 企业组织架构中台、多维考勤打卡引擎、绩效薪酬核算与 OpenAPI' },
      { name: '环绕多智能体工作卫星', metaphor: '象征 独立 Tool Calling 工具集（数据库查询/工单流转/代码沙箱执行）' },
    ],
    keyMetrics: ['ReAct 智能决策', 'Spring StateMachine', 'Docker 沙箱隔离'],
    accentColor: '#c084fc',
  },
  'welink-search': {
    id: 'welink-search',
    order: '04',
    shortLabel: 'SEARCH',
    title: 'WeLink 统一搜索',
    subTitle: 'Enterprise Unified Search & Scoring Engine',
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
    accentColor: '#ff6b3d',
  },
  'welink-data': {
    id: 'welink-data',
    order: '05',
    shortLabel: 'LAKE',
    title: 'WeLink 双路数据湖',
    subTitle: 'Dual-Engine Real-Time & Offline Data Lake',
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
    accentColor: '#28d7e5',
  },
  'senge-gateway': {
    id: 'senge-gateway',
    order: '06',
    shortLabel: 'GATEWAY',
    title: '森格实时通信网关',
    subTitle: 'Netty Gateway & Alarm Storm Engine',
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
    accentColor: '#ff6b3d',
  },
  'senge-platform': {
    id: 'senge-platform',
    order: '07',
    shortLabel: 'SENGE',
    title: '森格 0-1 平台架构',
    subTitle: 'Water Platform 0-1 Architecture & Cloud Delivery',
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
    accentColor: '#00a89d',
  },
};

export function getModelRepresentation(id: string): ModelRepresentation | undefined {
  return MODEL_REPRESENTATIONS[id];
}
