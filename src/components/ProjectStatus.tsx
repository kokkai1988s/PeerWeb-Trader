
'use client';

import { CheckCircle, XCircle, Radio } from 'lucide-react';

const StatusItem = ({ icon, text, status }: { icon: React.ReactNode, text: string, status: 'complete' | 'incomplete' | 'prototype' }) => {
  const statusColors = {
    complete: 'text-cyan-400',
    incomplete: 'text-yellow-400',
    prototype: 'text-foreground/70'
  };
  const statusIcons = {
    complete: <CheckCircle size={18} />,
    incomplete: <XCircle size={18} />,
    prototype: <Radio size={18} />
  }

  return (
    <li className={`flex items-center gap-3 ${statusColors[status]}`}>
      {statusIcons[status]}
      <span>{text}</span>
    </li>
  );
};

export function ProjectStatus() {
  return (
    <div className="pixel-window h-full">
      <h2 className="pixel-window-title">[ สถานะโปรเจกต์ ]</h2>
      <div className="mt-4 flex flex-col justify-between h-full pb-8 text-base space-y-4">
        <div>
          <p className="mb-2 underline">ส่วนที่สมบูรณ์ (Prototype):</p>
          <ul className="space-y-1 pl-2">
            <StatusItem icon={<CheckCircle size={18} />} text="แนวคิดและ UI หลัก" status="complete" />
            <StatusItem icon={<CheckCircle size={18} />} text="AI สร้างคำอธิบายไอเท็ม" status="complete" />
            <StatusItem icon={<CheckCircle size={18} />} text="AI วิเคราะห์ความน่าเชื่อถือ" status="complete" />
            <StatusItem icon={<CheckCircle size={18} />} text="การออกแบบสไตล์ Retro" status="complete" />
          </ul>
        </div>
        <div>
          <p className="mb-2 underline">สิ่งที่ต้องทำต่อ (Next Steps):</p>
          <ul className="space-y-1 pl-2">
            <StatusItem icon={<XCircle size={18} />} text="ระบบยืนยันตัวตน (Authentication) จริง" status="incomplete" />
            <StatusItem icon={<XCircle size={18} />} text="ฐานข้อมูล (Database) สำหรับผู้ใช้และไอเท็ม" status="incomplete" />
            <StatusItem icon={<XCircle size={18} />} text="ฟังก์ชันการเทรดจริง" status="incomplete" />
            <StatusItem icon={<XCircle size={18} />} text="ปรับปรุงให้รองรับมือถือ (Mobile Responsive)" status="incomplete" />
          </ul>
        </div>
      </div>
    </div>
  );
}
