
"use client";

import { useState } from 'react';
import { getTrustRating } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import type { GenerateTraderTrustRatingOutput } from '@/ai/flows/generate-trader-trust-rating';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type Trader = {
  name: string;
  signal: number;
};

interface TraderInfoProps {
  trader: Trader;
  isSelected: boolean;
  onSelect: () => void;
}

export function TraderInfo({ trader, isSelected, onSelect }: TraderInfoProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<GenerateTraderTrustRatingOutput | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();
  
  const handleAnalysis = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent onSelect from being called
    setLoading(true);
    setAnalysis(null); // Clear previous analysis
    try {
      const result = await getTrustRating({ traderName: trader.name });
      setAnalysis(result);
      toast({
        title: `[${trader.name}] Trust Analysis`,
        description: (
          <div className="text-foreground/80" style={{ textShadow: 'none'}}>
            Rating: {result.trustRating}/100.
          </div>
        ),
        duration: 5000,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Analysis Failed",
        description: "Could not get trust rating.",
      });
    } finally {
      setLoading(false);
      setShowHistory(true); // Show details after analysis
    }
  };
  
  const isUnreliable = analysis ? analysis.trustRating < 50 : false;
  const statusClass = isUnreliable ? 'text-yellow-400' : '';

  return (
    <li 
      onClick={onSelect}
      className={cn(
        `retro-list-item flex-col items-start !items-start p-2 border border-dashed border-primary/20 cursor-pointer transition-all`,
        isSelected && 'border-solid !border-accent bg-accent/10',
      )}
    >
      <div className={`w-full flex justify-between items-center ${statusClass}`}>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowHistory(!showHistory);
            }} 
            className="flex items-center gap-1"
          >
            {showHistory ? <ChevronUp size={16}/> : <ChevronDown size={16} />}
            <span>{trader.name} (สัญญาณ: {trader.signal}%)</span>
          </button>
          {analysis && (
            <span className="font-bold">[{analysis.trustRating}/100]</span>
          )}
          {isUnreliable && (
            <span className="text-yellow-400"> - [!] ไม่น่าเชื่อถือ</span>
          )}
        </div>
        <button 
          onClick={handleAnalysis} 
          disabled={loading}
          className="pixel-button !p-1 !text-xs !shadow-none disabled:!transform-none disabled:!shadow-none"
        >
          {loading ? '...' : 'วิเคราะห์'}
        </button>
      </div>

      {showHistory && analysis && (
        <div className="mt-2 text-sm p-2 bg-black/20 w-full">
          <p className="font-bold underline">ประวัติ:</p>
          <p className="text-foreground/80">{analysis.explanation}</p>
        </div>
      )}
    </li>
  );
}
