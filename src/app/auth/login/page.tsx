
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
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.62-4.55 1.62-3.87 0-7.02-3.22-7.02-7.2s3.15-7.2 7.02-7.2c2.2 0 3.68.86 4.5 1.62l2.85-2.78C19.11 2.5 16.2.5 12.48.5 5.8 0 0 5.6 0 12.3s5.8 12.3 12.48 12.3c7.2 0 12.12-4.92 12.12-12.02 0-.8-.08-1.54-.22-2.3H12.48z" fill="currentColor"/>
    </svg>
);


export default function LoginPage() {
  const { user, loading: userLoading, auth } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!userLoading && user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!auth) throw new Error("Auth service not available");
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: '[ การยืนยันสำเร็จ ]',
        description: `ยินดีต้อนรับกลับมา, กำลังนำทาง...`,
      });
      router.push('/');
    } catch (error: any) {
      console.error('Login Error:', error.code, error.message);
      let errorMessage = 'เกิดข้อผิดพลาดที่ไม่รู้จัก';
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
          errorMessage = 'ไม่พบบัญชีผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
          break;
        case 'auth/wrong-password':
          errorMessage = 'รหัสผ่านไม่ถูกต้อง';
          break;
        case 'auth/invalid-email':
          errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
          break;
        case 'auth/too-many-requests':
           errorMessage = 'ตรวจพบกิจกรรมที่ผิดปกติ บัญชีของคุณถูกระงับชั่วคราว';
           break;
        default:
           errorMessage = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง โปรดลองอีกครั้ง';
      }
      toast({
        variant: 'destructive',
        title: '[ การยืนยันล้มเหลว ]',
        description: errorMessage,
      });
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) {
        toast({ variant: 'destructive', title: '[ ข้อผิดพลาด ]', description: 'บริการยืนยันตัวตนไม่พร้อมใช้งาน' });
        return;
    }
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        toast({
            title: '[ การยืนยันสำเร็จ ]',
            description: 'ลงชื่อเข้าใช้ด้วย Google สำเร็จ!',
        });
        router.push('/');
    } catch (error: any) {
        console.error('Google Sign-In Error:', error);
        toast({
            variant: 'destructive',
            title: '[ ล็อกอิน Google ล้มเหลว ]',
            description: 'ไม่สามารถลงชื่อเข้าใช้ด้วย Google ได้ โปรดตรวจสอบการตั้งค่าหรือลองอีกครั้ง',
        });
    } finally {
        setGoogleLoading(false);
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
            <p className="text-md text-amber-400 font-mono">// ต้องการการยืนยันตัวตน //</p>
          </div>

          <div className="pixel-window">
            <h2 className="pixel-window-title">[ ล็อกอิน ]</h2>
            <div className="mt-4 space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
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
                    placeholder="********"
                    required
                    />
                </div>
                <Button type="submit" className="pixel-button w-full" disabled={loading || googleLoading}>
                    {loading ? 'กำลังโหลด...' : 'เข้าสู่ระบบ'}
                </Button>
                </form>
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-dashed border-primary/50"/>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground font-sans">
                        หรือดำเนินการต่อด้วย
                        </span>
                    </div>
                </div>
                <Button onClick={handleGoogleLogin} variant="outline" className="pixel-button !bg-transparent hover:!bg-accent/20 w-full" disabled={googleLoading || loading}>
                    {googleLoading ? <div className="animate-spin h-5 w-5 border-b-2 rounded-full"></div> : <GoogleIcon className="mr-2 h-5 w-5" />}
                    Google
                </Button>

                <div className="mt-4 text-center text-sm">
                    <p className="text-foreground/80 font-sans">
                    ยังไม่มีบัญชี?{' '}
                    <Link href="/auth/signup" className="underline text-cyan-400">
                        สร้างบัญชีที่นี่
                    </Link>
                    </p>
                </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
