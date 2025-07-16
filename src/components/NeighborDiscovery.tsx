"use client";

import { useState } from 'react';
import { TraderInfo } from './TraderInfo';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import { getTraders } from '@/services/data-service';

const traders = getTraders();

export function NeighborDiscovery() {
  const [selectedTrader, setSelectedTrader] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSelectTrader = (traderName: string) => {
    setSelectedTrader(prev => (prev === traderName ? null : traderName));
  };

  const handleTradeConfirm = () => {
    if (selectedTrader) {
      toast({
        title: "[ กำลังเชื่อมต่อ ]",
        description: `กำลังสร้างช่องทางที่ปลอดภัยกับ ${selectedTrader}...`,
      });
      // Reset selection after initiating trade
      setSelectedTrader(null);
    }
  };

  return (
    <div className="pixel-window h-full">
      <h2 className="pixel-window-title">[ เพื่อนบ้านในระยะ ]</h2>
      <div className="mt-4 flex flex-col justify-between h-full pb-8">
        <div>
          <p className="mb-2">กำลังค้นหาเพื่อนบ้านบนช่อง 7...</p>
          <ul className="space-y-2">
            {traders.map((trader) => (
              <TraderInfo 
                key={trader.name} 
                trader={trader}
                isSelected={selectedTrader === trader.name}
                onSelect={() => handleSelectTrader(trader.name)}
              />
            ))}
          </ul>
        </div>
        <div className="text-center mt-8">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="pixel-button" disabled={!selectedTrader}>
                เริ่มการเทรด
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="pixel-window !border-2 !border-primary">
              <AlertDialogHeader>
                <AlertDialogTitle className="!text-amber-400">[ ยืนยันการเทรด ]</AlertDialogTitle>
                <AlertDialogDescription className="!text-foreground/80" style={{textShadow: 'none'}}>
                  คุณต้องการเริ่มการเทรดกับ <span className="text-cyan-400">{selectedTrader}</span> หรือไม่? การดำเนินการนี้จะเปิดช่องทางสื่อสารที่ปลอดภัย
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <button className="pixel-button !bg-red-900/50 !border-red-500 hover:!bg-red-800/50">ยกเลิก</button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <button onClick={handleTradeConfirm} className="pixel-button">ยืนยัน</button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
