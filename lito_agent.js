class LitoAgent {
    constructor() {
        this.vatCalculator = new VATCalculator();
        this.motorSimulator = new MotorSimulator();
        this.lereExporter = new LEREExporter();
        this.boundaryHandler = new BoundaryHandler();
        
        this.persona = {
            name: 'Lito',
            personality: 'friendly',
            consistency: 0.8,
            evolutionStage: 0,
            history: []
        };

        this.state = {
            currentTask: null,
            isProcessing: false,
            isPaused: false,
            progress: 0,
            generatedVAT: null
        };

        this.statistics = {
            tasksCompleted: 0,
            tasksPaused: 0,
            tasksTerminated: 0,
            safetyTriggers: 0,
            manualInterventions: 0
        };

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.isProcessing) {
                this.pauseProcessing();
            }
        });
    }

    async processRequest(userInput, options = {}) {
        this.state.currentTask = {
            input: userInput,
            options,
            startTime: Date.now(),
            status: 'processing'
        };

        this.state.isProcessing = true;
        this.state.isPaused = false;
        this.state.progress = 0;

        try {
            const ambiguityCheck = this.boundaryHandler.handleAmbiguity(userInput);
            if (ambiguityCheck.hasAmbiguity) {
                return this.handleAmbiguity(ambiguityCheck);
            }

            const riskCheck = this.boundaryHandler.checkRiskOperation(userInput);
            if (riskCheck.hasRisk) {
                return this.handleRiskOperation(riskCheck);
            }

            const decision = this.makeInitialDecision(userInput);
            
            if (decision.action === 'terminate') {
                return this.handleTermination(decision.reason);
            }

            if (decision.action === 'pause') {
                return this.handlePause(decision.reason, decision.questions);
            }

            return await this.executeProcessing(userInput, options);

        } catch (error) {
            return this.handleError(error);
        }
    }

    makeInitialDecision(userInput) {
        const lowerInput = userInput.toLowerCase();

        if (this.checkForIllegalContent(lowerInput)) {
            return {
                action: 'terminate',
                reason: '检测到非法内容，任务终止'
            };
        }

        if (!this.hasClearStimulus(lowerInput)) {
            return {
                action: 'pause',
                reason: '缺少明确的刺激源',
                questions: [
                    '请描述触发这个行为的具体刺激源是什么？',
                    '您希望Lito表现出什么样的情感倾向？'
                ]
            };
        }

        if (this.checkForCoreSystemModification(lowerInput)) {
            return {
                action: 'pause',
                reason: '涉及核心系统修改',
                questions: [
                    '此操作涉及底层系统修改，需要二次确认',
                    '是否确定要修改核心逻辑？'
                ]
            };
        }

        return {
            action: 'continue',
            reason: '输入符合处理条件'
        };
    }

    checkForIllegalContent(input) {
        const illegalKeywords = ['攻击', '暴力', '伤害', '破坏', '摧毁', '攻击性'];
        return illegalKeywords.some(keyword => input.includes(keyword));
    }

    hasClearStimulus(input) {
        const stimulusPatterns = [
            /当.*时|如果.*|看到.*|听到.*|摸.*|被.*|因为.*|由于.*/g
        ];
        return stimulusPatterns.some(pattern => pattern.test(input));
    }

    checkForCoreSystemModification(input) {
        const coreSystemKeywords = ['睡眠舱', '充电模式', '核心逻辑', '底层系统', '固件'];
        return coreSystemKeywords.some(keyword => input.includes(keyword));
    }

    async executeProcessing(userInput, options) {
        this.updateProgress(10);

        const vatResult = this.vatCalculator.calculate(userInput);
        this.state.generatedVAT = vatResult;
        this.updateProgress(30);

        if (vatResult.confidence < 0.3) {
            return this.handleLowConfidence(vatResult);
        }

        const motorParams = this.generateMotorParameters(vatResult, options);
        this.updateProgress(50);

        const audioParams = this.generateAudioParameters(vatResult, options);
        this.updateProgress(60);

        const simulationResult = this.motorSimulator.simulate(motorParams);
        this.updateProgress(80);

        const safetyDecision = this.makeSafetyDecision(simulationResult);
        
        if (safetyDecision.action === 'pause') {
            return this.handleSafetyPause(safetyDecision, {
                vatResult,
                motorParams,
                audioParams,
                simulationResult
            });
        }

        const behaviorData = this.compileBehaviorData(userInput, vatResult, motorParams, audioParams, simulationResult);
        this.updateProgress(90);

        const exportResult = this.lereExporter.exportToJSON(behaviorData, options);
        this.updateProgress(100);

        this.statistics.tasksCompleted++;
        this.updatePersonaHistory(behaviorData);

        return {
            success: true,
            status: 'completed',
            data: {
                behavior: behaviorData,
                export: exportResult,
                simulation: simulationResult,
                vat: vatResult
            },
            message: '行为参数生成完成'
        };
    }

    generateMotorParameters(vatResult, options) {
        const { valence, arousal } = vatResult;
        
        const baseParams = {
            head: {
                startPosition: 0,
                endPosition: this.calculateMotorAngle(valence, arousal, 'head'),
                duration: this.calculateDuration(arousal),
                curveType: this.selectCurveType(valence, arousal),
                maxSpeed: 180
            },
            body: {
                startPosition: 0,
                endPosition: this.calculateMotorAngle(valence, arousal, 'body'),
                duration: this.calculateDuration(arousal),
                curveType: this.selectCurveType(valence, arousal),
                maxSpeed: 120
            },
            tail: {
                startPosition: 0,
                endPosition: this.calculateMotorAngle(valence, arousal, 'tail'),
                duration: this.calculateDuration(arousal),
                curveType: this.selectCurveType(valence, arousal),
                maxSpeed: 200
            }
        };

        if (options.evolution) {
            this.applyEvolutionLogic(baseParams, options.evolution);
        }

        return baseParams;
    }

    calculateMotorAngle(valence, arousal, motorType) {
        const motorMultipliers = {
            head: { valence: 15, arousal: 10 },
            body: { valence: 10, arousal: 8 },
            tail: { valence: 20, arousal: 15 }
        };

        const multiplier = motorMultipliers[motorType];
        return (valence * multiplier.valence) + (arousal * multiplier.arousal);
    }

    calculateDuration(arousal) {
        const baseDuration = 1000;
        const arousalFactor = Math.abs(arousal) * 500;
        return Math.round(baseDuration + arousalFactor);
    }

    selectCurveType(valence, arousal) {
        if (Math.abs(arousal) > 0.6) {
            return 'easeInOut';
        } else if (valence > 0.3) {
            return 'easeOut';
        } else if (valence < -0.3) {
            return 'easeIn';
        }
        return 'linear';
    }

    generateAudioParameters(vatResult, options) {
        const { valence, arousal } = vatResult;
        
        return {
            pitch: 1.0 + (valence * 0.3) + (arousal * 0.2),
            volume: 0.6 + (Math.abs(arousal) * 0.4),
            duration: this.calculateDuration(arousal),
            fadeIn: 100,
            fadeOut: 100,
            triggers: ['behavior_start']
        };
    }

    applyEvolutionLogic(motorParams, evolution) {
        if (evolution.daysRaised > 100) {
            const attachmentBonus = evolution.daysRaised / 100 * 0.2;
            
            for (const motorName in motorParams) {
                motorParams[motorName].endPosition *= (1 + attachmentBonus);
                motorParams[motorName].duration *= (1 - attachmentBonus * 0.3);
            }
        }
    }

    makeSafetyDecision(simulationResult) {
        const { overallSafety, collisionWarnings } = simulationResult;

        if (overallSafety.level === 'danger') {
            return {
                action: 'pause',
                reason: '安全风险过高',
                requiresConfirmation: true,
                warnings: collisionWarnings
            };
        }

        if (overallSafety.level === 'caution') {
            return {
                action: 'continue',
                reason: '存在安全警告，但可继续',
                warnings: collisionWarnings
            };
        }

        return {
            action: 'continue',
            reason: '安全检查通过'
        };
    }

    compileBehaviorData(userInput, vatResult, motorParams, audioParams, simulationResult) {
        return {
            id: this.lereExporter.generateId(),
            name: this.extractBehaviorName(userInput),
            stimulus: userInput,
            vat: {
                valence: vatResult.valence,
                arousal: vatResult.arousal,
                time: vatResult.time
            },
            motorParameters: motorParams,
            audioParameters: audioParams,
            simulationResults: simulationResult,
            safetyLevel: simulationResult.overallSafety.level,
            confidence: vatResult.confidence,
            warnings: simulationResult.recommendations,
            evolution: this.persona.evolutionStage > 0 ? {
                stage: this.persona.evolutionStage,
                consistency: this.persona.consistency
            } : null
        };
    }

    extractBehaviorName(userInput) {
        const nameMatch = userInput.match(/设计.*?(?:反应|动作|行为)/);
        if (nameMatch) {
            return nameMatch[0].replace(/设计|反应|动作|行为/g, '').trim();
        }
        return 'Custom Behavior';
    }

    handleTermination(reason) {
        this.statistics.tasksTerminated++;
        this.state.isProcessing = false;

        return {
            success: false,
            status: 'terminated',
            message: reason,
            data: null
        };
    }

    handlePause(reason, questions) {
        this.statistics.tasksPaused++;
        this.state.isPaused = true;

        return {
            success: false,
            status: 'paused',
            message: reason,
            requiresUserInput: true,
            questions: questions || [],
            data: {
                vatProgress: this.state.generatedVAT
            }
        };
    }

    handleLowConfidence(vatResult) {
        return {
            success: false,
            status: 'low_confidence',
            message: '情感识别置信度较低',
            requiresUserInput: true,
            questions: [
                '请提供更具体的情感描述',
                '当前识别的情感倾向是否正确？'
            ],
            data: {
                vatResult,
                suggestions: vatResult.warnings
            }
        };
    }

    handleSafetyPause(safetyDecision, partialData) {
        this.statistics.safetyTriggers++;

        return {
            success: false,
            status: 'safety_pause',
            message: safetyDecision.reason,
            requiresConfirmation: safetyDecision.requiresConfirmation,
            warnings: safetyDecision.warnings,
            partialData: partialData,
            questions: [
                '检测到安全风险，是否继续？',
                '是否需要调整运动参数？'
            ]
        };
    }

    handleError(error) {
        console.error('LitoAgent error:', error);
        this.state.isProcessing = false;

        return {
            success: false,
            status: 'error',
            message: '处理过程中发生错误',
            error: error.message
        };
    }

    pauseProcessing() {
        if (this.state.isProcessing && !this.state.isPaused) {
            this.state.isPaused = true;
            this.statistics.manualInterventions++;

            return {
                success: true,
                status: 'paused',
                message: '处理已暂停',
                progress: this.state.progress,
                data: {
                    vatProgress: this.state.generatedVAT
                }
            };
        }
        return {
            success: false,
            message: '无法暂停当前处理'
        };
    }

    resumeProcessing(userResponses) {
        if (!this.state.isPaused) {
            return {
                success: false,
                message: '没有暂停的任务可以恢复'
            };
        }

        this.state.isPaused = false;
        this.state.currentTask.options.userResponses = userResponses;

        return this.executeProcessing(
            this.state.currentTask.input,
            this.state.currentTask.options
        );
    }

    updateProgress(progress) {
        this.state.progress = progress;
        this.notifyProgress(progress);
    }

    notifyProgress(progress) {
        const event = new CustomEvent('litoAgentProgress', {
            detail: { progress }
        });
        document.dispatchEvent(event);
    }

    updatePersonaHistory(behaviorData) {
        this.persona.history.push({
            timestamp: Date.now(),
            behavior: behaviorData.name,
            vat: behaviorData.vat
        });

        if (this.persona.history.length > 100) {
            this.persona.history.shift();
        }

        this.updatePersonaConsistency(behaviorData);
    }

    updatePersonaConsistency(newBehavior) {
        if (this.persona.history.length < 5) return;

        const recentBehaviors = this.persona.history.slice(-5);
        let totalVariance = 0;

        for (const behavior of recentBehaviors) {
            const variance = Math.abs(behavior.vat.valence - newBehavior.vat.valence) +
                           Math.abs(behavior.vat.arousal - newBehavior.vat.arousal);
            totalVariance += variance;
        }

        const averageVariance = totalVariance / recentBehaviors.length;
        
        if (averageVariance > 0.8) {
            this.persona.consistency *= 0.9;
        } else {
            this.persona.consistency = Math.min(1, this.persona.consistency + 0.01);
        }
    }

    checkPersonaDeviation(vat) {
        if (this.persona.history.length < 3) return false;

        const recentVats = this.persona.history.slice(-3).map(h => h.vat);
        const avgValence = recentVats.reduce((sum, v) => sum + v.valence, 0) / recentVats.length;
        const avgArousal = recentVats.reduce((sum, v) => sum + v.arousal, 0) / recentVats.length;

        const deviation = Math.abs(vat.valence - avgValence) + Math.abs(vat.arousal - avgArousal);
        return deviation > 0.8;
    }

    getStatistics() {
        return {
            ...this.statistics,
            successRate: this.statistics.tasksCompleted / 
                         (this.statistics.tasksCompleted + this.statistics.tasksTerminated) || 0,
            interventionRate: this.statistics.manualInterventions / 
                             (this.statistics.tasksCompleted + this.statistics.tasksPaused) || 0
        };
    }

    getPersona() {
        return {
            ...this.persona,
            consistencyScore: Math.round(this.persona.consistency * 100)
        };
    }

    handleAmbiguity(ambiguityCheck) {
        this.statistics.tasksPaused++;
        
        return {
            success: false,
            status: 'ambiguity_detected',
            message: '检测到模糊描述，需要澄清',
            requiresUserInput: true,
            ambiguities: ambiguityCheck.ambiguities,
            data: {
                clarificationNeeded: true
            }
        };
    }

    handleRiskOperation(riskCheck) {
        return {
            success: false,
            status: 'risk_operation',
            message: riskCheck.confirmationMessage,
            requiresConfirmation: true,
            risks: riskCheck.risks,
            data: {
                riskLevel: riskCheck.risks.some(r => r.severity === 'high') ? 'high' : 'medium'
            }
        };
    }

    reset() {
        this.state = {
            currentTask: null,
            isProcessing: false,
            isPaused: false,
            progress: 0,
            generatedVAT: null
        };
    }
}