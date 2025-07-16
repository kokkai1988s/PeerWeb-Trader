
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuraNetLogo } from '@/components/AuraNetLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function SignUpPage() {
  const { user, loading: userLoading, auth } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userLoading && user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: '[ ข้อผิดพลาด ]',
        description: 'รหัสผ่านไม่ตรงกัน',
      });
      return;
    }
    setLoading(true);

    try {
      if (!auth) throw new Error("Auth service not available");
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: '[ สร้างบัญชีสำเร็จ ]',
        description: `ยินดีต้อนรับ! กำลังนำทางไปยังหน้าหลัก...`,
      });
      router.push('/');
    } catch (error: any) {
      console.error('Sign Up Error:', error);
      let errorMessage = 'เกิดข้อผิดพลาดที่ไม่รู้จัก โปรดลองอีกครั้ง';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'อีเมลนี้ถูกใช้งานแล้ว';
          break;
        case 'auth/weak-password':
          errorMessage = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
          break;
        case 'auth/invalid-email':
          errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'การสร้างบัญชีด้วยวิธีนี้ไม่ได้รับอนุญาต';
          break;
        default:
          errorMessage = 'เกิดข้อผิดพลาดในการสร้างบัญชี โปรดตรวจสอบข้อมูลอีกครั้ง';
      }
      toast({
        variant: 'destructive',
        title: '[ สร้างบัญชีล้มเหลว ]',
        description: errorMessage,
      });
    } finally {
        setLoading(false);
    }
  };
  
  if (userLoading || user) {
     return (
       <main className="p-4 md:p-8 flex items-center justify-center min-h-screen">
          <div className="crt-screen max-w-md w-full mx-auto text-center">
            <h1 className="text-2xl">[ กำลังตรวจสอบสถานะ... ]</h1>
            <p className="text-amber-400">โปรดรอสักครู่</p>
          </div>
       </main>
    )
  }

  return (
    <>
      <video autoPlay muted loop id="login-video-background">
          <source src="https://cdn.pixabay.com/video/2023/10/24/185202-878873335_large.mp4" type="video/mp4" />
          Your browser does not support the video tag.
      </video>
      <main className="p-4 md:p-8 flex items-center justify-center min-h-screen">
        <div className="crt-screen max-w-md w-full mx-auto">
          <div className="flex flex-col items-center text-center mb-6">
            <AuraNetLogo />
            <h1 className="text-4xl tracking-widest font-mono">[ ออร่า-เน็ต ]</h1>
            <p className="text-md text-amber-400 font-mono">// สร้างบัญชีผู้ค้าใหม่ //</p>
          </div>

          <div className="pixel-window">
            <h2 className="pixel-window-title">[ สมัครสมาชิก ]</h2>
            <form onSubmit={handleSignUp} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="email" className="font-sans">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pixel-input"
                  placeholder="พิมพ์อีเมลของคุณ..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="font-sans">รหัสผ่าน</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pixel-input"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  required
                />
              </div>
               <div>
                <Label htmlFor="confirmPassword" className="font-sans">ยืนยันรหัสผ่าน</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pixel-input"
                  placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                  required
                />
              </div>
              <Button type="submit" className="pixel-button w-full" disabled={loading}>
                {loading ? 'กำลังสร้าง...' : 'ยืนยันการสร้างบัญชี'}
              </Button>
            </form>
             <div className="mt-4 text-center text-sm">
                <p className="text-foreground/80 font-sans">
                  มีบัญชีอยู่แล้ว?{' '}
                  <Link href="/auth/login" className="underline text-cyan-400">
                    เข้าสู่ระบบที่นี่
                  </Link>
                </p>
              </div>
          </div>
        </div>
      </main>
    </>
  );
}
