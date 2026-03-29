class LitoUI {
    constructor() {
        this.agent = new LitoAgent();
        this.currentResult = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupTabs();
        this.updateStatistics();
        this.setupProgressListener();
    }

    bindEvents() {
        document.getElementById('generateBtn').addEventListener('click', () => this.handleGenerate());
        document.getElementById('pauseBtn').addEventListener('click', () => this.handlePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.handleReset());
        
        document.getElementById('exportJSON').addEventListener('click', () => this.handleExport('json'));
        document.getElementById('exportCSV').addEventListener('click', () => this.handleExport('csv'));
        document.getElementById('exportTrae').addEventListener('click', () => this.handleExport('trae'));
        
        document.getElementById('dialogConfirm').addEventListener('click', () => this.handleDialogConfirm());
        document.getElementById('dialogCancel').addEventListener('click', () => this.hideDialog());
        document.getElementById('dialogClose').addEventListener('click', () => this.hideDialog());
        document.getElementById('dialogOverlay').addEventListener('click', () => this.hideDialog());
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });
    }

    setupProgressListener() {
        document.addEventListener('litoAgentProgress', (e) => {
            this.updateProgress(e.detail.progress);
        });
    }

    async handleGenerate() {
        const description = document.getElementById('behaviorDescription').value.trim();
        
        if (!description) {
            this.showNotification('请输入行为描述', 'error');
            return;
        }

        const options = {
            persona: document.getElementById('personaSelect').value,
            evolution: document.getElementById('enableEvolution').checked ? {
                daysRaised: parseInt(document.getElementById('evolutionDays').value) || 0
            } : null
        };

        this.setProcessingState(true);
        this.showProgressSection();

        try {
            const result = await this.agent.processRequest(description, options);
            
            if (result.success) {
                this.currentResult = result.data;
                this.displayResults(result.data);
                this.showNotification('行为参数生成成功！', 'success');
            } else {
                this.handleResultError(result);
            }
        } catch (error) {
            this.showNotification('处理过程中发生错误', 'error');
            console.error('Generation error:', error);
        } finally {
            this.setProcessingState(false);
            this.updateStatistics();
        }
    }

    handlePause() {
        const pauseResult = this.agent.pauseProcessing();
        
        if (pauseResult.success) {
            this.showNotification('处理已暂停', 'info');
            document.getElementById('pauseBtn').disabled = true;
        }
    }

    handleReset() {
        document.getElementById('behaviorDescription').value = '';
        document.getElementById('evolutionDays').value = '0';
        document.getElementById('enableEvolution').checked = false;
        document.getElementById('personaSelect').value = 'friendly';
        
        this.hideOutputSection();
        this.hideProgressSection();
        this.agent.reset();
        this.currentResult = null;
        
        this.showNotification('已重置', 'info');
    }

    handleExport(format) {
        if (!this.currentResult) {
            this.showNotification('没有可导出的数据', 'error');
            return;
        }

        let exportResult;
        
        switch (format) {
            case 'json':
                exportResult = this.agent.lereExporter.exportToJSON(this.currentResult.behavior);
                break;
            case 'csv':
                exportResult = this.agent.lereExporter.exportToCSV(this.currentResult.behavior);
                break;
            case 'trae':
                exportResult = this.agent.lereExporter.exportToTraeFormat(this.currentResult.behavior);
                break;
        }

        if (exportResult && exportResult.success) {
            this.downloadFile(exportResult.content, exportResult.filename);
            this.showExportPreview(exportResult.content);
            this.showNotification(`已导出 ${format.toUpperCase()} 文件`, 'success');
        }
    }

    downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showExportPreview(content) {
        const preview = document.getElementById('exportPreview');
        preview.textContent = content.substring(0, 1000) + (content.length > 1000 ? '...' : '');
    }

    handleResultError(result) {
        switch (result.status) {
            case 'terminated':
                this.showNotification(result.message, 'error');
                break;
            case 'paused':
            case 'low_confidence':
            case 'safety_pause':
                this.showDialog(result);
                break;
            case 'error':
                this.showNotification(result.message, 'error');
                break;
        }
    }

    showDialog(result) {
        const dialog = document.getElementById('dialogSection');
        const title = document.getElementById('dialogTitle');
        const message = document.getElementById('dialogMessage');
        const questions = document.getElementById('dialogQuestions');

        title.textContent = this.getDialogTitle(result.status);
        message.textContent = result.message;
        
        questions.innerHTML = '';
        if (result.questions && result.questions.length > 0) {
            result.questions.forEach(question => {
                const questionDiv = document.createElement('div');
                questionDiv.innerHTML = `
                    <label style="display: block; margin-bottom: 4px; font-weight: 500;">${question}</label>
                    <input type="text" class="dialog-input" placeholder="请输入您的回答">
                `;
                questions.appendChild(questionDiv);
            });
        }

        dialog.style.display = 'flex';
        
        const confirmBtn = document.getElementById('dialogConfirm');
        if (result.requiresConfirmation) {
            confirmBtn.textContent = '确认继续';
            confirmBtn.classList.remove('btn-secondary');
            confirmBtn.classList.add('btn-primary');
        } else {
            confirmBtn.textContent = '提交回答';
        }
    }

    hideDialog() {
        document.getElementById('dialogSection').style.display = 'none';
    }

    handleDialogConfirm() {
        const inputs = document.querySelectorAll('.dialog-input');
        const responses = Array.from(inputs).map(input => input.value.trim());
        
        this.hideDialog();
        
        if (responses.length > 0 && responses.every(r => r)) {
            const resumeResult = this.agent.resumeProcessing(responses);
            
            if (resumeResult.success) {
                this.currentResult = resumeResult.data;
                this.displayResults(resumeResult.data);
                this.showNotification('处理完成！', 'success');
            } else {
                this.handleResultError(resumeResult);
            }
        } else {
            this.showNotification('请回答所有问题', 'error');
        }
    }

    getDialogTitle(status) {
        const titles = {
            'paused': '需要更多信息',
            'low_confidence': '置信度较低',
            'safety_pause': '安全警告'
        };
        return titles[status] || '确认';
    }

    displayResults(data) {
        this.showOutputSection();
        this.displayVATResults(data.vat);
        this.displayMotorResults(data.motorParameters);
        this.displayAudioResults(data.audioParameters);
        this.displaySimulationResults(data.simulationResults, data.warnings);
    }

    displayVATResults(vat) {
        const valence = vat.valence || 0;
        const arousal = vat.arousal || 0;
        const confidence = (vat.confidence || 0) * 100;

        document.getElementById('valenceValue').textContent = valence.toFixed(2);
        document.getElementById('arousalValue').textContent = arousal.toFixed(2);
        document.getElementById('confidenceValue').textContent = `${confidence.toFixed(0)}%`;
        
        const valencePercent = ((valence + 1) / 2) * 100;
        const arousalPercent = ((arousal + 1) / 2) * 100;
        
        document.getElementById('valenceBar').style.left = `${valencePercent}%`;
        document.getElementById('arousalBar').style.left = `${arousalPercent}%`;
        
        const emotion = this.interpretEmotion(valence, arousal);
        document.getElementById('emotionInterpretation').textContent = emotion;
    }

    interpretEmotion(valence, arousal) {
        if (valence > 0.3 && arousal > 0.3) return '兴奋/开心';
        if (valence > 0.3 && arousal < -0.3) return '平静/满足';
        if (valence < -0.3 && arousal > 0.3) return '愤怒/焦虑';
        if (valence < -0.3 && arousal < -0.3) return '悲伤/沮丧';
        if (Math.abs(valence) < 0.3 && Math.abs(arousal) < 0.3) return '中性';
        return '混合情感';
    }

    displayMotorResults(motorParams) {
        const tbody = document.getElementById('motorTableBody');
        tbody.innerHTML = '';
        
        for (const [motorName, params] of Object.entries(motorParams)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${this.translateMotorName(motorName)}</strong></td>
                <td>${params.startPosition.toFixed(1)}°</td>
                <td>${params.endPosition.toFixed(1)}°</td>
                <td>${params.duration}ms</td>
                <td>${this.translateCurveType(params.curveType)}</td>
            `;
            tbody.appendChild(row);
        }
    }

    translateMotorName(name) {
        const translations = {
            'head': '头部',
            'body': '身体',
            'tail': '尾巴',
            'ears': '耳朵'
        };
        return translations[name] || name;
    }

    translateCurveType(type) {
        const translations = {
            'linear': '线性',
            'easeIn': '缓入',
            'easeOut': '缓出',
            'easeInOut': '缓入缓出',
            'bezier': '贝塞尔曲线'
        };
        return translations[type] || type;
    }

    displayAudioResults(audioParams) {
        if (!audioParams) return;
        
        document.getElementById('audioPitch').textContent = audioParams.pitch.toFixed(2);
        document.getElementById('audioVolume').textContent = audioParams.volume.toFixed(2);
        document.getElementById('audioDuration').textContent = `${audioParams.duration}ms`;
    }

    displaySimulationResults(simulationResults, warnings) {
        const safetyLevel = simulationResults.overallSafety?.level || 'unknown';
        const safetyElement = document.getElementById('safetyLevel');
        
        safetyElement.className = `safety-level ${safetyLevel}`;
        document.getElementById('safetyLevelValue').textContent = this.translateSafetyLevel(safetyLevel);
        
        const warningsList = document.getElementById('warningsList');
        warningsList.innerHTML = '';
        
        if (simulationResults.collisionWarnings && simulationResults.collisionWarnings.length > 0) {
            simulationResults.collisionWarnings.forEach(warning => {
                const warningDiv = document.createElement('div');
                warningDiv.className = 'warning-item';
                warningDiv.innerHTML = `<strong>${warning.motor}:</strong> ${warning.message}`;
                warningsList.appendChild(warningDiv);
            });
        }
        
        const recommendationsList = document.getElementById('recommendationsList');
        recommendationsList.innerHTML = '';
        
        if (warnings && warnings.length > 0) {
            warnings.forEach(warning => {
                const recDiv = document.createElement('div');
                recDiv.className = 'recommendation-item';
                recDiv.textContent = warning.message || warning;
                recommendationsList.appendChild(recDiv);
            });
        }
        
        if (simulationResults.recommendations && simulationResults.recommendations.length > 0) {
            simulationResults.recommendations.forEach(rec => {
                const recDiv = document.createElement('div');
                recDiv.className = 'recommendation-item';
                recDiv.textContent = rec.message;
                recommendationsList.appendChild(recDiv);
            });
        }
    }

    translateSafetyLevel(level) {
        const translations = {
            'safe': '安全',
            'caution': '警告',
            'danger': '危险',
            'unknown': '未知'
        };
        return translations[level] || level;
    }

    setProcessingState(isProcessing) {
        document.getElementById('generateBtn').disabled = isProcessing;
        document.getElementById('pauseBtn').disabled = !isProcessing;
        document.getElementById('agentStatus').textContent = isProcessing ? '处理中' : '就绪';
    }

    showProgressSection() {
        document.getElementById('progressSection').style.display = 'block';
    }

    hideProgressSection() {
        document.getElementById('progressSection').style.display = 'none';
        this.updateProgress(0);
    }

    updateProgress(progress) {
        document.getElementById('progressBar').style.width = `${progress}%`;
        document.getElementById('progressPercent').textContent = `${progress}%`;
        
        const messages = [
            '分析情感描述...',
            '计算VAT坐标...',
            '生成马达参数...',
            '配置音频参数...',
            '运行安全仿真...',
            '生成导出文件...'
        ];
        
        const messageIndex = Math.min(Math.floor(progress / 20), messages.length - 1);
        document.getElementById('progressText').textContent = messages[messageIndex];
    }

    showOutputSection() {
        document.getElementById('outputSection').style.display = 'block';
    }

    hideOutputSection() {
        document.getElementById('outputSection').style.display = 'none';
    }

    updateStatistics() {
        const stats = this.agent.getStatistics();
        
        document.getElementById('statCompleted').textContent = stats.tasksCompleted;
        document.getElementById('statPaused').textContent = stats.tasksPaused;
        document.getElementById('statSafety').textContent = stats.safetyTriggers;
        document.getElementById('statSuccessRate').textContent = `${(stats.successRate * 100).toFixed(0)}%`;
        document.getElementById('taskCount').textContent = stats.tasksCompleted;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    window.litoUI = new LitoUI();
});