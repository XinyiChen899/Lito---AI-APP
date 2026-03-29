class VATCalculator {
    constructor() {
        this.emotionKeywords = {
            valence: {
                positive: ['开心', '快乐', '兴奋', '高兴', '喜欢', '爱', '满足', '愉快', '幸福', '甜蜜', '温暖', '欣慰', '喜悦', '得意', '自豪'],
                negative: ['难过', '悲伤', '痛苦', '生气', '愤怒', '讨厌', '恨', '失望', '沮丧', '委屈', '害怕', '恐惧', '焦虑', '担心', '紧张']
            },
            arousal: {
                high: ['激动', '兴奋', '愤怒', '恐惧', '紧张', '狂喜', '暴怒', '惊恐', '急切', '冲动', '激烈'],
                low: ['平静', '放松', '困倦', '慵懒', '悠闲', '淡然', '安静', '温和', '舒适', '沉稳']
            }
        };
        
        this.baseVAT = { valence: 0, arousal: 0, time: 0 };
    }

    calculate(description) {
        const text = description.toLowerCase();
        let valence = 0;
        let arousal = 0;
        let confidence = 0;
        let matchedKeywords = [];

        for (const keyword of this.emotionKeywords.valence.positive) {
            if (text.includes(keyword)) {
                valence += 0.3;
                confidence += 0.1;
                matchedKeywords.push({ type: 'valence', value: keyword, direction: 'positive' });
            }
        }

        for (const keyword of this.emotionKeywords.valence.negative) {
            if (text.includes(keyword)) {
                valence -= 0.3;
                confidence += 0.1;
                matchedKeywords.push({ type: 'valence', value: keyword, direction: 'negative' });
            }
        }

        for (const keyword of this.emotionKeywords.arousal.high) {
            if (text.includes(keyword)) {
                arousal += 0.4;
                confidence += 0.1;
                matchedKeywords.push({ type: 'arousal', value: keyword, direction: 'high' });
            }
        }

        for (const keyword of this.emotionKeywords.arousal.low) {
            if (text.includes(keyword)) {
                arousal -= 0.4;
                confidence += 0.1;
                matchedKeywords.push({ type: 'arousal', value: keyword, direction: 'low' });
            }
        }

        const intensityPatterns = [
            { pattern: /非常|特别|极其|超级|格外/g, multiplier: 1.5 },
            { pattern: /有点|稍微|略微|比较/g, multiplier: 0.7 },
            { pattern: /最|极致/g, multiplier: 2.0 }
        ];

        for (const { pattern, multiplier } of intensityPatterns) {
            if (pattern.test(text)) {
                valence *= multiplier;
                arousal *= multiplier;
            }
        }

        valence = Math.max(-1, Math.min(1, valence));
        arousal = Math.max(-1, Math.min(1, arousal));
        confidence = Math.min(1, confidence);

        return {
            valence: valence,
            arousal: arousal,
            time: this.extractTimeDimension(text),
            confidence: confidence,
            matchedKeywords: matchedKeywords,
            warnings: this.generateWarnings(valence, arousal, confidence)
        };
    }

    extractTimeDimension(text) {
        const timePatterns = {
            immediate: ['立即', '马上', '瞬间', '立刻', '突然'],
            short: ['很快', '逐渐', '慢慢', '缓缓'],
            sustained: ['持续', '一直', '始终', '不断'],
            delayed: ['稍后', '过一会', '之后']
        };

        for (const [type, keywords] of Object.entries(timePatterns)) {
            for (const keyword of keywords) {
                if (text.includes(keyword)) {
                    return this.mapTimeToValue(type);
                }
            }
        }

        return 0;
    }

    mapTimeToValue(type) {
        const timeMapping = {
            immediate: 0.9,
            short: 0.5,
            sustained: 0.3,
            delayed: 0.1
        };
        return timeMapping[type] || 0;
    }

    generateWarnings(valence, arousal, confidence) {
        const warnings = [];

        if (confidence < 0.3) {
            warnings.push({
                type: 'low_confidence',
                message: '情感识别置信度较低，建议提供更具体的描述',
                severity: 'medium'
            });
        }

        if (Math.abs(valence) > 0.8 || Math.abs(arousal) > 0.8) {
            warnings.push({
                type: 'extreme_emotion',
                message: '检测到极端情感值，可能导致马达运动幅度过大',
                severity: 'high'
            });
        }

        return warnings;
    }

    calculateDelta(baseVAT, targetVAT) {
        return {
            valence: targetVAT.valence - baseVAT.valence,
            arousal: targetVAT.arousal - baseVAT.arousal,
            time: targetVAT.time - baseVAT.time
        };
    }

    validateVAT(vat) {
        const errors = [];

        if (vat.valence < -1 || vat.valence > 1) {
            errors.push('Valence值必须在-1到1之间');
        }

        if (vat.arousal < -1 || vat.arousal > 1) {
            errors.push('Arousal值必须在-1到1之间');
        }

        if (vat.time < 0 || vat.time > 1) {
            errors.push('Time值必须在0到1之间');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}