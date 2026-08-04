"""Core data models for XAUUSDT Omniscient Scalper v14.0"""
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import json


class VoteDirection(Enum):
    LONG = "LONG"
    SHORT = "SHORT"
    NEUTRAL = "NEUTRAL"


class GateStatus(Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    PENDING = "PENDING"


class SignalQuality(Enum):
    EXCEPTIONAL = "EXCEPTIONAL"   # > 200
    EXCELLENT = "EXCELLENT"       # 150-200
    GOOD = "GOOD"                 # 100-150
    MODERATE = "MODERATE"         # 50-100
    POOR = "POOR"                 # < 50


class VolatilityRegime(Enum):
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    EXTREME = "EXTREME"


@dataclass
class MarketData:
    """Live market data from Binance"""
    symbol: str = "XAUUSDT"
    price: float = 0.0
    mark_price: float = 0.0
    index_price: float = 0.0
    bid: float = 0.0
    ask: float = 0.0
    bid_qty: float = 0.0
    ask_qty: float = 0.0
    spread: float = 0.0
    high_24h: float = 0.0
    low_24h: float = 0.0
    volume_24h: float = 0.0
    change_24h_pct: float = 0.0
    funding_rate: float = 0.0
    open_interest: float = 0.0
    ls_ratio: float = 0.0
    timestamp: datetime = field(default_factory=datetime.utcnow)


@dataclass
class Kline:
    """Single candlestick data"""
    open_time: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float
    close_time: datetime
    quote_volume: float
    trades: int
    taker_buy_volume: float
    taker_buy_quote_volume: float


@dataclass
class OrderBookLevel:
    price: float
    quantity: float


@dataclass
class OrderBook:
    bids: List[OrderBookLevel]
    asks: List[OrderBookLevel]
    timestamp: datetime = field(default_factory=datetime.utcnow)
    
    @property
    def spread(self) -> float:
        if self.bids and self.asks:
            return self.asks[0].price - self.bids[0].price
        return 0.0
    
    @property
    def imbalance_pct(self) -> float:
        bid_vol = sum(b.quantity for b in self.bids[:10])
        ask_vol = sum(a.quantity for a in self.asks[:10])
        total = bid_vol + ask_vol
        if total == 0:
            return 50.0
        return (bid_vol / total) * 100


@dataclass
class AgentVote:
    agent_id: str
    category: str
    direction: VoteDirection
    entry_price: float
    stop_loss: float
    take_profit: float
    confidence: float
    reasoning: str = ""


@dataclass
class GateResult:
    gate_id: int
    name: str
    status: GateStatus
    value: Any
    threshold: Any
    message: str = ""


@dataclass
class SignalParameters:
    direction: VoteDirection
    confidence: float
    entry_low: float
    entry_high: float
    ideal_entry: float
    stop_loss: float
    take_profit: float
    trail_trigger: float
    rr_ratio: float
    risk_pct: float
    position_size: float
    notional: float
    leverage: float
    max_drawdown_pct: float
    time_validity_minutes: int
    invalidation_price: float


@dataclass
class SwarmSignal:
    """Complete signal output from 500-agent swarm"""
    timestamp: datetime
    market_data: MarketData
    direction: VoteDirection
    confidence: float
    quality_score: float
    quality_tier: SignalQuality
    parameters: SignalParameters
    vote_breakdown: Dict[str, int]  # LONG, SHORT, NEUTRAL counts
    vote_percentages: Dict[str, float]
    top_categories: List[str]
    key_agents: List[str]
    gate_results: List[GateResult]
    rationale: str
    risk_warnings: List[str]
    
    def to_terminal_format(self) -> str:
        """Format as Bloomberg-style terminal output"""
        dir_emoji = "🟢" if self.direction == VoteDirection.LONG else "🔴"
        dir_text = self.direction.value
        
        long_count = self.vote_breakdown.get("LONG", 0)
        short_count = self.vote_breakdown.get("SHORT", 0)
        neutral_count = self.vote_breakdown.get("NEUTRAL", 0)
        
        gate_lines = []
        for gate in self.gate_results:
            status_icon = "✅" if gate.status == GateStatus.PASS else "❌"
            gate_lines.append(f"     Gate {gate.gate_id} ({gate.name}):    {status_icon} {gate.status.value}  ({gate.message})")
        
        return f"""╔══════════════════════════════════════════════════════════════════════════════╗
║     🏆 XAUUSDT PERPETUAL — OMNISCIENT SCALPER v14.0 — 500-AGENT SWARM      ║
║                    MAJORITY VOTE CONSENSUS SIGNAL                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  ⏱️  Timestamp: {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')} UTC                                   ║
║  💰  Live Price: ${self.market_data.price:,.2f} | Mark: ${self.market_data.mark_price:,.2f} | Idx: ${self.market_data.index_price:,.2f}    ║
║  📊  24h: ${self.market_data.high_24h:,.2f} / ${self.market_data.low_24h:,.2f} | Vol: {self.market_data.volume_24h:,.0f} | Chg: {self.market_data.change_24h_pct:+.2f}%               ║
║  ⚡  Funding: {self.market_data.funding_rate:.4%} | OI: {self.market_data.open_interest:,.0f} | L/S: {self.market_data.ls_ratio:.2f}      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  🎯 DIRECTION:     {dir_emoji} {dir_text}                                      ║
║  🧠 CONFIDENCE:    {self.confidence:.1f}%  ({long_count + short_count}/500 Agents Agree)                        ║
║  ⏳ TIMEFRAME:     15-MINUTE PRIMARY | 3-MINUTE EXECUTION                    ║
║  📈 QUALITY:       {int(self.quality_score)}/1000                                                ║
║                                                                              ║
║  ┌─────────────────────────────────────────────────────────────────────┐     ║
║  │  ENTRY ZONE:     ${self.parameters.entry_low:,.2f} — ${self.parameters.entry_high:,.2f}                       │     ║
║  │  IDEAL ENTRY:    ${self.parameters.ideal_entry:,.2f}  (limit order)             │     ║
║  │  🛑 STOP LOSS:   ${self.parameters.stop_loss:,.2f}  (1.5× ATR)                           │     ║
║  │  🎯 TAKE PROFIT: ${self.parameters.take_profit:,.2f}  (R:R = {self.parameters.rr_ratio:.2f}:1)                  │     ║
║  │  TRAIL TRIGGER:  ${self.parameters.trail_trigger:,.2f}  (activate at 2:1 R:R)              │     ║
║  └─────────────────────────────────────────────────────────────────────┘     ║
║                                                                              ║
║  📐 RISK PARAMETERS:                                                         ║
║     Risk per Trade:   {self.parameters.risk_pct:.1f}% equity                                          ║
║     Position Size:     {self.parameters.position_size:.4f} oz  (${self.parameters.notional:,.0f} notional)                   ║
║     Leverage:          {self.parameters.leverage:.1f}×                                                ║
║     Max Drawdown:      {self.parameters.max_drawdown_pct:.2f}%                                               ║
║     Time Validity:     {self.parameters.time_validity_minutes} minutes from signal                              ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  🗳️  AGENT VOTE BREAKDOWN:                                                  ║
║     🟢 LONG:     {long_count:3d} agents ({self.vote_percentages.get('LONG', 0):5.1f}%)                                     ║
║     🔴 SHORT:    {short_count:3d} agents ({self.vote_percentages.get('SHORT', 0):5.1f}%)                                     ║
║     ⚪ NEUTRAL:  {neutral_count:3d} agents  ({self.vote_percentages.get('NEUTRAL', 0):5.1f}%)                                     ║
║                                                                              ║
║     Top Contributing Categories: {', '.join(self.top_categories[:3])}...                  ║
║     Key Agents: {', '.join(self.key_agents[:3])}...                       ║
║                                                                              ║
║  🧮 GATE VALIDATION:                                                         ║
{chr(10).join(gate_lines)}
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  📋 EXECUTION CHECKLIST:                                                     ║
║  □ Set limit order at ${self.parameters.ideal_entry:,.2f}                                         ║
║  □ Hard stop at ${self.parameters.stop_loss:,.2f} — NO EXCEPTIONS                                 ║
║  □ Take profit at ${self.parameters.take_profit:,.2f}                                             ║
║  □ Trail stop to breakeven at ${self.parameters.trail_trigger:,.2f}                                 ║
║  □ Invalidation: 15m close beyond ${self.parameters.invalidation_price:,.2f}                      ║
║                                                                              ║
║  🗺️  KEY LEVELS:                                                             ║
║     Resistance:  ${self.market_data.price * 1.005:,.2f} │ ${self.market_data.price * 1.01:,.2f} │ ${self.market_data.price * 1.015:,.2f}                                       ║
║     Support:     ${self.market_data.price * 0.995:,.2f} │ ${self.market_data.price * 0.99:,.2f} │ ${self.market_data.price * 0.985:,.2f}                                       ║
║                                                                              ║
║  📝 RATIONALE (Agent Consensus):                                             ║
║  {self.rationale}     ║
║                                                                              ║
║  ⚠️  RISK WARNINGS:                                                          ║
{chr(10).join(f'  • {w}' for w in self.risk_warnings)}
║  • Honor the stop. Never average down.                                       ║
╚══════════════════════════════════════════════════════════════════════════════╝"""


@dataclass
class NoTradeSignal:
    """Output when no trade signal is generated"""
    timestamp: datetime
    market_data: MarketData
    vote_breakdown: Dict[str, int]
    vote_percentages: Dict[str, float]
    reason: str
    
    def to_terminal_format(self) -> str:
        long_count = self.vote_breakdown.get("LONG", 0)
        short_count = self.vote_breakdown.get("SHORT", 0)
        neutral_count = self.vote_breakdown.get("NEUTRAL", 0)
        
        return f"""╔══════════════════════════════════════════════════════════════════════════════╗
║     🏆 XAUUSDT PERPETUAL — OMNISCIENT SCALPER v14.0 — 500-AGENT SWARM      ║
║                         NO TRADE — AGENTS DIVIDED                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  ⏱️  Timestamp: {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')} UTC                                   ║
║  💰  Live Price: ${self.market_data.price:,.2f} | Mark: ${self.market_data.mark_price:,.2f} | Idx: ${self.market_data.index_price:,.2f}    ║
║  📊  24h: ${self.market_data.high_24h:,.2f} / ${self.market_data.low_24h:,.2f} | Vol: {self.market_data.volume_24h:,.0f} | Chg: {self.market_data.change_24h_pct:+.2f}%               ║
║  ⚡  Funding: {self.market_data.funding_rate:.4%} | OI: {self.market_data.open_interest:,.0f} | L/S: {self.market_data.ls_ratio:.2f}      ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  🗳️  AGENT VOTE BREAKDOWN:                                                  ║
║     🟢 LONG:     {long_count:3d} agents ({self.vote_percentages.get('LONG', 0):5.1f}%)                                     ║
║     🔴 SHORT:    {short_count:3d} agents ({self.vote_percentages.get('SHORT', 0):5.1f}%)                                     ║
║     ⚪ NEUTRAL:  {neutral_count:3d} agents  ({self.vote_percentages.get('NEUTRAL', 0):5.1f}%)                                     ║
║                                                                              ║
║  📝 REASON: {self.reason}                                             ║
║                                                                              ║
║  ⚠️  No majority consensus achieved. Minimum 251 agents required.           ║
║     Wait for clearer market structure or higher conviction setup.           ║
╚══════════════════════════════════════════════════════════════════════════════╝"""


@dataclass
class SystemStatus:
    """System health and status"""
    api_connected: bool = False
    ws_connected: bool = False
    data_fresh: bool = False
    agents_online: int = 0
    last_signal_time: Optional[datetime] = None
    current_bias: VoteDirection = VoteDirection.NEUTRAL
    atr_pct: float = 0.0
    volatility_regime: VolatilityRegime = VolatilityRegime.NORMAL
    gate_statuses: List[GateResult] = field(default_factory=list)
    uptime_seconds: int = 0
    errors: List[str] = field(default_factory=list)