
"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { Upload, WandSparkles, BrainCircuit, Loader2 } from 'lucide-react';
import { getItemDescription, identifyItemFromImage } from '@/app/actions';
import { addImageToItem, deleteItem, type Item } from '@/services/data-service';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import { db, isFirebaseConfigured } from '@/lib/firebase';

const ItemEntry = ({ item }: { item: Item }) => {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleDelete = async () => {
        if (!item.id) return;
        try {
            await deleteItem(item.id);
            toast({ title: "ไอเท็มถูกลบแล้ว" });
        } catch (error) {
            toast({ variant: "destructive", title: "ลบไอเท็มล้มเหลว" });
        }
    };

    const handleGenerateDescription = async () => {
        if (!item.id) return;
        setIsGenerating(true);
        await getItemDescription({ itemName: item.name, itemId: item.id });
        setIsGenerating(false);
        toast({ title: "สร้างคำอธิบายใหม่แล้ว" });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && item.id) {
            setIsUploading(true);
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = async () => {
                const imageUrl = reader.result as string;
                await addImageToItem(item.id!, imageUrl, item.images);
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-2">
            <div className="retro-list-item">
                <span className="font-bold">{item.name}</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleGenerateDescription}
                        disabled={isGenerating}
                        title="สร้างคำอธิบายไอเท็มแบบละเอียด"
                        className="pixel-button !p-1 !text-xs !shadow-none disabled:!transform-none disabled:!shadow-none flex items-center gap-1"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={12}/> : <WandSparkles size={12} />}
                        {isGenerating ? '...' : 'คำอธิบายเต็ม'}
                    </button>
                    <button onClick={handleDelete} className="delete-button" aria-label={`Delete ${item.name}`}>
                        X
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-4 gap-2 items-center">
                {item.images.map((src, imgIndex) => (
                    <Image key={imgIndex} src={src} alt={`${item.name} image ${imgIndex + 1}`} width={50} height={50} className="border border-primary object-cover" data-ai-hint="futuristic item" />
                ))}
                {isUploading && <Loader2 className="animate-spin" />}
                {item.images.length < 3 && !isUploading && (
                    <>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        <button onClick={triggerImageUpload} className="pixel-button !p-2 flex justify-center items-center w-full h-[52px]">
                            <Upload size={20} />
                        </button>
                    </>
                )}
            </div>
            {item.description && (
                <div className="text-sm p-2 bg-black/20 w-full text-foreground/80 italic">
                    <p>"{item.description}"</p>
                </div>
            )}
        </div>
    );
};

export function ItemInventory() {
    const { user, loading: userLoading } = useUser();
    const { toast } = useToast();
    const newItemFileInputRef = useRef<HTMLInputElement | null>(null);
    const [isIdentifying, setIsIdentifying] = useState(false);

    const itemsQuery = (isFirebaseConfigured && db && user) ? query(collection(db, 'items'), where('userId', '==', user.uid)) : null;
    const [itemsSnapshot, loading, error] = useCollection(itemsQuery);
    
    const items: Item[] = itemsSnapshot ? itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item)) : [];

    const handleIdentifyItem = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && user) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = async () => {
                const photoDataUri = reader.result as string;
                setIsIdentifying(true);
                toast({
                    title: "[ AI กำลังวิเคราะห์ ]",
                    description: "กำลังระบุไอเท็มจากรูปภาพ...",
                });

                const result = await identifyItemFromImage({ photoDataUri, userId: user.uid });
                
                setIsIdentifying(false);

                if (result.name === 'การระบุล้มเหลว') {
                     toast({
                        variant: "destructive",
                        title: "[ การวิเคราะห์ล้มเหลว ]",
                        description: result.description,
                    });
                } else {
                    toast({
                        title: "[ ระบุไอเท็มสำเร็จ ]",
                        description: `พบไอเท็มใหม่: ${result.name}`,
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const isLoading = userLoading || loading;

    return (
        <div className="pixel-window h-auto flex flex-col">
            <h2 className="pixel-window-title">[ คลังไอเท็ม ]</h2>
            <div id="inventory-list" className="mt-4 space-y-4 overflow-y-auto flex-grow pr-2 max-h-96">
                {isLoading && (
                    <div className="retro-list-item" style={{ color: 'hsl(var(--muted-foreground))', textShadow: 'none' }}>
                        กำลังโหลดคลัง...
                    </div>
                )}
                {!isLoading && items.length === 0 && !isIdentifying && (
                    <div className="retro-list-item" style={{ color: 'hsl(var(--muted-foreground))', textShadow: 'none' }}>
                        คลังว่างเปล่า...
                    </div>
                )}
                {error && <div className="text-destructive">Error: {error.message}</div>}
                {!isLoading && items.map((item) => (
                    <ItemEntry key={item.id} item={item} />
                ))}
                 {isIdentifying && (
                    <div className="flex items-center gap-2 text-amber-400">
                        <Loader2 className="animate-spin" size={16}/>
                        <span>กำลังวิเคราะห์...</span>
                    </div>
                )}
            </div>
            <div className="mt-4 pt-4 border-t-2 border-dashed" style={{ borderColor: 'hsl(var(--primary))' }}>
                <input
                    type="file"
                    accept="image/*"
                    ref={newItemFileInputRef}
                    onChange={handleIdentifyItem}
                    className="hidden"
                    disabled={isIdentifying || isLoading || !user}
                />
                <button
                    onClick={() => newItemFileInputRef.current?.click()}
                    disabled={isIdentifying || isLoading || !user}
                    className="pixel-button w-full flex items-center justify-center gap-2">
                    {isIdentifying ? <Loader2 className="animate-spin" /> : <BrainCircuit size={16} />}
                    {isIdentifying ? 'กำลังวิเคราะห์...' : 'วิเคราะห์ไอเท็มจากรูปภาพ'}
                </button>
            </div>
        </div>
    );
}
