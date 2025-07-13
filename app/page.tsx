import { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CPSCalculator() {
  const [balance, setBalance] = useState('');
  const [riskPercent, setRiskPercent] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [entryFee, setEntryFee] = useState('0.1');
  const [exitFee, setExitFee] = useState('0.1');
  const [result, setResult] = useState(null);
  const [livePrice, setLivePrice] = useState(null);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
      .then(res => res.json())
      .then(data => {
        if (data.bitcoin && data.bitcoin.usd) {
          setLivePrice(data.bitcoin.usd);
          setEntryPrice(data.bitcoin.usd.toString());
        }
      });
  }, []);

  const calculate = () => {
    const b = parseFloat(balance);
    const rp = parseFloat(riskPercent);
    const ep = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const ef = parseFloat(entryFee);
    const xf = parseFloat(exitFee);

    if (isNaN(b) || isNaN(rp) || isNaN(ep) || isNaN(sl) || ep === sl) {
      setResult({ error: "Please enter valid inputs." });
      return;
    }

    const riskAmount = b * (rp / 100);
    const riskPerCoin = Math.abs(ep - sl);
    const feePerCoin = ep * (ef + xf) / 100;
    const totalRiskPerCoin = riskPerCoin + feePerCoin;
    const coinSize = riskAmount / totalRiskPerCoin;
    const positionValue = coinSize * ep;

    setResult({ coinSize: coinSize.toFixed(6), positionValue: positionValue.toFixed(2) });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crypto Position Size Calculator</h1>
      {livePrice && (
        <div className="mb-4 text-center text-muted-foreground">
          <p>Live BTC/USD Price: <strong>${livePrice}</strong></p>
        </div>
      )}
      <Card className="mb-4">
        <CardContent className="space-y-4 py-4">
          <Input type="number" placeholder="Account Balance (e.g. 1000)" value={balance} onChange={e => setBalance(e.target.value)} />
          <Input type="number" placeholder="Risk % (e.g. 1.5)" value={riskPercent} onChange={e => setRiskPercent(e.target.value)} />
          <Input type="number" placeholder="Entry Price (auto from BTC/USD)" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} />
          <Input type="number" placeholder="Stop Loss Price (e.g. 19500)" value={stopLoss} onChange={e => setStopLoss(e.target.value)} />
          <Input type="number" placeholder="Entry Fee % (default 0.1)" value={entryFee} onChange={e => setEntryFee(e.target.value)} />
          <Input type="number" placeholder="Exit Fee % (default 0.1)" value={exitFee} onChange={e => setExitFee(e.target.value)} />
          <Button onClick={calculate} className="w-full">Calculate</Button>
        </CardContent>
      </Card>

      {result && (
        <div className="text-lg text-center bg-muted p-4 rounded-xl">
          {result.error ? (
            <p className="text-red-500">{result.error}</p>
          ) : (
            <>
              <p><strong>Position Size:</strong> {result.coinSize} coins</p>
              <p><strong>Position Value:</strong> ${result.positionValue}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
