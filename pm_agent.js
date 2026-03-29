class ProductManagerAgent {
    constructor() {
        this.currentAgent = 'recorder';
        this.projectData = {
            name: '新项目',
            status: '进行中',
            progress: 0,
            facts: [],
            pendingPoints: [],
            decisions: [],
            businessIntent: null,
            prd: null,
            review: null,
            tickets: []
        };
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupRecorder();
        this.setupTranslator();
        this.setupWriter();
        this.setupReviewer();
        this.setupGenerator();
        this.setupGlobalActions();
        this.loadProjectData();
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const agent = item.dataset.agent;
                this.switchAgent(agent);
            });
        });
    }

    switchAgent(agent) {
        this.currentAgent = agent;
        
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.dataset.agent === agent) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        const panels = document.querySelectorAll('.agent-panel');
        panels.forEach(panel => {
            panel.classList.add('hidden');
        });

        const activePanel = document.getElementById(`${agent}Panel`);
        if (activePanel) {
            activePanel.classList.remove('hidden');
        }
    }

    setupRecorder() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchRecorderTab(tab);
            });
        });

        const outputTabBtns = document.querySelectorAll('.output-tab-btn');
        outputTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const output = btn.dataset.output;
                this.switchRecorderOutput(output);
            });
        });

        document.getElementById('processRecorderBtn').addEventListener('click', () => this.processMeetingContent());
        document.getElementById('clearRecorderBtn').addEventListener('click', () => this.clearRecorder());
        
        this.setupFileUpload();
    }

    setupFileUpload() {
        const fileUpload = document.getElementById('fileUpload');
        const fileList = document.getElementById('fileList');

        fileUpload.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            fileList.innerHTML = files.map(file => `
                <div class="file-item">
                    <span>📄 ${file.name}</span>
                    <span>${(file.size / 1024).toFixed(2)} KB</span>
                </div>
            `).join('');
        });
    }

    switchRecorderTab(tab) {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            if (content.id === `${tab}Tab`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }

    switchRecorderOutput(output) {
        const outputTabBtns = document.querySelectorAll('.output-tab-btn');
        outputTabBtns.forEach(btn => {
            if (btn.dataset.output === output) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const outputPanels = document.querySelectorAll('.output-panel');
        outputPanels.forEach(panel => {
            if (panel.id === `${output}Panel`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
    }

    processMeetingContent() {
        const meetingInput = document.getElementById('meetingInput').value.trim();
        const anonymizeData = document.getElementById('anonymizeData').checked;
        const extractDecisions = document.getElementById('extractDecisions').checked;

        if (!meetingInput) {
            this.showToast('请输入会议内容', 'error');
            return;
        }

        this.showToast('正在处理会议内容...', 'warning');

        setTimeout(() => {
            const result = this.analyzeMeeting(meetingInput, anonymizeData, extractDecisions);
            
            this.projectData.facts = result.facts;
            this.projectData.pendingPoints = result.pendingPoints;
            this.projectData.decisions = result.decisions;
            
            this.displayRecorderResults(result);
            this.updateProjectProgress(20);
            this.showToast('会议内容处理完成', 'success');
            this.saveProjectData();
        }, 1500);
    }

    analyzeMeeting(content, anonymize, extractDecisions) {
        let processedContent = content;
        
        if (anonymize) {
            processedContent = this.anonymizeContent(content);
        }

        const facts = this.extractFacts(processedContent);
        const pendingPoints = this.extractPendingPoints(processedContent);
        const decisions = extractDecisions ? this.extractDecisions(processedContent) : [];

        return { facts, pendingPoints, decisions };
    }

    anonymizeContent(content) {
        let anonymized = content;
        
        anonymized = anonymized.replace(/(\d{3})\d{4}(\d{4})/g, '$1****$2');
        anonymized = anonymized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '***@***.***');
        
        const namePatterns = [
            /张[一-龥]{1,2}/g,
            /李[一-龥]{1,2}/g,
            /王[一-龥]{1,2}/g,
            /刘[一-龥]{1,2}/g,
            /陈[一-龥]{1,2}/g
        ];
        
        namePatterns.forEach(pattern => {
            anonymized = anonymized.replace(pattern, '***');
        });

        return anonymized;
    }

    extractFacts(content) {
        const facts = [];
        const sentences = content.split(/[。！？\n]/).filter(s => s.trim());
        
        sentences.forEach((sentence, index) => {
            if (sentence.trim().length > 10) {
                const speakers = this.extractSpeakers(sentence);
                const topics = this.extractTopics(sentence);
                
                facts.push({
                    id: index + 1,
                    content: sentence.trim(),
                    speakers: speakers,
                    topics: topics,
                    timestamp: this.generateTimestamp()
                });
            }
        });

        return facts.slice(0, 20);
    }

    extractSpeakers(sentence) {
        const speakerPatterns = [
            /产品经理|PM|产品负责人/g,
            /开发|开发人员|技术负责人/g,
            /测试|QA|测试人员/g,
            /设计|UI|UX/g,
            /运营|市场/g
        ];

        const speakers = [];
        speakerPatterns.forEach(pattern => {
            const matches = sentence.match(pattern);
            if (matches) {
                speakers.push(...matches);
            }
        });

        return [...new Set(speakers)];
    }

    extractTopics(sentence) {
        const topicKeywords = [
            '功能', '需求', '用户', '登录', '注册', '支付', '订单',
            '时间', '周期', '进度', '完成', '开始', '结束',
            '数据', '指标', '分析', '报告', '统计',
            '设计', '界面', '交互', '体验', '流程'
        ];

        const topics = [];
        topicKeywords.forEach(keyword => {
            if (sentence.includes(keyword)) {
                topics.push(keyword);
            }
        });

        return [...new Set(topics)];
    }

    extractPendingPoints(content) {
        const pendingPatterns = [
            /需要.*?确认/g,
            /待.*?确定/g,
            /需要.*?讨论/g,
            /暂定/g,
            /可能/g,
            /考虑/g,
            /建议/g
        ];

        const pendingPoints = [];
        const sentences = content.split(/[。！？\n]/).filter(s => s.trim());

        sentences.forEach((sentence, index) => {
            pendingPatterns.forEach(pattern => {
                const matches = sentence.match(pattern);
                if (matches) {
                    pendingPoints.push({
                        id: index + 1,
                        content: sentence.trim(),
                        type: '待确认',
                        priority: this.determinePriority(sentence)
                    });
                }
            });
        });

        return [...new Set(pendingPoints.map(p => JSON.stringify(p)))].map(s => JSON.parse(s));
    }

    determinePriority(sentence) {
        if (sentence.includes('紧急') || sentence.includes('重要')) {
            return '高';
        } else if (sentence.includes('建议') || sentence.includes('考虑')) {
            return '低';
        }
        return '中';
    }

    extractDecisions(content) {
        const decisionPatterns = [
            /决定.*?做/g,
            /确定.*?方案/g,
            /同意.*?实施/g,
            /采用.*?方式/g,
            /选择.*?方案/g,
            /最终.*?为/g
        ];

        const decisions = [];
        const sentences = content.split(/[。！？\n]/).filter(s => s.trim());

        sentences.forEach((sentence, index) => {
            decisionPatterns.forEach(pattern => {
                const matches = sentence.match(pattern);
                if (matches) {
                    const owner = this.extractOwner(sentence);
                    const deadline = this.extractDeadline(sentence);
                    
                    decisions.push({
                        id: index + 1,
                        content: sentence.trim(),
                        owner: owner,
                        deadline: deadline,
                        status: '待执行'
                    });
                }
            });
        });

        return [...new Set(decisions.map(d => JSON.stringify(d)))].map(s => JSON.parse(s));
    }

    extractOwner(sentence) {
        const ownerPatterns = [
            /由(.+?)负责/g,
            /(.+?)承担/g,
            /(.+?)完成/g
        ];

        for (const pattern of ownerPatterns) {
            const match = sentence.match(pattern);
            if (match) {
                return match[1];
            }
        }

        return '待分配';
    }

    extractDeadline(sentence) {
        const deadlinePatterns = [
            /(\d+)周/g,
            /(\d+)天/g,
            /(\d+)月/g,
            /下周/g,
            /本月/g
        ];

        for (const pattern of deadlinePatterns) {
            const match = sentence.match(pattern);
            if (match) {
                return match[0];
            }
        }

        return '待确定';
    }

    generateTimestamp() {
        const now = new Date();
        return now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }

    displayRecorderResults(result) {
        const factsPanel = document.getElementById('factsPanel');
        const pendingPanel = document.getElementById('pendingPanel');
        const decisionsPanel = document.getElementById('decisionsPanel');

        if (result.facts.length > 0) {
            factsPanel.innerHTML = result.facts.map(fact => `
                <div class="fact-item">
                    <div class="fact-header">
                        <span class="fact-id">#${fact.id}</span>
                        <span class="fact-time">${fact.timestamp}</span>
                    </div>
                    <div class="fact-content">${this.escapeHtml(fact.content)}</div>
                    <div class="fact-meta">
                        ${fact.speakers.length > 0 ? `<span class="fact-speakers">👤 ${fact.speakers.join(', ')}</span>` : ''}
                        ${fact.topics.length > 0 ? `<span class="fact-topics">🏷️ ${fact.topics.join(', ')}</span>` : ''}
                    </div>
                </div>
            `).join('');
        }

        if (result.pendingPoints.length > 0) {
            pendingPanel.innerHTML = result.pendingPoints.map(point => `
                <div class="pending-item">
                    <div class="pending-header">
                        <span class="pending-id">#${point.id}</span>
                        <span class="pending-type">${point.type}</span>
                        <span class="pending-priority priority-${point.priority}">${point.priority}</span>
                    </div>
                    <div class="pending-content">${this.escapeHtml(point.content)}</div>
                </div>
            `).join('');
        }

        if (result.decisions.length > 0) {
            decisionsPanel.innerHTML = result.decisions.map(decision => `
                <div class="decision-item">
                    <div class="decision-header">
                        <span class="decision-id">#${decision.id}</span>
                        <span class="decision-status">${decision.status}</span>
                    </div>
                    <div class="decision-content">${this.escapeHtml(decision.content)}</div>
                    <div class="decision-meta">
                        <span class="decision-owner">👤 ${decision.owner}</span>
                        <span class="decision-deadline">⏰ ${decision.deadline}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    clearRecorder() {
        document.getElementById('meetingInput').value = '';
        document.getElementById('fileList').innerHTML = '';
        
        const panels = ['factsPanel', 'pendingPanel', 'decisionsPanel'];
        panels.forEach(panelId => {
            const panel = document.getElementById(panelId);
            panel.innerHTML = `
                <div class="empty-state">
                    <span>📋</span>
                    <p>输入会议内容后点击"开始处理"</p>
                </div>
            `;
        });

        this.projectData.facts = [];
        this.projectData.pendingPoints = [];
        this.projectData.decisions = [];
        this.showToast('已清空', 'success');
    }

    setupTranslator() {
        document.getElementById('processTranslatorBtn').addEventListener('click', () => this.translateBusinessIntent());
        document.getElementById('clearTranslatorBtn').addEventListener('click', () => this.clearTranslator());
    }

    translateBusinessIntent() {
        const businessInput = document.getElementById('businessInput').value.trim();
        const facts = this.projectData.facts;

        if (!businessInput && facts.length === 0) {
            this.showToast('请输入业务需求或先处理会议内容', 'error');
            return;
        }

        this.showToast('正在翻译业务意图...', 'warning');

        setTimeout(() => {
            const result = this.generateBusinessIntent(businessInput, facts);
            this.projectData.businessIntent = result;
            
            this.displayTranslatorResults(result);
            this.updateTranslatorReference();
            this.updateProjectProgress(40);
            this.showToast('业务意图翻译完成', 'success');
            this.saveProjectData();
        }, 1500);
    }

    generateBusinessIntent(businessInput, facts) {
        const context = businessInput || (facts.length > 0 ? facts.map(f => f.content).join('。') : '');
        
        return {
            goal: this.extractGoal(context),
            constraints: this.extractConstraints(context),
            assumptions: this.extractAssumptions(context),
            priority: this.determinePriority(context)
        };
    }

    extractGoal(context) {
        const goalPatterns = [
            /想要.*?功能/g,
            /需要.*?实现/g,
            /目标是/g,
            /为了.*?用户/g
        ];

        for (const pattern of goalPatterns) {
            const match = context.match(pattern);
            if (match) {
                return match[0].replace(/想要|需要|目标是|为了/g, '').trim();
            }
        }

        return '提升用户体验，满足业务需求';
    }

    extractConstraints(context) {
        const constraints = [];
        
        if (context.includes('时间') || context.includes('周期')) {
            constraints.push('时间约束：需要在规定时间内完成');
        }
        
        if (context.includes('资源') || context.includes('人力')) {
            constraints.push('资源约束：受限于现有团队规模');
        }
        
        if (context.includes('合规') || context.includes('安全')) {
            constraints.push('合规约束：需要符合相关法规要求');
        }
        
        if (context.includes('数据') || context.includes('隐私')) {
            constraints.push('数据约束：需要保护用户隐私数据');
        }

        if (constraints.length === 0) {
            constraints.push('时间约束：按计划推进');
            constraints.push('质量约束：确保产品稳定性');
        }

        return constraints;
    }

    extractAssumptions(context) {
        const assumptions = [];
        
        if (context.includes('用户')) {
            assumptions.push('假设用户具备基本的操作能力');
        }
        
        if (context.includes('市场') || context.includes('竞争')) {
            assumptions.push('假设市场需求稳定');
        }
        
        if (context.includes('技术') || context.includes('开发')) {
            assumptions.push('假设技术方案可行');
        }

        if (assumptions.length === 0) {
            assumptions.push('假设用户接受度良好');
            assumptions.push('假设技术实现可行');
        }

        return assumptions;
    }

    determinePriority(context) {
        if (context.includes('紧急') || context.includes('重要') || context.includes('核心')) {
            return { level: '高', reason: '核心业务需求，影响重大' };
        } else if (context.includes('优化') || context.includes('改进')) {
            return { level: '中', reason: '功能优化，提升体验' };
        }
        return { level: '中', reason: '常规功能开发' };
    }

    displayTranslatorResults(result) {
        document.getElementById('goalOutput').innerHTML = `
            <div class="result-content">
                <p><strong>目标：</strong>${this.escapeHtml(result.goal)}</p>
            </div>
        `;

        document.getElementById('constraintsOutput').innerHTML = `
            <div class="result-content">
                <ul>
                    ${result.constraints.map(c => `<li>${this.escapeHtml(c)}</li>`).join('')}
                </ul>
            </div>
        `;

        document.getElementById('assumptionsOutput').innerHTML = `
            <div class="result-content">
                <ul>
                    ${result.assumptions.map(a => `<li>${this.escapeHtml(a)}</li>`).join('')}
                </ul>
            </div>
        `;

        document.getElementById('priorityOutput').innerHTML = `
            <div class="result-content">
                <p><strong>优先级：</strong><span class="priority-${result.priority.level}">${result.priority.level}</span></p>
                <p><strong>原因：</strong>${this.escapeHtml(result.priority.reason)}</p>
            </div>
        `;
    }

    updateTranslatorReference() {
        const referenceBox = document.getElementById('translatorReference');
        
        if (this.projectData.facts.length > 0) {
            referenceBox.innerHTML = `
                <div class="reference-content">
                    <h4>📋 事实清单摘要</h4>
                    <ul>
                        ${this.projectData.facts.slice(0, 5).map(f => `
                            <li>${this.escapeHtml(f.content.substring(0, 50))}...</li>
                        `).join('')}
                    </ul>
                    <p class="reference-count">共 ${this.projectData.facts.length} 条事实</p>
                </div>
            `;
        }
    }

    clearTranslator() {
        document.getElementById('businessInput').value = '';
        
        const outputs = ['goalOutput', 'constraintsOutput', 'assumptionsOutput', 'priorityOutput'];
        outputs.forEach(outputId => {
            const output = document.getElementById(outputId);
            const icon = outputId === 'goalOutput' ? '🎯' : 
                        outputId === 'constraintsOutput' ? '⚠️' :
                        outputId === 'assumptionsOutput' ? '💡' : '📊';
            const text = outputId === 'goalOutput' ? '目标将在这里显示' : 
                       outputId === 'constraintsOutput' ? '约束条件将在这里显示' :
                       outputId === 'assumptionsOutput' ? '关键假设将在这里显示' : '优先级建议将在这里显示';
            
            output.innerHTML = `
                <div class="empty-state">
                    <span>${icon}</span>
                    <p>${text}</p>
                </div>
            `;
        });

        this.projectData.businessIntent = null;
        this.showToast('已清空', 'success');
    }

    setupWriter() {
        document.getElementById('generatePRDBtn').addEventListener('click', () => this.generatePRD());
        document.getElementById('clearWriterBtn').addEventListener('click', () => this.clearWriter());
    }

    generatePRD() {
        const prdName = document.getElementById('prdName').value.trim();
        const prdVersion = document.getElementById('prdVersion').value.trim();
        const prdOwner = document.getElementById('prdOwner').value.trim();
        const prdDeadline = document.getElementById('prdDeadline').value;
        const businessIntent = this.projectData.businessIntent;

        if (!prdName) {
            this.showToast('请输入项目名称', 'error');
            return;
        }

        if (!businessIntent) {
            this.showToast('请先在"业务意图翻译官"中翻译业务需求', 'error');
            return;
        }

        this.showToast('正在生成PRD文档...', 'warning');

        setTimeout(() => {
            const prd = this.createPRD(prdName, prdVersion, prdOwner, prdDeadline, businessIntent);
            this.projectData.prd = prd;
            
            this.displayPRD(prd);
            this.updateWriterReference();
            this.updateReviewerReference();
            this.updateGeneratorReference();
            this.updateProjectProgress(60);
            this.showToast('PRD文档生成完成', 'success');
            this.saveProjectData();
        }, 2000);
    }

    createPRD(name, version, owner, deadline, businessIntent) {
        return {
            metadata: {
                name: name,
                version: version,
                owner: owner || '产品经理',
                deadline: deadline || '待确定',
                createdAt: new Date().toISOString()
            },
            sections: {
                background: this.generateBackground(businessIntent),
                problem: this.generateProblem(businessIntent),
                goals: this.generateGoals(businessIntent),
                scope: this.generateScope(businessIntent),
                userJourney: this.generateUserJourney(businessIntent),
                solution: this.generateSolution(businessIntent),
                metrics: this.generateMetrics(businessIntent),
                risks: this.generateRisks(businessIntent)
            }
        };
    }

    generateBackground(businessIntent) {
        return `本项目旨在${businessIntent.goal}。基于市场调研和用户反馈，我们识别出了关键的业务机会和用户需求。`;
    }

    generateProblem(businessIntent) {
        return `当前存在的问题包括：\n1. 用户体验有待提升\n2. 业务流程需要优化\n3. 功能完整性不足\n\n这些问题影响了用户满意度和业务效率。`;
    }

    generateGoals(businessIntent) {
        return `项目目标：\n1. ${businessIntent.goal}\n2. 提升用户满意度\n3. 优化业务流程\n4. 确保系统稳定性\n\n成功标准：\n- 用户满意度提升20%\n- 功能完成率达到100%\n- 系统可用性达到99.9%`;
    }

    generateScope(businessIntent) {
        return `项目范围：\n\n包含范围（In Scope）：\n- 核心功能开发\n- 用户界面设计\n- 基础数据埋点\n- 基础测试\n\n不包含范围（Out Scope）：\n- 高级功能\n- 第三方集成\n- 性能优化\n- 安全加固`;
    }

    generateUserJourney(businessIntent) {
        return `用户旅程：\n\n1. 用户访问系统\n2. 用户进行身份验证\n3. 用户使用核心功能\n4. 用户完成目标操作\n5. 用户获得反馈\n\n关键触点：\n- 登录页面\n- 功能页面\n- 结果页面`;
    }

    generateSolution(businessIntent) {
        return `方案说明：\n\n核心功能：\n- 功能模块A：实现基础功能\n- 功能模块B：支持高级操作\n- 功能模块C：提供数据分析\n\n关键交互：\n- 简洁直观的界面设计\n- 流畅的用户操作流程\n- 及时的用户反馈\n\n关键规则：\n- 数据验证规则\n- 权限控制规则\n- 业务逻辑规则`;
    }

    generateMetrics(businessIntent) {
        return `埋点与指标：\n\n核心指标：\n- 用户活跃度（DAU/MAU）\n- 功能使用率\n- 用户留存率\n- 转化率\n\n埋点方案：\n- 页面访问埋点\n- 功能使用埋点\n- 用户行为埋点\n- 错误监控埋点`;
    }

    generateRisks(businessIntent) {
        return `风险与灰度策略：\n\n主要风险：\n1. 技术风险：新技术的应用可能带来不确定性\n2. 业务风险：用户接受度可能低于预期\n3. 资源风险：开发资源可能不足\n\n灰度策略：\n- 第一阶段：内部测试（10%用户）\n- 第二阶段：小范围灰度（30%用户）\n- 第三阶段：全量发布（100%用户）\n\n应急预案：\n- 功能降级方案\n- 回滚机制\n- 监控告警`;
    }

    displayPRD(prd) {
        const prdPreview = document.getElementById('prdPreview');
        
        prdPreview.innerHTML = `
            <div class="prd-document">
                <div class="prd-header">
                    <h2>${this.escapeHtml(prd.metadata.name)}</h2>
                    <div class="prd-meta">
                        <span>版本：${this.escapeHtml(prd.metadata.version)}</span>
                        <span>负责人：${this.escapeHtml(prd.metadata.owner)}</span>
                        <span>截止日期：${this.escapeHtml(prd.metadata.deadline)}</span>
                    </div>
                </div>
                
                <div class="prd-section">
                    <h3>1. 背景与问题定义</h3>
                    <div class="prd-content">
                        <h4>背景</h4>
                        <p>${this.escapeHtml(prd.sections.background)}</p>
                        <h4>问题定义</h4>
                        <p>${this.escapeHtml(prd.sections.problem)}</p>
                    </div>
                </div>
                
                <div class="prd-section">
                    <h3>2. 目标与范围</h3>
                    <div class="prd-content">
                        <h4>目标</h4>
                        <p>${this.escapeHtml(prd.sections.goals)}</p>
                        <h4>范围</h4>
                        <p>${this.escapeHtml(prd.sections.scope)}</p>
                    </div>
                </div>
                
                <div class="prd-section">
                    <h3>3. 核心流程</h3>
                    <div class="prd-content">
                        <h4>用户旅程</h4>
                        <p>${this.escapeHtml(prd.sections.userJourney)}</p>
                    </div>
                </div>
                
                <div class="prd-section">
                    <h3>4. 方案说明</h3>
                    <div class="prd-content">
                        <p>${this.escapeHtml(prd.sections.solution)}</p>
                    </div>
                </div>
                
                <div class="prd-section">
                    <h3>5. 埋点与指标</h3>
                    <div class="prd-content">
                        <p>${this.escapeHtml(prd.sections.metrics)}</p>
                    </div>
                </div>
                
                <div class="prd-section">
                    <h3>6. 风险与灰度策略</h3>
                    <div class="prd-content">
                        <p>${this.escapeHtml(prd.sections.risks)}</p>
                    </div>
                </div>
            </div>
        `;
    }

    updateWriterReference() {
        const referenceBox = document.getElementById('writerReference');
        
        if (this.projectData.businessIntent) {
            const intent = this.projectData.businessIntent;
            referenceBox.innerHTML = `
                <div class="reference-content">
                    <h4>🎯 业务意图摘要</h4>
                    <p><strong>目标：</strong>${this.escapeHtml(intent.goal)}</p>
                    <p><strong>优先级：</strong><span class="priority-${intent.priority.level}">${intent.priority.level}</span></p>
                    <p><strong>约束条件：</strong>${intent.constraints.length} 条</p>
                </div>
            `;
        }
    }

    clearWriter() {
        document.getElementById('prdName').value = '';
        document.getElementById('prdVersion').value = 'v1.0.0';
        document.getElementById('prdOwner').value = '';
        document.getElementById('prdDeadline').value = '';
        
        document.getElementById('prdPreview').innerHTML = `
            <div class="empty-state">
                <span>📄</span>
                <p>PRD文档将在这里生成</p>
            </div>
        `;

        this.projectData.prd = null;
        this.showToast('已清空', 'success');
    }

    setupReviewer() {
        const reviewTabBtns = document.querySelectorAll('.review-tab-btn');
        reviewTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchReviewTab(tab);
            });
        });

        document.getElementById('startReviewBtn').addEventListener('click', () => this.startReview());
        document.getElementById('clearReviewerBtn').addEventListener('click', () => this.clearReviewer());
    }

    switchReviewTab(tab) {
        const reviewTabBtns = document.querySelectorAll('.review-tab-btn');
        reviewTabBtns.forEach(btn => {
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const reviewPanels = document.querySelectorAll('.review-panel');
        reviewPanels.forEach(panel => {
            if (panel.id === `${tab}Panel`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
    }

    startReview() {
        const selectedRoles = Array.from(document.querySelectorAll('.role-card input:checked')).map(cb => cb.value);
        const prd = this.projectData.prd;

        if (selectedRoles.length === 0) {
            this.showToast('请至少选择一个评审角色', 'error');
            return;
        }

        if (!prd) {
            this.showToast('请先生成PRD文档', 'error');
            return;
        }

        this.showToast('正在进行评审...', 'warning');

        setTimeout(() => {
            const review = this.generateReview(selectedRoles, prd);
            this.projectData.review = review;
            
            this.displayReviewResults(review);
            this.updateProjectProgress(80);
            this.showToast('评审完成', 'success');
            this.saveProjectData();
        }, 2000);
    }

    generateReview(roles, prd) {
        const questions = [];
        const decisions = [];
        const disputes = [];

        roles.forEach(role => {
            const roleQuestions = this.generateRoleQuestions(role, prd);
            questions.push(...roleQuestions);
        });

        decisions.push({
            id: 1,
            content: '确认PRD文档结构完整，包含所有必要章节',
            status: '已确认',
            reviewer: '产品经理'
        });

        disputes.push({
            id: 1,
            content: '部分功能实现方式存在技术争议',
            positions: ['前端方案A', '后端方案B'],
            deadline: '待确定',
            decisionMaker: '技术负责人'
        });

        return {
            questions: questions.slice(0, 30),
            decisions: decisions,
            disputes: disputes
        };
    }

    generateRoleQuestions(role, prd) {
        const questionTemplates = {
            dev: [
                { question: '边界条件如何处理？', section: '方案说明', risk: '高' },
                { question: '异常情况如何处理？', section: '方案说明', risk: '高' },
                { question: '性能指标要求是什么？', section: '埋点与指标', risk: '中' },
                { question: '并发场景如何处理？', section: '方案说明', risk: '高' },
                { question: '数据一致性如何保证？', section: '方案说明', risk: '高' },
                { question: '接口设计是否合理？', section: '方案说明', risk: '中' }
            ],
            qa: [
                { question: '验收标准是什么？', section: '目标与范围', risk: '高' },
                { question: '极端场景如何测试？', section: '方案说明', risk: '中' },
                { question: '兼容性要求是什么？', section: '背景与问题定义', risk: '中' },
                { question: '回归测试范围如何确定？', section: '目标与范围', risk: '中' },
                { question: '自动化测试覆盖率要求？', section: '埋点与指标', risk: '低' }
            ],
            data: [
                { question: '指标定义是否清晰？', section: '埋点与指标', risk: '高' },
                { question: '归因逻辑是什么？', section: '埋点与指标', risk: '高' },
                { question: '数据采集方案是否合理？', section: '埋点与指标', risk: '中' },
                { question: '数据隐私如何保护？', section: '风险与灰度策略', risk: '高' }
            ],
            compliance: [
                { question: '数据来源是否合规？', section: '背景与问题定义', risk: '高' },
                { question: '用户授权如何获取？', section: '方案说明', risk: '高' },
                { question: '数据留存期限是多久？', section: '风险与灰度策略', risk: '高' },
                { question: '是否符合GDPR等法规？', section: '风险与灰度策略', risk: '高' }
            ]
        };

        return questionTemplates[role] || [];
    }

    displayReviewResults(review) {
        const questionsPanel = document.getElementById('questionsPanel');
        const decisionsPanel = document.getElementById('decisionsPanel');
        const disputesPanel = document.getElementById('disputesPanel');

        if (review.questions.length > 0) {
            questionsPanel.innerHTML = review.questions.map((q, index) => `
                <div class="question-item">
                    <div class="question-header">
                        <span class="question-id">Q${index + 1}</span>
                        <span class="question-section">${q.section}</span>
                        <span class="question-risk risk-${q.risk}">${q.risk}</span>
                    </div>
                    <div class="question-content">${this.escapeHtml(q.question)}</div>
                </div>
            `).join('');
        }

        if (review.decisions.length > 0) {
            decisionsPanel.innerHTML = review.decisions.map(d => `
                <div class="decision-record">
                    <div class="decision-record-header">
                        <span class="decision-record-id">#${d.id}</span>
                        <span class="decision-record-status">${d.status}</span>
                    </div>
                    <div class="decision-record-content">${this.escapeHtml(d.content)}</div>
                    <div class="decision-record-meta">
                        <span>👤 ${this.escapeHtml(d.reviewer)}</span>
                    </div>
                </div>
            `).join('');
        }

        if (review.disputes.length > 0) {
            disputesPanel.innerHTML = review.disputes.map(d => `
                <div class="dispute-item">
                    <div class="dispute-header">
                        <span class="dispute-id">#${d.id}</span>
                        <span class="dispute-deadline">⏰ ${this.escapeHtml(d.deadline)}</span>
                    </div>
                    <div class="dispute-content">${this.escapeHtml(d.content)}</div>
                    <div class="dispute-positions">
                        <strong>各方观点：</strong>
                        <ul>
                            ${d.positions.map(p => `<li>${this.escapeHtml(p)}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="dispute-meta">
                        <span>👤 决策者：${this.escapeHtml(d.decisionMaker)}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    updateReviewerReference() {
        const referenceBox = document.getElementById('reviewerReference');
        
        if (this.projectData.prd) {
            const prd = this.projectData.prd;
            referenceBox.innerHTML = `
                <div class="reference-content">
                    <h4>📄 PRD文档摘要</h4>
                    <p><strong>名称：</strong>${this.escapeHtml(prd.metadata.name)}</p>
                    <p><strong>版本：</strong>${this.escapeHtml(prd.metadata.version)}</p>
                    <p><strong>负责人：</strong>${this.escapeHtml(prd.metadata.owner)}</p>
                    <p><strong>包含章节：</strong>${Object.keys(prd.sections).length} 个</p>
                </div>
            `;
        }
    }

    clearReviewer() {
        document.querySelectorAll('.role-card input').forEach(cb => cb.checked = false);
        document.querySelectorAll('.role-card input[value="dev"], .role-card input[value="qa"]').forEach(cb => cb.checked = true);
        
        const panels = ['questionsPanel', 'decisionsPanel', 'disputesPanel'];
        panels.forEach(panelId => {
            const panel = document.getElementById(panelId);
            const icon = panelId === 'questionsPanel' ? '❓' : 
                        panelId === 'decisionsPanel' ? '✅' : '⚡';
            const text = panelId === 'questionsPanel' ? '挑战问题将在这里显示' : 
                       panelId === 'decisionsPanel' ? '决策记录将在这里显示' : '争议清单将在这里显示';
            
            panel.innerHTML = `
                <div class="empty-state">
                    <span>${icon}</span>
                    <p>${text}</p>
                </div>
            `;
        });

        this.projectData.review = null;
        this.showToast('已清空', 'success');
    }

    setupGenerator() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.filterTickets(filter);
            });
        });

        document.getElementById('generateTicketsBtn').addEventListener('click', () => this.generateTickets());
        document.getElementById('clearGeneratorBtn').addEventListener('click', () => this.clearGenerator());
    }

    generateTickets() {
        const prd = this.projectData.prd;
        const review = this.projectData.review;

        if (!prd) {
            this.showToast('请先生成PRD文档', 'error');
            return;
        }

        this.showToast('正在生成工单...', 'warning');

        setTimeout(() => {
            const tickets = this.createTickets(prd, review);
            this.projectData.tickets = tickets;
            
            this.displayTickets(tickets);
            this.updateProjectProgress(100);
            this.showToast('工单生成完成', 'success');
            this.saveProjectData();
        }, 2000);
    }

    createTickets(prd, review) {
        const tickets = [];
        let ticketId = 1;

        const frontendTickets = [
            { title: '用户登录页面开发', description: '实现用户登录界面，包括用户名/密码输入、验证码、登录按钮等', type: 'frontend', priority: '高', estimate: '3天' },
            { title: '功能页面UI开发', description: '根据设计稿实现核心功能页面', type: 'frontend', priority: '高', estimate: '5天' },
            { title: '响应式布局适配', description: '适配不同屏幕尺寸，确保移动端体验', type: 'frontend', priority: '中', estimate: '2天' },
            { title: '用户反馈组件开发', description: '实现用户操作反馈提示组件', type: 'frontend', priority: '低', estimate: '1天' }
        ];

        const backendTickets = [
            { title: '用户认证接口开发', description: '实现用户登录、注册、密码重置等接口', type: 'backend', priority: '高', estimate: '4天' },
            { title: '核心业务逻辑实现', description: '实现核心功能的业务逻辑', type: 'backend', priority: '高', estimate: '6天' },
            { title: '数据接口开发', description: '实现前后端数据交互接口', type: 'backend', priority: '高', estimate: '3天' },
            { title: '异常处理机制', description: '完善系统异常处理和错误日志', type: 'backend', priority: '中', estimate: '2天' }
        ];

        const dataTickets = [
            { title: '数据库设计', description: '设计数据库表结构和索引', type: 'data', priority: '高', estimate: '2天' },
            { title: '埋点方案实施', description: '实现用户行为数据埋点', type: 'data', priority: '中', estimate: '2天' },
            { title: '数据报表开发', description: '开发核心数据统计报表', type: 'data', priority: '低', estimate: '3天' }
        ];

        const configTickets = [
            { title: '系统配置项管理', description: '实现系统配置项的管理功能', type: 'config', priority: '中', estimate: '1天' },
            { title: '权限配置', description: '配置用户权限和角色', type: 'config', priority: '高', estimate: '1天' }
        ];

        [...frontendTickets, ...backendTickets, ...dataTickets, ...configTickets].forEach(ticket => {
            tickets.push({
                id: `TICKET-${String(ticketId).padStart(4, '0')}`,
                ...ticket,
                status: '待开始',
                assignee: '待分配',
                dependencies: [],
                risks: this.identifyTicketRisks(ticket)
            });
            ticketId++;
        });

        return tickets;
    }

    identifyTicketRisks(ticket) {
        const risks = [];
        
        if (ticket.priority === '高') {
            risks.push('高优先级任务，需要重点关注');
        }
        
        if (ticket.type === 'backend' && ticket.title.includes('接口')) {
            risks.push('需要与前端紧密配合');
        }
        
        if (ticket.type === 'data' && ticket.title.includes('数据库')) {
            risks.push('需要考虑数据迁移方案');
        }

        return risks.length > 0 ? risks : ['无明显风险'];
    }

    displayTickets(tickets) {
        const ticketList = document.getElementById('ticketList');
        
        ticketList.innerHTML = tickets.map(ticket => `
            <div class="ticket-item" data-type="${ticket.type}">
                <div class="ticket-header">
                    <span class="ticket-id">${ticket.id}</span>
                    <span class="ticket-type">${ticket.type}</span>
                </div>
                <div class="ticket-title">${this.escapeHtml(ticket.title)}</div>
                <div class="ticket-description">${this.escapeHtml(ticket.description)}</div>
                <div class="ticket-meta">
                    <span>优先级：<span class="priority-${ticket.priority}">${ticket.priority}</span></span>
                    <span>预估：${this.escapeHtml(ticket.estimate)}</span>
                    <span>状态：${this.escapeHtml(ticket.status)}</span>
                    <span>负责人：${this.escapeHtml(ticket.assignee)}</span>
                </div>
                ${ticket.risks.length > 0 ? `
                    <div class="ticket-risks">
                        <strong>⚠️ 风险提示：</strong>
                        <ul>
                            ${ticket.risks.map(r => `<li>${this.escapeHtml(r)}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    filterTickets(filter) {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const ticketItems = document.querySelectorAll('.ticket-item');
        ticketItems.forEach(item => {
            if (filter === 'all' || item.dataset.type === filter) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    updateGeneratorReference() {
        const referenceBox = document.getElementById('generatorReference');
        
        if (this.projectData.prd) {
            const prd = this.projectData.prd;
            referenceBox.innerHTML = `
                <div class="reference-content">
                    <h4>📄 最终PRD摘要</h4>
                    <p><strong>名称：</strong>${this.escapeHtml(prd.metadata.name)}</p>
                    <p><strong>版本：</strong>${this.escapeHtml(prd.metadata.version)}</p>
                    <p><strong>负责人：</strong>${this.escapeHtml(prd.metadata.owner)}</p>
                    ${this.projectData.review ? `
                        <p><strong>评审问题：</strong>${this.projectData.review.questions.length} 个</p>
                        <p><strong>决策记录：</strong>${this.projectData.review.decisions.length} 条</p>
                    ` : ''}
                </div>
            `;
        }
    }

    clearGenerator() {
        document.getElementById('milestone1Date').value = '';
        document.getElementById('milestone2Date').value = '';
        
        document.getElementById('ticketList').innerHTML = `
            <div class="empty-state">
                <span>🎫</span>
                <p>工单将在这里生成</p>
            </div>
        `;

        this.projectData.tickets = [];
        this.showToast('已清空', 'success');
    }

    setupGlobalActions() {
        document.getElementById('newProjectBtn').addEventListener('click', () => this.newProject());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportReport());
    }

    newProject() {
        if (confirm('确定要新建项目吗？当前项目的所有数据将被清空。')) {
            this.projectData = {
                name: '新项目',
                status: '进行中',
                progress: 0,
                facts: [],
                pendingPoints: [],
                decisions: [],
                businessIntent: null,
                prd: null,
                review: null,
                tickets: []
            };
            
            this.clearRecorder();
            this.clearTranslator();
            this.clearWriter();
            this.clearReviewer();
            this.clearGenerator();
            
            this.updateProjectProgress(0);
            this.saveProjectData();
            this.showToast('新项目已创建', 'success');
        }
    }

    exportReport() {
        if (this.projectData.progress === 0) {
            this.showToast('请先完成项目处理', 'error');
            return;
        }

        const report = this.generateReport();
        this.downloadReport(report);
        this.showToast('报告导出成功', 'success');
    }

    generateReport() {
        const report = {
            project: this.projectData.name,
            generatedAt: new Date().toISOString(),
            summary: {
                factsCount: this.projectData.facts.length,
                pendingPointsCount: this.projectData.pendingPoints.length,
                decisionsCount: this.projectData.decisions.length,
                ticketsCount: this.projectData.tickets.length
            },
            details: this.projectData
        };

        return JSON.stringify(report, null, 2);
    }

    downloadReport(content) {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pm-agent-report-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    updateProjectProgress(progress) {
        this.projectData.progress = progress;
        document.getElementById('projectProgress').textContent = `${progress}%`;
        
        if (progress === 100) {
            this.projectData.status = '已完成';
            document.getElementById('projectStatus').textContent = '已完成';
        }
    }

    saveProjectData() {
        try {
            localStorage.setItem('pmAgentProject', JSON.stringify(this.projectData));
        } catch (error) {
            console.error('保存项目数据失败:', error);
        }
    }

    loadProjectData() {
        try {
            const stored = localStorage.getItem('pmAgentProject');
            if (stored) {
                const data = JSON.parse(stored);
                this.projectData = data;
                
                document.getElementById('projectName').textContent = data.name;
                document.getElementById('projectStatus').textContent = data.status;
                document.getElementById('projectProgress').textContent = `${data.progress}%`;
                
                if (data.facts.length > 0) {
                    this.displayRecorderResults({
                        facts: data.facts,
                        pendingPoints: data.pendingPoints,
                        decisions: data.decisions
                    });
                }
                
                if (data.businessIntent) {
                    this.displayTranslatorResults(data.businessIntent);
                    this.updateTranslatorReference();
                }
                
                if (data.prd) {
                    document.getElementById('prdName').value = data.prd.metadata.name;
                    document.getElementById('prdVersion').value = data.prd.metadata.version;
                    document.getElementById('prdOwner').value = data.prd.metadata.owner;
                    this.displayPRD(data.prd);
                    this.updateWriterReference();
                    this.updateReviewerReference();
                    this.updateGeneratorReference();
                }
                
                if (data.review) {
                    this.displayReviewResults(data.review);
                }
                
                if (data.tickets.length > 0) {
                    this.displayTickets(data.tickets);
                }
            }
        } catch (error) {
            console.error('加载项目数据失败:', error);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ProductManagerAgent();
});