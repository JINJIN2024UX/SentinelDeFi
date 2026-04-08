// @ts-nocheck
import { performLegalAudit } from "../jupiterAudit";
import { marginfiProvider } from "../providers/marginfi"; 

const fetchWithRetry = async (url: string, retries = 2) => {
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); 
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (err) {
            if (i === retries - 1) throw err;
            await new Promise(res => setTimeout(res, 1000));
        }
    }
};

export const legalSwapAction = {
    name: "LEGAL_SWAP",
    simulated: false,
    description: "Prioritize Jupiter transaction audit, fallback to portfolio risk report on failure",
    
    validate: async (runtime: any, message: any) => {
        const text = message.content.text.toLowerCase();
        return ["swap", "buy", "jup", "兑换"].some(k => text.includes(k));
    },

    handler: async (runtime: any, message: any, state: any, options: any, callback: any) => {
        const text = message.content.text.toLowerCase();
        
        // 1. Dynamic Amount Extraction
        const amountMatch = text.match(/(\d+(\.\d+)?)/);
        const userAmount = amountMatch ? parseFloat(amountMatch[0]) : 1; 
        const lamports = Math.floor(userAmount * 1e9); 

        if (callback) {
            callback({ text: `⚖️ [Sentinel] Executing cross-chain evidence collection for ${userAmount} SOL swap audit...` });
        }

        try {
            // 2. Real-time Evidence Acquisition (Jupiter V6)
            const apiUrl = `https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=JUPyiKdhb797ecnpbuyLRU9fm3fnrXjk2JpBzSsh68G&amount=${lamports}&slippageBps=50`;
            
            const jupQuote = await fetchWithRetry(apiUrl);

            // 3. Precision Adaptation (JUP/USDC 6, SOL 9)
            const outMint = jupQuote.outputMint;
            const decimals = (outMint.startsWith("EPj") || outMint.startsWith("JUP")) ? 1e6 : 1e9;
            const outAmountHuman = (parseInt(jupQuote.outAmount) / decimals).toFixed(2);

            // 4. Perform Legal/Safety Audit
            const auditResult = await performLegalAudit(jupQuote);

            let report = `📜 [SentinelDeFi × Jupiter Compliance Audit]\n`;
            report += `--------------------------------\n`;
            report += `📊 Audit Size: ${userAmount} SOL\n`;
            report += `💰 Expected: ${outAmountHuman} JUP\n`;
            report += `💸 Price Impact: ${jupQuote.priceImpactPct}%\n`;
            report += `--------------------------------\n`;
            report += auditResult.report + `\n\n`;
            report += auditResult.isSafe ? `✅ [PERMITTED] Audit Passed. Trade authorized.` : `🚫 [REJECTED] Risk Detected. Trade intercepted.`;

            if (callback) callback({ text: report });

        } catch (error) {
            // 🚀 5. Resilience Fallback: Swap audit fail -> Real-time Asset Audit
            console.error("❌ Audit node unreachable, switching to Portfolio Mode:", error.message);
            
            if (callback) {
                callback({ text: "⚠️ [Network Warning] Jupiter audit node unreachable. Switching to Emergency Portfolio Risk Assessment...\n" });
                
                const rawData = await marginfiProvider.get(runtime, message, state);
                
                let fallbackReport = `📊 *[SentinelDeFi On-chain Evidence]*\n`;
                fallbackReport += `------------------------------------------\n`;
                fallbackReport += rawData + `\n`;
                fallbackReport += `------------------------------------------\n`;
                fallbackReport += `💡 [Counsel Advice]: Swap rate unavailable due to network instability. However, your real-time health factor is verified. Prioritize asset safety above trade execution.`;
                
                callback({ text: fallbackReport });
            }
        }
        return true;
    },
    examples: [[{ user: "{{user1}}", content: { text: "swap 1 sol" } }, { user: "{{user2}}", content: { text: "⚖️ Auditing...", action: "LEGAL_SWAP" } }]]
};