# Lito 情感行为合成助手 (Lito Behavior Synthesis Agent)

基于 LERE (Lito Emotional Resonance Engine) 协议的智能行为参数生成系统，将自然语言的情感描述转化为具身智能机器人的可执行参数。

## 📋 项目概述

Lito Agent 是一个专为具身智能产品经理设计的工具，能够将感性的交互需求（如"希望它被忽视时会委屈地碎碎念"）自动转化为符合 LERE 协议的结构化参数流，包括马达偏转角度、速度算子和音频调优参数。

## 🎯 核心功能

### 1. 情感计算 (VAT Calculator)
- 自然语言情感倾向识别
- VAT (Valence-Arousal-Time) 坐标计算
- 情感强度分析
- 置信度评估

### 2. 马达仿真 (Motor Simulator)
- 多马达轨迹生成
- 贝塞尔曲线插值
- 热负载分析
- 碰撞检测
- 安全边界校验
- PID 参数优化

### 3. 协议导出 (LERE Exporter)
- JSON 格式导出
- CSV 格式导出
- Trae Builder 兼容格式
- 数据验证和报告生成

### 4. 边界处理 (Boundary Handler)
- 歧义识别和澄清
- 风险操作确认
- 用户中断处理
- 备份和恢复机制
- 不确定性评估

## 🚀 快速开始

### 基础使用

```javascript
// 创建 Agent 实例
const agent = new LitoAgent();

// 处理用户请求
const result = await agent.processRequest(
    "当Lito被忽视时，会委屈地碎碎念，头微微低下",
    {
        persona: 'friendly',
        evolution: {
            daysRaised: 50
        }
    }
);

// 检查结果
if (result.success) {
    console.log('VAT 坐标:', result.data.vat);
    console.log('马达参数:', result.data.motorParameters);
    console.log('安全等级:', result.data.safetyLevel);
    
    // 导出为 JSON
    const exportResult = agent.lereExporter.exportToJSON(result.data.behavior);
    console.log('导出文件:', exportResult.filename);
}
```

### Web 界面使用

1. 打开 `lito_agent.html` 文件
2. 在输入框中描述您希望 Lito 表现的行为
3. 选择性格设定和演化参数
4. 点击"生成行为参数"按钮
5. 查看生成的 VAT 分析、马达参数、音频参数和仿真结果
6. 选择导出格式（JSON/CSV/Trae）

## 📁 项目结构

```
trae_11/
├── lito_agent.html          # 主界面
├── lito_agent.css           # 样式文件
├── lito_agent.js            # 核心 Agent 类
├── vat_calculator.js        # VAT 情感计算器
├── motor_simulator.js       # 马达仿真器
├── lere_exporter.js         # 协议导出器
├── boundary_handler.js      # 边界处理器
├── lito_ui.js               # UI 交互逻辑
├── examples.html            # 示例和测试页面
└── README.md               # 项目文档
```

## 🔧 核心组件说明

### VATCalculator
负责将自然语言描述转换为 VAT 坐标：

```javascript
const calculator = new VATCalculator();
const result = calculator.calculate("Lito很开心，兴奋地跳跃");

console.log(result.valence);    // 情感倾向: -1 到 1
console.log(result.arousal);    // 激活度: -1 到 1
console.log(result.confidence); // 置信度: 0 到 1
```

### MotorSimulator
模拟马达运行轨迹和安全检查：

```javascript
const simulator = new MotorSimulator();
const motorParams = {
    head: {
        startPosition: 0,
        endPosition: 30,
        duration: 1000,
        curveType: 'easeInOut'
    }
};

const result = simulator.simulate(motorParams);
console.log(result.trajectories);      // 运动轨迹
console.log(result.thermalAnalysis);   // 热负载分析
console.log(result.collisionWarnings); // 碰撞警告
console.log(result.overallSafety);    // 整体安全等级
```

### LEREExporter
导出符合 LERE 协议的文件：

```javascript
const exporter = new LEREExporter();

// JSON 格式
const jsonResult = exporter.exportToJSON(behaviorData);

// CSV 格式
const csvResult = exporter.exportToCSV(behaviorData);

// Trae 格式
const traeResult = exporter.exportToTraeFormat(behaviorData);
```

### BoundaryHandler
处理边界条件和安全机制：

```javascript
const handler = new BoundaryHandler();

// 歧义检查
const ambiguityCheck = handler.handleAmbiguity("大力一点");

// 风险操作检查
const riskCheck = handler.checkRiskOperation("修改核心逻辑");

// 不确定性评估
const uncertainty = handler.assessUncertainty(result);

// 创建备份
const backup = await handler.createBackupBeforeOperation(data, 'operation');
```

## 🎨 使用示例

### 示例 1: 基础情感行为
```
输入: "当Lito被主人忽视时，会委屈地碎碎念，头微微低下，身体轻微颤抖"
输出: VAT(valence: -0.6, arousal: 0.4) | 马达参数生成成功 | 安全等级: safe
```

### 示例 2: 害怕反应
```
输入: "设计一个Lito害怕打雷的反应，身体缩成一团，耳朵贴紧头部，发出低沉的呜咽声"
输出: VAT(valence: -0.8, arousal: 0.9) | 马达参数生成成功 | 安全等级: caution (噪音风险)
```

### 示例 3: 演化逻辑
```
输入: "摸头动作，启用演化逻辑，养了100天后变得更粘人"
输出: VAT(valence: 0.7, arousal: 0.3) | 演化加成: +20% 亲密度 | 安全等级: safe
```

## 🛡️ 安全机制

### 1. 决策逻辑
- **继续执行**: 输入描述包含明确的刺激源和预期情感倾向
- **暂停询问**: 可能导致硬件过载或与已定义性格偏离 80% 以上
- **终止任务**: 涉及非法用途（如设定暴力攻击动作）

### 2. 边界条件
- **歧义处理**: "大力一点"会询问是"力量大"还是"幅度大"
- **不确定性表达**: 标记 Confidence 和 Warning
- **风险操作确认**: 涉及核心底层逻辑的操作增加二次确认
- **用户中断**: 支持 ESC 键暂停处理
- **不可逆操作保护**: 自动创建 .bak 备份文件

### 3. 降级策略
- 仿真失败时输出静态角度参考值
- 低算力环境停止生成复杂贝塞尔曲线
- 语义歧义时执行引导式提问

## 📊 评估指标

- **任务完成率**: 生成的参数无需修改直接被研发采纳的比例（目标 > 70%）
- **人工干预率**: 每生成 10 个动作场景，用户被迫进入"暂停询问"环节的次数
- **用户接受率**: PM 对 Agent 生成的"描述语"与"动作拟真度"的满意度打分
- **安全边界触发率**: 成功拦截可能导致马达烧毁的异常指令次数

## 🧪 测试

打开 `examples.html` 页面可以运行完整的测试套件：

- VAT 情感计算测试
- 马达仿真安全检查测试
- 导出功能测试（JSON/CSV/Trae）
- 边界处理测试
- 安全机制测试

## 🔄 人机协作节点

### 关键确认
当 Agent 生成的马达角度超过物理限位时，必须由 PM 手动确认是否需要物理限位保护逻辑。

### 性格一致性
Agent 基于历史性格数据维护 Lito 的行为一致性，当新行为与历史性格偏离超过 80% 时会触发警告。

## 📝 LERE 协议规范

### VAT 坐标系统
- **Valence (情感倾向)**: -1 (负面) 到 1 (正面)
- **Arousal (激活度)**: -1 (平静) 到 1 (激动)
- **Time (时间维度)**: 0 (立即) 到 1 (持续)

### 马达参数规范
- **运动范围**: -90° 到 90°
- **持续时间**: 100ms 到 10000ms
- **曲线类型**: linear, easeIn, easeOut, easeInOut, bezier
- **最大速度**: 360°/s

### 音频参数规范
- **音调 (Pitch)**: 0.5 到 2.0
- **音量 (Volume)**: 0 到 1
- **持续时间**: 100ms 到 5000ms

## 🚨 限制说明

### 能力限制
- **不做**: 不直接修改底层固件 C++ 代码（避免系统崩溃）
- **原因**: 硬件安全限制，所有生成的机械运动必须经过仿真器二次校验

### 降级处理
- 在低算力环境下，停止生成复杂的贝塞尔插值曲线，仅输出起始与终点位置
- 若 Motor_Simulator 调用失败，则降级为输出静态角度参考值

## 📞 技术支持

如遇到问题或需要技术支持，请查看：
1. `examples.html` 中的使用示例和测试用例
2. 浏览器控制台的错误日志
3. 各个 JS 文件中的详细注释

## 📄 许可证

本项目遵循 LERE 协议规范，仅供内部使用。

## 🙏 致谢

感谢 Lito 团队在具身智能领域的持续探索和创新。