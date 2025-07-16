
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';

import { AuraNetLogo } from '@/components/AuraNetLogo';
import { ItemInventory } from '@/components/ItemInventory';
import { NeighborDiscovery } from '@/components/NeighborDiscovery';
import { SystemStatus } from '@/components/SystemStatus';
import { PersonalAssistant } from '@/components/PersonalAssistant';
import Link from 'next/link';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { List, Users, Briefcase, Info, LogOut, Loader2, Send } from 'lucide-react';
import { addAnnouncement, type Announcement, type Item } from '@/services/data-service';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const BcGameIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0ZM25.48 24.38C26.1 23.79 26.43 22.98 26.43 22.1C26.43 21.01 25.99 20.08 25.21 19.34L19.22 13.9C18.45 13.19 17.5 12.8 16.5 12.8H12.57V27.2H16.5C17.5 27.2 18.45 26.81 19.22 26.1L25.48 24.38ZM19.64 19.86C19.9 20.1 20.04 20.45 20.04 20.83V22.1C20.04 22.48 19.9 22.83 19.64 23.07L16.5 25.89H15.1V14.11H16.5L19.64 16.94C19.9 17.18 20.04 17.52 20.04 17.9V19.17C20.04 19.41 19.83 19.69 19.64 19.86Z" fill="currentColor"/>
  </svg>
);


const NewAnnouncementDialog = () => {
    const { user } = useUser();
    const { toast } = useToast();
    const [text, setText] = useState('');
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const itemsQuery = (isFirebaseConfigured && db && user) ? query(collection(db, 'items'), where('userId', '==', user.uid)) : null;
    const [itemsSnapshot, loadingItems] = useCollection(itemsQuery);
    const items: Item[] = itemsSnapshot ? itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item)) : [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !user) return;

        setIsSubmitting(true);
        const selectedItem = items.find(item => item.id === selectedItemId);

        try {
            await addAnnouncement({
                text,
                userId: user.uid,
                email: user.email || 'anonymous',
                image: selectedItem?.images[0] || null,
                imageHint: 'item', // Generic hint for now
                userType: 'trader',
                timestamp: Timestamp.now(),
            });
            setText('');
            setSelectedItemId(null);
            toast({ title: "ประกาศถูกส่งแล้ว" });
            setIsOpen(false); // Close dialog on success
        } catch (err) {
            console.error(err);
            toast({ variant: "destructive", title: "ส่งประกาศล้มเหลว" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="pixel-button w-full"><Send size={16} /> สร้างประกาศใหม่</Button>
            </DialogTrigger>
            <DialogContent className="pixel-window !border-2 !border-primary">
                <DialogHeader>
                    <DialogTitle className="!text-amber-400">[ สร้างประกาศใหม่ ]</DialogTitle>
                </DialogHeader>
                <form method="POST" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="announcement-text" className="font-sans">ข้อความ</Label>
                        <Textarea
                            id="announcement-text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="พิมพ์ข้อความประกาศของคุณที่นี่..."
                            className="pixel-input mb-2"
                            rows={3}
                            disabled={isSubmitting}
                            required
                        />
                    </div>
                    <div>
                        <Label className="font-sans">แนบรูปไอเท็ม (ตัวเลือก)</Label>
                        {loadingItems ? (
                            <p className="text-sm text-muted-foreground">กำลังโหลดไอเท็ม...</p>
                        ) : items.length === 0 ? (
                             <p className="text-sm text-muted-foreground italic">คุณไม่มีไอเท็มในคลัง</p>
                        ) : (
                            <RadioGroup
                                value={selectedItemId || ''}
                                onValueChange={setSelectedItemId}
                                className="max-h-32 overflow-y-auto border border-primary/50 p-2 space-y-2"
                            >
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center space-x-2">
                                        <RadioGroupItem value={item.id!} id={item.id!} />
                                        <Label htmlFor={item.id!} className="flex items-center gap-2 cursor-pointer font-normal">
                                            <Image src={item.images[0]} alt={item.name} width={24} height={24} className="object-cover border border-primary/50"/>
                                            {item.name}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}
                    </div>
                    <Button type="submit" className="pixel-button w-full" disabled={isSubmitting || !text.trim()}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'ส่งประกาศ'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};


const AnnouncementBoard = () => {
  const announcementsQuery = isFirebaseConfigured && db ? query(collection(db, 'announcements'), orderBy('timestamp', 'desc')) : null;
  const [announcementsSnapshot, loading, error] = useCollection(announcementsQuery);

  const announcements: Announcement[] = announcementsSnapshot ? announcementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)) : [];

  return (
    <div className="pixel-window h-[30rem] flex flex-col">
      <h2 className="pixel-window-title">[ กระดานประกาศ ]</h2>
      <div className="mt-4 space-y-4 text-base overflow-y-auto h-full pr-2 flex flex-col flex-grow">
        {loading && <div className="text-center text-amber-400">กำลังโหลดประกาศ...</div>}
        {error && <div className="text-destructive">เกิดข้อผิดพลาด: {error.message}</div>}
        {!loading && announcements.map((ann) => (
          <div key={ann.id} className="flex items-start gap-3">
             <div className="w-[48px] h-[48px] border-2 border-primary flex-shrink-0 bg-black/20 flex items-center justify-center">
                {ann.image ? (
                  <Image src={ann.image} alt={ann.email} width={48} height={48} data-ai-hint={ann.imageHint || ''} className="object-cover" />
                ) : (
                   <span className="text-primary text-2xl font-bold">
                    {ann.email.charAt(0).toUpperCase()}
                   </span>
                )}
             </div>
            <p>
              <span className={ann.userType === 'trader' ? "text-amber-400" : "text-cyan-400"}>
                [{ann.email}]:
              </span> {ann.text}
            </p>
          </div>
        ))}
         {!loading && announcements.length === 0 && (
          <div className="text-center text-muted-foreground italic">ยังไม่มีประกาศ...</div>
        )}
      </div>
       <div className="mt-4 pt-4 border-t-2 border-dashed border-primary">
        <NewAnnouncementDialog />
      </div>
    </div>
  );
};

const AuraIdCard = () => {
  const { user, auth } = useUser();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
    }
    router.push('/auth/login');
  };

  return (
    <div className="pixel-window">
      <h2 className="pixel-window-title">[ ออร่า-ไอดี ]</h2>
      <div className="mt-4 space-y-1">
        <p className="break-all font-mono text-sm" title={user.uid}>ไอดี: {user.uid.substring(0, 20)}...</p>
        <p>อีเมล: <span className="text-cyan-400">{user.email}</span></p>
        <p>สถานะ: <span className="text-cyan-400">ออนไลน์</span></p>
        <Button onClick={handleLogout} className="pixel-button !p-1 !text-xs !shadow-none mt-2 w-full">
          <LogOut size={12} className="mr-1" />
          ออกจากระบบ
        </Button>
      </div>
    </div>
  )
}

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
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
    <main className="p-4 md:p-8">
      <div className="crt-screen max-w-7xl mx-auto">
        <header className="text-center mb-6 flex flex-col items-center">
          <AuraNetLogo />
          <h1 className="text-5xl tracking-widest font-mono">[ ออร่า-เน็ต ]</h1>
          <p className="text-lg text-amber-400 font-mono">// โปรโตคอลเทรดของแบบออฟไลน์ P2P //</p>
          <Link href="https://bcgame41.com/i-2dge354z-n/" target="_blank" className="text-cyan-400 underline flex items-center gap-2" style={{textShadow: '0 0 5px #00ffff'}}>
            <BcGameIcon className="inline-block text-cyan-400"/>
            <span className="font-mono">// เข้าสู่เว็บไซต์ //</span>
          </Link>
          <p className="text-sm text-cyan-400/80 mt-1 font-mono">// สามารถซื้อเหรียญคริปโตได้ที่ลิ้งนี้ //</p>
        </header>

        {/* Desktop Layout */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-4 gap-6 text-lg">
          {/* Column 1 */}
          <div className="lg:col-span-1 space-y-6">
            <AuraIdCard />
            <ItemInventory />
          </div>

          {/* Column 2 */}
          <div className="lg:col-span-2 space-y-6">
            <NeighborDiscovery />
            <PersonalAssistant />
          </div>

          {/* Column 3 */}
          <div className="lg:col-span-1 space-y-6">
            <AnnouncementBoard />
            <SystemStatus />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="block lg:hidden text-lg">
           <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="grid w-full grid-cols-4 pixel-button !p-0 !h-auto !bg-transparent !border-0">
              <TabsTrigger value="inventory" className="pixel-button !shadow-none !m-0 data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground flex-col h-16"><Briefcase size={20} /><span className="text-xs">คลัง</span></TabsTrigger>
              <TabsTrigger value="neighbors" className="pixel-button !shadow-none !m-0 data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground flex-col h-16"><Users size={20} /><span className="text-xs">เพื่อนบ้าน</span></TabsTrigger>
              <TabsTrigger value="announcements" className="pixel-button !shadow-none !m-0 data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground flex-col h-16"><List size={20} /><span className="text-xs">ประกาศ</span></TabsTrigger>
              <TabsTrigger value="status" className="pixel-button !shadow-none !m-0 data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground flex-col h-16"><Info size={20} /><span className="text-xs">สถานะ</span></TabsTrigger>
            </TabsList>

            <TabsContent value="inventory" className="mt-6 space-y-6">
              <AuraIdCard />
              <ItemInventory />
              <div className="p-4">
                <PersonalAssistant />
              </div>
            </TabsContent>
            <TabsContent value="neighbors" className="mt-6 space-y-6">
              <NeighborDiscovery />
            </TabsContent>
            <TabsContent value="announcements" className="mt-6 space-y-6">
               <AnnouncementBoard />
            </TabsContent>
            <TabsContent value="status" className="mt-6 space-y-6">
              <SystemStatus />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
