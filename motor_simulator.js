class MotorSimulator {
    constructor() {
        this.motorLimits = {
            head: { min: -45, max: 45, maxSpeed: 180 },
            body: { min: -30, max: 30, maxSpeed: 120 },
            tail: { min: -60, max: 60, maxSpeed: 200 },
            ears: { min: -20, max: 20, maxSpeed: 150 }
        };

        this.pidParameters = {
            Kp: 0.8,
            Ki: 0.1,
            Kd: 0.2
        };

        this.thermalLimits = {
            warning: 60,
            critical: 80,
            shutdown: 100
        };

        this.currentTemperature = 25;
        this.collisionThreshold = 5;
    }

    simulate(motorParams) {
        const results = {
            trajectories: {},
            thermalAnalysis: {},
            collisionWarnings: [],
            safetyChecks: {},
            noiseRisk: 0,
            confidence: 1.0
        };

        for (const [motorName, params] of Object.entries(motorParams)) {
            const motorResult = this.simulateMotor(motorName, params);
            results.trajectories[motorName] = motorResult.trajectory;
            results.thermalAnalysis[motorName] = motorResult.thermal;
            
            if (motorResult.collision) {
                results.collisionWarnings.push({
                    motor: motorName,
                    position: motorResult.collision.position,
                    severity: motorResult.collision.severity
                });
                results.confidence *= 0.8;
            }

            results.safetyChecks[motorName] = motorResult.safety;
            results.noiseRisk = Math.max(results.noiseRisk, motorResult.noiseRisk);
        }

        results.overallSafety = this.calculateOverallSafety(results);
        results.recommendations = this.generateRecommendations(results);

        return results;
    }

    simulateMotor(motorName, params) {
        const limits = this.motorLimits[motorName];
        if (!limits) {
            return {
                trajectory: [],
                thermal: { temperature: 25, status: 'normal' },
                collision: null,
                safety: { valid: false, error: 'Unknown motor type' },
                noiseRisk: 0
            };
        }

        const trajectory = this.generateTrajectory(params, limits);
        const thermal = this.calculateThermalLoad(trajectory, params);
        const collision = this.checkCollision(trajectory, limits);
        const safety = this.validateSafety(params, limits);
        const noiseRisk = this.estimateNoiseRisk(params, trajectory);

        return {
            trajectory,
            thermal,
            collision,
            safety,
            noiseRisk
        };
    }

    generateTrajectory(params, limits) {
        const trajectory = [];
        const steps = 20;
        const duration = params.duration || 1000;
        const interval = duration / steps;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const position = this.calculatePosition(params, t, limits);
            const velocity = this.calculateVelocity(params, t, limits);
            const acceleration = this.calculateAcceleration(params, t, limits);

            trajectory.push({
                time: i * interval,
                position,
                velocity,
                acceleration,
                current: this.calculateCurrent(velocity, acceleration)
            });
        }

        return trajectory;
    }

    calculatePosition(params, t, limits) {
        const { startPosition, endPosition, curveType } = params;
        let position;

        switch (curveType) {
            case 'linear':
                position = startPosition + (endPosition - startPosition) * t;
                break;
            case 'easeIn':
                position = startPosition + (endPosition - startPosition) * t * t;
                break;
            case 'easeOut':
                position = startPosition + (endPosition - startPosition) * (1 - Math.pow(1 - t, 2));
                break;
            case 'easeInOut':
                position = startPosition + (endPosition - startPosition) * (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
                break;
            case 'bezier':
                position = this.calculateBezierPosition(params, t);
                break;
            default:
                position = startPosition + (endPosition - startPosition) * t;
        }

        return Math.max(limits.min, Math.min(limits.max, position));
    }

    calculateBezierPosition(params, t) {
        const { startPosition, endPosition, controlPoints = [] } = params;
        if (controlPoints.length === 0) {
            return startPosition + (endPosition - startPosition) * t;
        }

        const points = [startPosition, ...controlPoints, endPosition];
        return this.bezierInterpolation(points, t);
    }

    bezierInterpolation(points, t) {
        if (points.length === 1) return points[0];
        
        const newPoints = [];
        for (let i = 0; i < points.length - 1; i++) {
            newPoints.push(points[i] + (points[i + 1] - points[i]) * t);
        }
        
        return this.bezierInterpolation(newPoints, t);
    }

    calculateVelocity(params, t, limits) {
        const dt = 0.01;
        const position1 = this.calculatePosition(params, t, limits);
        const position2 = this.calculatePosition(params, t + dt, limits);
        return (position2 - position1) / dt;
    }

    calculateAcceleration(params, t, limits) {
        const dt = 0.01;
        const velocity1 = this.calculateVelocity(params, t, limits);
        const velocity2 = this.calculateVelocity(params, t + dt, limits);
        return (velocity2 - velocity1) / dt;
    }

    calculateCurrent(velocity, acceleration) {
        const torqueCoefficient = 0.1;
        const inertiaCoefficient = 0.05;
        return Math.abs(velocity * torqueCoefficient + acceleration * inertiaCoefficient);
    }

    calculateThermalLoad(trajectory, params) {
        let totalEnergy = 0;
        
        for (const point of trajectory) {
            const power = Math.pow(point.current, 2) * 0.5;
            totalEnergy += power * (point.time / 1000);
        }

        const temperatureIncrease = totalEnergy * 2.5;
        const finalTemperature = this.currentTemperature + temperatureIncrease;

        let status = 'normal';
        if (finalTemperature >= this.thermalLimits.shutdown) {
            status = 'critical';
        } else if (finalTemperature >= this.thermalLimits.critical) {
            status = 'warning';
        } else if (finalTemperature >= this.thermalLimits.warning) {
            status = 'caution';
        }

        return {
            temperature: finalTemperature,
            temperatureIncrease,
            status,
            energyConsumption: totalEnergy
        };
    }

    checkCollision(trajectory, limits) {
        for (const point of trajectory) {
            if (point.position <= limits.min + this.collisionThreshold) {
                return {
                    position: point.position,
                    severity: 'high',
                    message: `接近下限位: ${point.position}° (限制: ${limits.min}°)`
                };
            }
            if (point.position >= limits.max - this.collisionThreshold) {
                return {
                    position: point.position,
                    severity: 'high',
                    message: `接近上限位: ${point.position}° (限制: ${limits.max}°)`
                };
            }
        }
        return null;
    }

    validateSafety(params, limits) {
        const errors = [];
        const warnings = [];

        if (params.startPosition < limits.min || params.startPosition > limits.max) {
            errors.push(`起始位置超出范围: ${params.startPosition}°`);
        }

        if (params.endPosition < limits.min || params.endPosition > limits.max) {
            errors.push(`结束位置超出范围: ${params.endPosition}°`);
        }

        const maxSpeed = Math.abs(params.endPosition - params.startPosition) / (params.duration / 1000);
        if (maxSpeed > limits.maxSpeed) {
            warnings.push(`速度接近上限: ${maxSpeed.toFixed(1)}°/s (限制: ${limits.maxSpeed}°/s)`);
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    estimateNoiseRisk(params, trajectory) {
        let noiseRisk = 0;
        
        for (const point of trajectory) {
            if (Math.abs(point.velocity) > 100) {
                noiseRisk += 0.2;
            }
            if (Math.abs(point.acceleration) > 500) {
                noiseRisk += 0.3;
            }
        }

        return Math.min(1, noiseRisk);
    }

    calculateOverallSafety(results) {
        let safetyScore = 1.0;
        
        for (const warning of results.collisionWarnings) {
            if (warning.severity === 'high') {
                safetyScore *= 0.5;
            }
        }

        for (const [motorName, thermal] of Object.entries(results.thermalAnalysis)) {
            if (thermal.status === 'critical') {
                safetyScore *= 0.3;
            } else if (thermal.status === 'warning') {
                safetyScore *= 0.7;
            }
        }

        if (results.noiseRisk > 0.7) {
            safetyScore *= 0.8;
        }

        return {
            score: safetyScore,
            level: safetyScore > 0.8 ? 'safe' : safetyScore > 0.5 ? 'caution' : 'danger'
        };
    }

    generateRecommendations(results) {
        const recommendations = [];

        if (results.overallSafety.level === 'danger') {
            recommendations.push({
                type: 'critical',
                message: '检测到严重安全隐患，建议重新设计运动参数'
            });
        }

        for (const warning of results.collisionWarnings) {
            recommendations.push({
                type: 'safety',
                message: `马达 ${warning.motor} 存在碰撞风险: ${warning.message}`
            });
        }

        if (results.noiseRisk > 0.6) {
            recommendations.push({
                type: 'quality',
                message: '运动轨迹可能产生较大机械噪音，建议增加平滑处理'
            });
        }

        for (const [motorName, thermal] of Object.entries(results.thermalAnalysis)) {
            if (thermal.status !== 'normal') {
                recommendations.push({
                    type: 'thermal',
                    message: `马达 ${motorName} 温度预计达到 ${thermal.temperature.toFixed(1)}°C，状态: ${thermal.status}`
                });
            }
        }

        return recommendations;
    }

    generatePIDParameters(vat) {
        const { valence, arousal } = vat;
        
        return {
            Kp: this.pidParameters.Kp * (1 + Math.abs(valence) * 0.2),
            Ki: this.pidParameters.Ki * (1 + Math.abs(arousal) * 0.3),
            Kd: this.pidParameters.Kd * (1 + Math.abs(arousal) * 0.4),
            smoothing: Math.max(0.1, 1 - Math.abs(arousal) * 0.5)
        };
    }

    createBackup(originalParams) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupData = {
            timestamp,
            originalParams,
            backupId: `backup_${timestamp}`
        };
        return backupData;
    }
}