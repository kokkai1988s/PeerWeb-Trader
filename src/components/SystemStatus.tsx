"use client";

import { useState, useEffect } from 'react';

export function SystemStatus() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTime(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const timerId = setInterval(updateTime, 1000);

    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="pixel-window">
      <h2 className="pixel-window-title">[ สถานะระบบ ]</h2>
      <div className="mt-4 space-y-1">
        <p>การเชื่อมต่อ: <span className="text-cyan-400">บลูทูธเมช</span></p>
        <p>การเข้ารหัส: <span className="text-cyan-400">AES-256</span></p>
        <p>โหนด: <span className="text-cyan-400">4</span></p>
        <p>เวลาปัจจุบัน: <span>{time}</span><span className="blinking-cursor">_</span></p>
      </div>
    </div>
  );
}
