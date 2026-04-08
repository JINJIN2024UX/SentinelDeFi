import { Plugin } from "@elizaos/core";
import { marginfiProvider } from "../providers/marginfi";
import { riskEvaluator } from "../evaluators/riskEvaluator";

// ✅ 将独立的组件封装成一个标准插件对象
export const sentinelPlugin: Plugin = {
    name: "plugin-sentinel-defi",
    description: "Professional Solana DeFi monitoring and risk auditing plugin. Features real-time asset tracking and legal-grade risk assessment.",
    
    // 👁️ 挂载眼睛 (数据源)
    providers: [marginfiProvider as any],
    
    // 🧠 挂载大脑 (风险逻辑)
    evaluators: [riskEvaluator as any],
    
    // 🥊 挂载动作 (未来可以添加：自动补仓、预警发推等)
    actions: [],
    
    // 服务扩展 (可选)
    services: []
};