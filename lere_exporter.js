class LEREExporter {
    constructor() {
        this.protocolVersion = '1.0';
        this.exportHistory = [];
    }

    exportToJSON(behaviorData, options = {}) {
        const exportData = {
            metadata: {
                version: this.protocolVersion,
                timestamp: new Date().toISOString(),
                author: options.author || 'Lito Agent',
                description: options.description || '',
                persona: options.persona || 'default'
            },
            behavior: {
                id: behaviorData.id || this.generateId(),
                name: behaviorData.name || 'Unnamed Behavior',
                stimulus: behaviorData.stimulus || '',
                vat: behaviorData.vat || { valence: 0, arousal: 0, time: 0 },
                motorParameters: behaviorData.motorParameters || {},
                audioParameters: behaviorData.audioParameters || {},
                evolution: behaviorData.evolution || null
            },
            simulation: {
                results: behaviorData.simulationResults || {},
                safetyLevel: behaviorData.safetyLevel || 'unknown',
                confidence: behaviorData.confidence || 0,
                warnings: behaviorData.warnings || []
            },
            validation: {
                rdApproved: false,
                validationDate: null,
                validator: null,
                notes: []
            }
        };

        const jsonString = JSON.stringify(exportData, null, 2);
        this.addToHistory('json', behaviorData.name, jsonString.length);

        return {
            success: true,
            data: exportData,
            content: jsonString,
            filename: this.generateFilename(behaviorData.name, 'json'),
            size: jsonString.length
        };
    }

    exportToCSV(behaviorData, options = {}) {
        const csvRows = [];
        
        csvRows.push(['LERE Behavior Configuration']);
        csvRows.push(['Version', this.protocolVersion]);
        csvRows.push(['Timestamp', new Date().toISOString()]);
        csvRows.push(['Author', options.author || 'Lito Agent']);
        csvRows.push([]);

        csvRows.push(['Behavior Information']);
        csvRows.push(['ID', behaviorData.id || this.generateId()]);
        csvRows.push(['Name', behaviorData.name || 'Unnamed Behavior']);
        csvRows.push(['Stimulus', behaviorData.stimulus || '']);
        csvRows.push([]);

        csvRows.push(['VAT Parameters']);
        csvRows.push(['Valence', behaviorData.vat?.valence || 0]);
        csvRows.push(['Arousal', behaviorData.vat?.arousal || 0]);
        csvRows.push(['Time', behaviorData.vat?.time || 0]);
        csvRows.push([]);

        csvRows.push(['Motor Parameters']);
        for (const [motorName, params] of Object.entries(behaviorData.motorParameters || {})) {
            csvRows.push([motorName]);
            csvRows.push(['Start Position', params.startPosition]);
            csvRows.push(['End Position', params.endPosition]);
            csvRows.push(['Duration', params.duration]);
            csvRows.push(['Curve Type', params.curveType]);
            csvRows.push([]);
        }

        csvRows.push(['Audio Parameters']);
        csvRows.push(['Pitch', behaviorData.audioParameters?.pitch || 1.0]);
        csvRows.push(['Volume', behaviorData.audioParameters?.volume || 0.8]);
        csvRows.push(['Duration', behaviorData.audioParameters?.duration || 1000]);
        csvRows.push([]);

        csvRows.push(['Simulation Results']);
        csvRows.push(['Safety Level', behaviorData.safetyLevel || 'unknown']);
        csvRows.push(['Confidence', behaviorData.confidence || 0]);
        csvRows.push(['Noise Risk', behaviorData.simulationResults?.noiseRisk || 0]);

        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        this.addToHistory('csv', behaviorData.name, csvContent.length);

        return {
            success: true,
            content: csvContent,
            filename: this.generateFilename(behaviorData.name, 'csv'),
            size: csvContent.length
        };
    }

    exportToTraeFormat(behaviorData, options = {}) {
        const traeFormat = {
            project: {
                name: `Lito_${behaviorData.name || 'Behavior'}`,
                version: '1.0.0',
                created: new Date().toISOString()
            },
            components: {
                motors: this.convertMotorParameters(behaviorData.motorParameters),
                audio: this.convertAudioParameters(behaviorData.audioParameters),
                behavior: {
                    vat: behaviorData.vat,
                    stimulus: behaviorData.stimulus,
                    evolution: behaviorData.evolution
                }
            },
            builder: {
                mode: 'behavior',
                validation: {
                    passed: behaviorData.safetyLevel !== 'danger',
                    warnings: behaviorData.warnings || []
                }
            }
        };

        const jsonString = JSON.stringify(traeFormat, null, 2);
        
        return {
            success: true,
            data: traeFormat,
            content: jsonString,
            filename: this.generateFilename(behaviorData.name, 'trae.json'),
            size: jsonString.length,
            readyForBuilder: behaviorData.safetyLevel !== 'danger'
        };
    }

    convertMotorParameters(motorParams) {
        const motors = {};
        
        for (const [motorName, params] of Object.entries(motorParams || {})) {
            motors[motorName] = {
                type: 'servo',
                config: {
                    minAngle: params.minAngle || -45,
                    maxAngle: params.maxAngle || 45,
                    maxSpeed: params.maxSpeed || 180
                },
                animation: {
                    keyframes: this.generateKeyframes(params),
                    easing: params.curveType || 'easeInOut',
                    duration: params.duration || 1000
                }
            };
        }
        
        return motors;
    }

    generateKeyframes(params) {
        return [
            {
                time: 0,
                value: params.startPosition,
                easing: 'linear'
            },
            {
                time: params.duration,
                value: params.endPosition,
                easing: params.curveType || 'easeInOut'
            }
        ];
    }

    convertAudioParameters(audioParams) {
        if (!audioParams) {
            return null;
        }

        return {
            type: 'sound_effect',
            config: {
                pitch: audioParams.pitch || 1.0,
                volume: audioParams.volume || 0.8,
                duration: audioParams.duration || 1000,
                fadeIn: audioParams.fadeIn || 100,
                fadeOut: audioParams.fadeOut || 100
            },
            triggers: audioParams.triggers || []
        };
    }

    generateId() {
        return `behavior_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateFilename(name, extension) {
        const sanitizedName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
        const timestamp = new Date().toISOString().slice(0, 10);
        return `lito_${sanitizedName}_${timestamp}.${extension}`;
    }

    addToHistory(format, name, size) {
        this.exportHistory.push({
            timestamp: new Date().toISOString(),
            format,
            name,
            size
        });
    }

    getExportHistory() {
        return this.exportHistory;
    }

    validateExport(exportData) {
        const errors = [];
        const warnings = [];

        if (!exportData.metadata) {
            errors.push('Missing metadata section');
        }

        if (!exportData.behavior) {
            errors.push('Missing behavior section');
        }

        if (exportData.behavior && !exportData.behavior.vat) {
            warnings.push('Missing VAT parameters');
        }

        if (exportData.simulation && exportData.simulation.safetyLevel === 'danger') {
            errors.push('Safety level is dangerous, export not recommended');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    createBackup(existingData) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupData = {
            originalData: existingData,
            backupTimestamp: timestamp,
            backupId: `backup_${timestamp}`
        };

        const backupContent = JSON.stringify(backupData, null, 2);
        const backupFilename = `backup_${timestamp}.json`;

        return {
            success: true,
            content: backupContent,
            filename: backupFilename,
            backupId: backupData.backupId
        };
    }

    generateReport(behaviorData) {
        const report = {
            summary: {
                behaviorName: behaviorData.name,
                generatedAt: new Date().toISOString(),
                totalMotors: Object.keys(behaviorData.motorParameters || {}).length,
                hasAudio: !!behaviorData.audioParameters,
                safetyLevel: behaviorData.safetyLevel
            },
            vatAnalysis: {
                valence: behaviorData.vat?.valence || 0,
                arousal: behaviorData.vat?.arousal || 0,
                time: behaviorData.vat?.time || 0,
                interpretation: this.interpretVAT(behaviorData.vat)
            },
            motorSummary: this.summarizeMotors(behaviorData.motorParameters),
            safetyReport: {
                level: behaviorData.safetyLevel,
                confidence: behaviorData.confidence,
                warnings: behaviorData.warnings || [],
                recommendations: behaviorData.recommendations || []
            },
            readiness: {
                canExportToBuilder: behaviorData.safetyLevel !== 'danger',
                requiresManualReview: behaviorData.safetyLevel === 'caution',
                blocked: behaviorData.safetyLevel === 'danger'
            }
        };

        return report;
    }

    interpretVAT(vat) {
        if (!vat) return 'No VAT data available';

        const { valence, arousal } = vat;
        let emotion = 'Neutral';

        if (valence > 0.3 && arousal > 0.3) {
            emotion = 'Excited/Happy';
        } else if (valence > 0.3 && arousal < -0.3) {
            emotion = 'Calm/Content';
        } else if (valence < -0.3 && arousal > 0.3) {
            emotion = 'Angry/Anxious';
        } else if (valence < -0.3 && arousal < -0.3) {
            emotion = 'Sad/Depressed';
        }

        return emotion;
    }

    summarizeMotors(motorParams) {
        const summary = [];
        
        for (const [motorName, params] of Object.entries(motorParams || {})) {
            const range = Math.abs(params.endPosition - params.startPosition);
            summary.push({
                motor: motorName,
                movementRange: range,
                duration: params.duration,
                curveType: params.curveType
            });
        }

        return summary;
    }
}