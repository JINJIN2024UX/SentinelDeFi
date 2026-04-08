import { Evaluator, IAgentRuntime, Memory } from "@elizaos/core";

export const riskEvaluator: Evaluator = {
    name: "DEFI_RISK_EVALUATOR",
    description: "评估 MarginFi 仓位的财务与法律风险等级",
    
    // 🔍 验证逻辑：确保 message 和 content 存在，避免运行时崩溃
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        const text = (message.content as any)?.text?.toLowerCase() || "";
        return text.includes("marginfi") || text.includes("资产") || text.includes("风险");
    },

    // 🧠 核心评估逻辑
    handler: async (runtime: IAgentRuntime, message: Memory): Promise<any> => {
        const content = (message.content as any)?.text || "";
        
        // 解析健康因子数字
        const healthMatch = content.match(/健康因子[:\s]*([\d\.]+)/);
        const healthFactor = healthMatch ? parseFloat(healthMatch[1]) : 2.0;

        let riskStatus = "SAFE";
        let legalNote = "目前协议履行正常，无违约风险。";

        if (healthFactor < 1.1) {
            riskStatus = "CRITICAL";
            legalNote = "【法务警告】资产即将触发强制清算，建议立即采取保全措施。";
        } else if (healthFactor < 1.3) {
            riskStatus = "WARNING";
            legalNote = "【风险提示】市场波动可能导致抵押物不足，请关注补仓义务。";
        }

        // 构建结果，包含 Eliza 强制要求的 success 字段
        const evaluationResult = {
            success: true,
            target: "MarginFi_Account_9nme",
            health: healthFactor,
            status: riskStatus,
            legalAdvice: legalNote,
            timestamp: new Date().toISOString()
        };

        console.log("🧠 [RiskEvaluator] 评估完成:", evaluationResult);
        return evaluationResult;
    },

    // 范例部分直接设为 any 数组，彻底封印报错
    examples: [] as any[]
};