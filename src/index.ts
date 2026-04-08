// @ts-nocheck
import dotenv from "dotenv";
import { DirectClient } from "@elizaos/client-direct";
import { AgentRuntime, InMemoryDatabaseAdapter } from "@elizaos/core";
import { marginfiProvider } from "./providers/marginfi";
import { riskEvaluator } from "./evaluators/riskEvaluator";
import { sentinelPlugin } from "./plugins/sentinelPlugin";
import OpenAI from "openai";
import { legalSwapAction } from "./actions/legalSwap";

dotenv.config();

// 🛡️ 全局防崩溃护盾
process.on("unhandledRejection", (reason) => {
  console.error("🚨 捕获到未处理的异步拒绝:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("🚨 捕获到未处理的异常:", err.message);
});

async function startAgent() {
  console.log("------------------------------------------");
  console.log("🛡️ SentinelDeFi 哨兵系统：全量功能实时联动版...");

  process.env.ALLOW_NO_DATABASE = "true";

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const mockDb = new InMemoryDatabaseAdapter();

  const runtime: any = new AgentRuntime({
    name: "SentinelDeFi",
    modelProvider: "openai",
    token: process.env.OPENAI_API_KEY,
    character: {
      name: "SentinelDeFi",
      settings: { secrets: { OPENAI_API_KEY: process.env.OPENAI_API_KEY } },
      plugins: ["@elizaos/plugin-solana"],
    } as any,
    databaseAdapter: mockDb,
    actions: [legalSwapAction],
    plugins: [sentinelPlugin],
    providers: [marginfiProvider],
    evaluators: [riskEvaluator],
    cacheManager: {
      get: async () => null,
      set: async () => {},
      delete: async () => {},
    } as any,
  } as any);

  const MONITOR_SETTINGS = {
    intervalMinutes: 5,
    dangerZone: 1.2,
    chatId: "",
  };

  // ⚖️ 强制执法逻辑：确保 LEGAL_SWAP 拥有最高优先级
  runtime.registerAction(legalSwapAction);
  console.log("✅ [首席执行令]：LEGAL_SWAP 审计功能已强行加载，就绪挂载中...");

  try {
    await runtime.initialize();
    console.log("⏳ 核心协议已就绪，正在唤醒大脑...");

    let bot: any = null;

    const getLiveSolPrice = async (): Promise<number> => {
      const urls = [
        "https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112",
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
      ];
      for (const url of urls) {
        try {
          const response = await fetch(url, {
            signal: AbortSignal.timeout(5000),
          });
          if (!response.ok) continue;
          const data = await response.json();
          const price = data.data
            ? parseFloat(
                data.data["So11111111111111111111111111111111111111112"].price,
              )
            : data.solana.usd;
          if (price > 0) return price;
        } catch (e: any) {}
      }
      return 180;
    };

    // 1. ================== Telegram 交互逻辑 (修正版) ==================
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    if (telegramToken) {
      const { Telegraf } = await import("telegraf");
      bot = new Telegraf(telegramToken);

      bot.on("text", async (ctx: any, next: any) => {
        if (!MONITOR_SETTINGS.chatId) {
          MONITOR_SETTINGS.chatId = ctx.chat.id.toString();
          console.log(
            `✅ Alert recipient auto-linked: ${MONITOR_SETTINGS.chatId}`,
          );
        }

        const text = ctx.message.text.toLowerCase();
        if (text === "auto_check") return next();

        console.log(`📩 [TG Real-time Capture] User Message: "${text}"`);

        try {
          // 🚀 [关键分流逻辑]：检查是否为交易意图
          const swapKeywords = ["swap", "buy", "jup", "兑换", "交易"];
          if (swapKeywords.some((k) => text.includes(k))) {
            await ctx.reply(
              "⚖️ [Sentinel System Order]: Fetching Jupiter on-chain evidence for legal audit...",
            );

            // 强制调用 Jupiter 审计 Action
            await legalSwapAction.handler(
              runtime,
              { content: { text: ctx.message.text } },
              {},
              {},
              (res) => {
                ctx.reply(res.text);
              },
            );
            return; // ⚠️ 拦截后续逻辑，不再发资产报告
          }

          // 🛡️ 常规逻辑：发送资产深度研判报告
          await ctx.reply("🧠 Sentinel Brain is analyzing on-chain risk metrics...");
          const rawData = await marginfiProvider.get(runtime, {
            content: { text },
          } as any);
          const solPrice = await getLiveSolPrice();

          if (!rawData || rawData.length < 10) {
            await ctx.reply("🛰️ 链上取证异常，请稍后重试。");
            return;
          }

          // ... 原有代码 ...
          const completion = await openai.chat.completions.create({
            messages: [
              {
                role: "system",
                // ... 其他代码不变
                content: `你现在是 SentinelDeFi 首席风险官。
【当前市价】SOL: $${solPrice}。

任务：进行全资产穿透式风险审计。

⚠️ 必须严格遵守以下格式回复，不得遗漏任何项：

*[Sentinel Deep Audit Report]*

🛡️ Safety Rating: [A / B / C / ⚠️ CRITICAL]

📜 Portfolio Details：
   - 📥 Collateral：[Detail assets, specify SOL balance]
   - 📤 Debt：[If none, state "None (No active borrowing)"]

📊 Risk Metrics：Health Factor [If no debt, state "∞ (Debt-free, Absolute Safety)"]

💀 Liquidation Price：Current SOL price is $${solPrice.toFixed(2)}。
   - [If no debt]: Liquidation price is approx. $0.00 (No debt risk).
   - [If debt exists]: Liquidation price is approx. $[Calculated Value].

⚖️ Audit Opinion：[Analyze the safety profile of current asset distribution in English]

🛠️ Action Plan：[e.g., Status is healthy, no action needed; or suggest portfolio rebalancing in English]`,
              },
              {
                role: "user",
                content: `这是最新的链上原始卷宗：\n\n${rawData}`,
              },
            ],
            model: "gpt-4o",
          });
          const finalReport = completion.choices[0].message.content;

          // 📢 [极简终端提示]：不展示具体内容，只提示发送状态
          const timestamp = new Date().toLocaleTimeString();
          console.log(
            `[${timestamp}] ✅ Sentinel Deep-Dive Report created and pushed to Telegram.`,
          );

          // 🚀 关键：增加 parse_mode 确保加粗和分行有效
          await ctx.reply(`📊 ${completion.choices[0].message.content}`, {
            parse_mode: "Markdown",
          });
        } catch (e: any) {
          console.error("❌ 研判流异常:", e.message);
        }
      });

      bot.catch((err: any, ctx: any) => {
        console.error(
          `🛡️ Telegram 拦截异常 [Update ID: ${ctx.update.update_id}]:`,
          err.message,
        );
      });

      bot.launch().then(() => console.log("✅ Telegram 监听已开启！"));
    }

    // 2. ================== 自动巡检逻辑 ==================
    // 2. ================== 自动巡检逻辑 (弹性预警版) ==================
    const runAutoCheck = async () => {
      console.log("\n" + "=".repeat(45));
      console.log(`🛰️ [Sentinel ] ${new Date().toLocaleTimeString()}`);

      try {
        const solPrice = await getLiveSolPrice();
        const rawData = await marginfiProvider.get(runtime, {
          content: { text: "auto_check" },
        } as any);
        // 🚀 增加空值保护
        if (!rawData) {
          console.log("⚠️ 无法获取链上卷宗，本次巡检跳过。");
          return;
        }

        const healthMatch = rawData.match(
          /(?:健康因子|Health Factor)[:：*]*\s*([\d.]+)/i,
        );

        console.log(`💰 SOL Real-time Price: $${solPrice.toFixed(2)}`);

        if (healthMatch) {
          const health = parseFloat(healthMatch[1]);
          const liqPrice = (solPrice / health).toFixed(2);
          console.log(
            `📊 健康因子: ${health.toFixed(4)} | 💀 死亡价格: $${liqPrice}`,
          );

          // ⚖️ 弹性区间逻辑判定
          let alertType = "";
          let advice = "";

          if (health < 1.15) {
            alertType = "🔴 【红色·极其危险】账户即将被清算！";
            advice = "必须立即补充抵押品或偿还至少 50% 债务！";
          } else if (health < MONITOR_SETTINGS.dangerZone) {
            // 假设是 1.3
            alertType = "🟡 【黄色·风险预警】健康因子已进入黄色警戒区。";
            advice = "建议提前准备头寸，防止 SOL 剧烈波动。";
          }

          if (alertType && bot && MONITOR_SETTINGS.chatId) {
            const message =
              `${alertType}\n\n` +
              `📊 当前健康因子: *${health.toFixed(4)}*\n` +
              `💰 市场现价: *$${solPrice.toFixed(2)}*\n` +
              `🔥 死亡价格: *$${liqPrice}*\n\n` +
              `⚖️ 法律意见: ${advice}\n\n` +
              `🛠️ [快速响应入口]:\n` +
              `🔗 [前往 MarginFi 补仓](https://app.marginfi.com/)\n` +
              `🔗 [前往 Jupiter 兑换 USDC](https://jup.ag/swap/SOL-USDC)`;

            await bot.telegram.sendMessage(MONITOR_SETTINGS.chatId, message, {
              parse_mode: "Markdown",
              disable_web_page_preview: true, // 保持界面整洁
            });
            console.log(`📢 哨兵已下达警报：${alertType}`);
          } else {
            console.log("✅ 哨兵研判：目前暂无合规风险，继续保持监控。");
          }
        } else {
          console.log("ℹ️ Account Status: Debt-free operation.");
        }
      } catch (err: any) {
        console.error("❌ 巡检异常:", err.message);
      }
      console.log("=".repeat(45) + "\n");
    };
    runAutoCheck();
    setInterval(runAutoCheck, MONITOR_SETTINGS.intervalMinutes * 60 * 1000);

    // 3. ================== API 服务模块 ==================
    const client = new DirectClient();
    await (client as any).registerAgent(runtime);
    client.start(3001);

    console.log("------------------------------------------");
    console.log("✅Sentinel system logic restored. API/TG/Monitoring active in real-time (3000).");
  } catch (error: any) {
    console.error("❌ 致命错误:", error.message);
  }
}

startAgent();
