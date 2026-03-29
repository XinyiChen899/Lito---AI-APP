class BoundaryHandler {
    constructor() {
        this.ambiguousPatterns = {
            'force': {
                keywords: ['大力', '用力', '使劲'],
                questions: [
                    '您是指力量大（压敏传感器触发）还是幅度大（运动角度）？',
                    '请明确具体的力度需求'
                ]
            },
            'speed': {
                keywords: ['快一点', '慢一点'],
                questions: [
                    '您是指运动速度快还是反应时间短？',
                    '请提供具体的时间参数（毫秒）'
                ]
            },
            'direction': {
                keywords: ['这边', '那边', '往那边'],
                questions: [
                    '请明确具体的运动方向',
                    '使用上下左右等明确的方向描述'
                ]
            }
        };

        this.riskOperations = [
            '睡眠舱充电模式',
            '核心逻辑修改',
            '底层系统',
            '固件更新',
            '安全限位',
            '紧急停止'
        ];

        this.backupManager = new BackupManager();
        this.uncertaintyThreshold = 0.6;
    }

    handleAmbiguity(input) {
        const detectedAmbiguities = [];

        for (const [type, pattern] of Object.entries(this.ambiguousPatterns)) {
            for (const keyword of pattern.keywords) {
                if (input.toLowerCase().includes(keyword)) {
                    detectedAmbiguities.push({
                        type,
                        keyword,
                        questions: pattern.questions
                    });
                    break;
                }
            }
        }

        if (detectedAmbiguities.length > 0) {
            return {
                hasAmbiguity: true,
                ambiguities: detectedAmbiguities,
                requiresClarification: true
            };
        }

        return {
            hasAmbiguity: false,
            requiresClarification: false
        };
    }

    clarifyAmbiguity(ambiguityType, userResponse) {
        const clarificationMap = {
            'force': {
                '力量': { type: 'pressure', value: 0.8 },
                '幅度': { type: 'amplitude', value: 30 },
                '都': { type: 'both', pressure: 0.8, amplitude: 30 }
            },
            'speed': {
                '运动速度': { type: 'velocity', multiplier: 1.5 },
                '反应时间': { type: 'response', delay: 200 }
            },
            'direction': {
                '上': { type: 'absolute', direction: 'up' },
                '下': { type: 'absolute', direction: 'down' },
                '左': { type: 'absolute', direction: 'left' },
                '右': { type: 'absolute', direction: 'right' }
            }
        };

        return clarificationMap[ambiguityType]?.[userResponse] || null;
    }

    assessUncertainty(result) {
        const uncertaintyFactors = {
            confidence: result.confidence || 1,
            simulationRisk: result.simulationResults?.overallSafety?.score || 1,
            noiseRisk: result.simulationResults?.noiseRisk || 0,
            warningCount: (result.warnings || []).length
        };

        const uncertaintyScore = this.calculateUncertaintyScore(uncertaintyFactors);
        const uncertaintyLevel = this.getUncertaintyLevel(uncertaintyScore);

        return {
            score: uncertaintyScore,
            level: uncertaintyLevel,
            factors: uncertaintyFactors,
            requiresWarning: uncertaintyScore < this.uncertaintyThreshold,
            warningMessage: this.generateUncertaintyWarning(uncertaintyLevel, uncertaintyFactors)
        };
    }

    calculateUncertaintyScore(factors) {
        let score = factors.confidence;
        
        score *= factors.simulationRisk;
        
        if (factors.noiseRisk > 0.5) {
            score *= 0.8;
        }
        
        const warningPenalty = Math.min(0.3, factors.warningCount * 0.1);
        score -= warningPenalty;

        return Math.max(0, Math.min(1, score));
    }

    getUncertaintyLevel(score) {
        if (score >= 0.8) return 'high';
        if (score >= 0.6) return 'medium';
        return 'low';
    }

    generateUncertaintyWarning(level, factors) {
        const warnings = [];

        if (factors.confidence < 0.5) {
            warnings.push('情感识别置信度较低');
        }

        if (factors.noiseRisk > 0.6) {
            warnings.push('可能产生机械噪音');
        }

        if (factors.warningCount > 2) {
            warnings.push('存在多个安全警告');
        }

        if (warnings.length === 0) {
            return '结果具有一定的不确定性，建议人工复核';
        }

        return warnings.join('；') + '。建议人工复核。';
    }

    checkRiskOperation(input) {
        const detectedRisks = [];

        for (const riskOperation of this.riskOperations) {
            if (input.toLowerCase().includes(riskOperation.toLowerCase())) {
                detectedRisks.push({
                    operation: riskOperation,
                    severity: this.getRiskSeverity(riskOperation)
                });
            }
        }

        if (detectedRisks.length > 0) {
            return {
                hasRisk: true,
                risks: detectedRisks,
                requiresConfirmation: true,
                confirmationMessage: this.generateRiskConfirmation(detectedRisks)
            };
        }

        return {
            hasRisk: false,
            requiresConfirmation: false
        };
    }

    getRiskSeverity(operation) {
        const highRiskOps = ['安全限位', '紧急停止'];
        const mediumRiskOps = ['核心逻辑修改', '底层系统', '固件更新'];

        if (highRiskOps.includes(operation)) return 'high';
        if (mediumRiskOps.includes(operation)) return 'medium';
        return 'low';
    }

    generateRiskConfirmation(risks) {
        const riskDescriptions = risks.map(risk => {
            const severityText = {
                'high': '高风险',
                'medium': '中风险',
                'low': '低风险'
            };
            return `${risk.operation}（${severityText[risk.severity]}）`;
        });

        return `检测到风险操作：${riskDescriptions.join('、')}。此操作可能影响系统稳定性，需要二次确认。`;
    }

    handleUserInterruption(state, progress) {
        const interruptionData = {
            timestamp: Date.now(),
            progress: progress,
            state: state,
            canResume: true,
            resumeOptions: this.generateResumeOptions(progress)
        };

        return {
            success: true,
            message: '处理已暂停，可随时恢复',
            data: interruptionData
        };
    }

    generateResumeOptions(progress) {
        if (progress < 30) {
            return ['重新开始', '从VAT计算继续'];
        } else if (progress < 60) {
            return ['重新开始', '从参数生成继续'];
        } else if (progress < 90) {
            return ['重新开始', '从仿真校验继续'];
        } else {
            return ['重新开始', '完成当前任务'];
        }
    }

    async createBackupBeforeOperation(data, operationType) {
        try {
            const backup = await this.backupManager.createBackup(data, operationType);
            return {
                success: true,
                backupId: backup.id,
                message: `已创建备份: ${backup.id}`,
                backupLocation: backup.location
            };
        } catch (error) {
            return {
                success: false,
                message: `备份创建失败: ${error.message}`
            };
        }
    }

    async restoreBackup(backupId) {
        try {
            const restoredData = await this.backupManager.restoreBackup(backupId);
            return {
                success: true,
                data: restoredData,
                message: `已从备份恢复: ${backupId}`
            };
        } catch (error) {
            return {
                success: false,
                message: `备份恢复失败: ${error.message}`
            };
        }
    }

    validateOperationConstraints(operation, params) {
        const constraints = {
            motorAngle: { min: -90, max: 90 },
            duration: { min: 100, max: 10000 },
            speed: { min: 0, max: 360 },
            volume: { min: 0, max: 1 },
            pitch: { min: 0.5, max: 2 }
        };

        const violations = [];

        for (const [param, value] of Object.entries(params)) {
            if (constraints[param]) {
                const { min, max } = constraints[param];
                if (value < min || value > max) {
                    violations.push({
                        parameter: param,
                        value: value,
                        constraint: `${min} - ${max}`,
                        severity: this.getViolationSeverity(param, value, min, max)
                    });
                }
            }
        }

        return {
            valid: violations.length === 0,
            violations: violations,
            canProceed: violations.every(v => v.severity !== 'critical')
        };
    }

    getViolationSeverity(param, value, min, max) {
        const margin = Math.min(
            Math.abs(value - min),
            Math.abs(value - max)
        );

        if (margin < 0) return 'critical';
        if (margin < 5) return 'high';
        if (margin < 10) return 'medium';
        return 'low';
    }

    handlePersonaDeviation(currentVAT, personaHistory) {
        if (personaHistory.length < 3) {
            return {
                hasDeviation: false,
                deviationScore: 0
            };
        }

        const recentVATs = personaHistory.slice(-5);
        const avgValence = recentVATs.reduce((sum, h) => sum + h.vat.valence, 0) / recentVATs.length;
        const avgArousal = recentVATs.reduce((sum, h) => sum + h.vat.arousal, 0) / recentVATs.length;

        const valenceDeviation = Math.abs(currentVAT.valence - avgValence);
        const arousalDeviation = Math.abs(currentVAT.arousal - avgArousal);
        const totalDeviation = valenceDeviation + arousalDeviation;

        const deviationThreshold = 0.8;
        const hasDeviation = totalDeviation > deviationThreshold;

        return {
            hasDeviation,
            deviationScore: totalDeviation,
            threshold: deviationThreshold,
            valenceDeviation,
            arousalDeviation,
            requiresConfirmation: hasDeviation,
            message: hasDeviation 
                ? `当前行为与Lito性格偏离度: ${(totalDeviation * 100).toFixed(0)}%，超过阈值${(deviationThreshold * 100).toFixed(0)}%`
                : null
        };
    }

    generateFallbackResponse(errorType, context) {
        const fallbackResponses = {
            'semantic_error': {
                message: '无法理解情感描述，请使用更具体的词汇',
                suggestions: ['使用具体的情感词汇', '描述明确的触发场景', '避免模糊的表达']
            },
            'simulation_error': {
                message: '仿真校验失败，使用静态参数',
                suggestions: ['参数已简化', '建议人工复核', '可能影响动作流畅度']
            },
            'export_error': {
                message: '导出失败，请重试',
                suggestions: ['检查文件权限', '确保磁盘空间充足', '尝试其他格式']
            },
            'timeout': {
                message: '处理超时，已保存当前进度',
                suggestions: ['可以恢复处理', '检查网络连接', '减少复杂度']
            }
        };

        return fallbackResponses[errorType] || {
            message: '发生未知错误',
            suggestions: ['请重试', '联系技术支持']
        };
    }
}

class BackupManager {
    constructor() {
        this.backups = new Map();
        this.maxBackups = 10;
        this.backupInterval = 24 * 60 * 60 * 1000;
    }

    async createBackup(data, operationType) {
        const backupId = this.generateBackupId(operationType);
        const timestamp = Date.now();

        const backup = {
            id: backupId,
            timestamp,
            operationType,
            data: JSON.parse(JSON.stringify(data)),
            size: JSON.stringify(data).length
        };

        this.backups.set(backupId, backup);
        this.cleanupOldBackups();

        try {
            await this.saveToLocalStorage(backup);
            return {
                ...backup,
                location: 'localStorage',
                success: true
            };
        } catch (error) {
            console.warn('Local storage backup failed, using memory only:', error);
            return {
                ...backup,
                location: 'memory',
                success: true
            };
        }
    }

    async restoreBackup(backupId) {
        const backup = this.backups.get(backupId);
        
        if (!backup) {
            throw new Error(`Backup not found: ${backupId}`);
        }

        try {
            const storedBackup = await this.loadFromLocalStorage(backupId);
            return storedBackup.data;
        } catch (error) {
            console.warn('Local storage restore failed, using memory backup:', error);
            return JSON.parse(JSON.stringify(backup.data));
        }
    }

    generateBackupId(operationType) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const random = Math.random().toString(36).substr(2, 9);
        return `${operationType}_${timestamp}_${random}`;
    }

    async saveToLocalStorage(backup) {
        const key = `lito_backup_${backup.id}`;
        localStorage.setItem(key, JSON.stringify(backup));
    }

    async loadFromLocalStorage(backupId) {
        const key = `lito_backup_${backupId}`;
        const stored = localStorage.getItem(key);
        
        if (!stored) {
            throw new Error('Backup not found in localStorage');
        }

        return JSON.parse(stored);
    }

    cleanupOldBackups() {
        if (this.backups.size > this.maxBackups) {
            const sortedBackups = Array.from(this.backups.entries())
                .sort((a, b) => a[1].timestamp - b[1].timestamp);

            const toRemove = sortedBackups.slice(0, this.backups.size - this.maxBackups);
            
            for (const [backupId] of toRemove) {
                this.backups.delete(backupId);
                this.removeFromLocalStorage(backupId);
            }
        }
    }

    removeFromLocalStorage(backupId) {
        const key = `lito_backup_${backupId}`;
        localStorage.removeItem(key);
    }

    listBackups() {
        return Array.from(this.backups.values()).map(backup => ({
            id: backup.id,
            timestamp: new Date(backup.timestamp).toISOString(),
            operationType: backup.operationType,
            size: backup.size
        }));
    }

    deleteBackup(backupId) {
        this.backups.delete(backupId);
        this.removeFromLocalStorage(backupId);
    }
}