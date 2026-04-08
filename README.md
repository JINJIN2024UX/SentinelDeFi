🛡️ SentinelDeFi: The Legal-Tech Guardian for DeFi
"Code is Law, but Law needs a Sentinel."

SentinelDeFi is a sophisticated Compliance-First AI Agent built on the ElizaOS framework. It bridges the gap between high-speed DeFi execution and rigorous legal/risk auditing. Designed for the Nosana x ElizaOS Hackathon, it ensures that every swap and every position is scrutinized by a "Digital Chief Risk Officer" before it hits the blockchain.

⚖️ Why SentinelDeFi?
In the current DeFi landscape, users often trade "blindly," falling victim to MEV sandwich attacks, high price impact, or liquidation spirals. SentinelDeFi introduces a mandatory Pre-Execution Audit (PEA) layer, ensuring "Procedural Justice" for your on-chain assets.

🌟 Key Features
Mandatory Legal Audit (Action): Intercepts natural language swap intents (e.g., "Swap 1 SOL") and performs a real-time audit on Jupiter liquidity pools, price impact, and slippage risk before granting "Legal Clearance."

Elastic Safety Sentinel (Provider): A 24/7 background monitor that calculates your Liquidation Price and Health Factor on protocols like MarginFi.

Tiered Alert System: Real-time Telegram alerts with Elastic Buffers (Yellow for caution, Red for critical danger).

Industrial Resilience: Built-in fallback mechanism. If swap nodes are unreachable, Sentinel automatically pivots to an Emergency Portfolio Audit to prioritize asset safety.

Nosana-Ready: Extremely lightweight architecture optimized for decentralized compute nodes on the Nosana Network.

🛠️ Technical Architecture
SentinelDeFi leverages the modularity of ElizaOS to create a closed-loop compliance system:

Core: ElizaOS AgentRuntime

Intelligence: OpenAI GPT-4o

On-chain Connectivity: Solana Web3.js & Jupiter V6 API

Infrastructure: Bun Runtime & Nosana Compute Grid

Communication: Telegram Bot API

🚀 Quick Start
1. Prerequisites
Bun installed.

A Solana wallet with some SOL/USDC.

2. Installation
Bash
git clone https://github.com/your-username/SentinelDeFi.git
cd SentinelDeFi
bun install
3. Environment Setup
Copy the .env.example to .env and fill in your credentials:

Bash
cp .env.example .env
OPENAI_API_KEY: Your OpenAI API Key.

TELEGRAM_BOT_TOKEN: Your Telegram Bot Token.

SOLANA_PUBLIC_KEY: The wallet address you want to monitor.

SOLANA_RPC_URL: Your Solana RPC endpoint.

4. Run the Sentinel
Bash
bun start
🤖 Usage Examples
I. Real-time Risk Audit
User: "How are my assets looking?" Sentinel: Generates a Deep Audit Report including Collateral, Debt, Health Factor, and a precise Liquidation Price.

II. Compliant Swap Execution
User: "Swap 1.5 SOL to JUP" Sentinel: 1.  Intercepts the intent.
2.  Fetches live Jupiter evidence.
3.  Evaluates Price Impact and MEV risk.
4.  Returns a [PERMITTED] or [REJECTED] verdict with a detailed legal opinion.

🛡️ Security & Privacy
Non-Custodial: SentinelDeFi only monitors and audits; it does not hold your private keys (unless configured for auto-repay).

Privacy-Aware: Logs are de-identified to protect wallet addresses in public debug environments.

📜 License
Distributed under the MIT License. See LICENSE for more information.

Developed with ❤️ for the Nosana x ElizaOS Hackathon.