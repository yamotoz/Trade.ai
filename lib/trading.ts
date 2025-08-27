import { useState, useEffect } from 'react';

// Dados mockados para demonstração
const mockTrades = [
  {
    id: '1',
    asset: { symbol: 'BTC' },
    side: 'buy',
    quantity: 0.1,
    price: 45000,
    pnl: 250,
    status: 'open'
  },
  {
    id: '2',
    asset: { symbol: 'ETH' },
    side: 'sell',
    quantity: 2,
    price: 3200,
    pnl: -80,
    status: 'closed'
  }
];

export function useTrades() {
  const [trades, setTrades] = useState(mockTrades);

  const openTrade = (data: any) => {
    const newTrade = {
      id: Date.now().toString(),
      asset: data.asset,
      side: data.side,
      quantity: data.quantity,
      price: data.price,
      pnl: 0,
      status: 'open'
    };
    setTrades(prev => [...prev, newTrade]);
  };

  const closeTrade = (tradeId: string) => {
    setTrades(prev => prev.map(trade => 
      trade.id === tradeId 
        ? { ...trade, status: 'closed' }
        : trade
    ));
  };

  return { trades, openTrade, closeTrade };
}
