
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where, Timestamp, orderBy, limit } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

export interface Item {
  id?: string; // Firestore document ID
  userId: string;
  name: string;
  images: string[];
  description?: string;
  isGenerating?: boolean;
}

export interface Trader {
  name: string;
  signal: number;
}

export interface Announcement {
  id?: string;
  userId: string;
  email: string;
  text: string;
  image: string | null;
  imageHint: string | null;
  userType: 'trader' | 'system';
  timestamp: Timestamp;
}

// Represents the structure of a message in Genkit's history.
// It can be from a user, the model, or a tool.
export interface ChatMessage {
    id?: string;
    userId: string;
    role: 'user' | 'model' | 'tool';
    content: Array<{
        text?: string;
        // Tool-related fields, using 'any' for flexibility
        toolRequest?: any; 
        toolResponse?: any;
    }>;
    timestamp: Timestamp;
}


const traders: Trader[] = [
  { name: 'TRADER_ZERO', signal: 98 },
  { name: 'CYBER_NOMAD', signal: 76 },
  { name: 'GHOST_IN_THE_MACHINE', signal: 45 },
  { name: 'AGENT_SMITH', signal: 81 },
];

// --- Firestore Item Service ---

export const getItems = async (userId: string): Promise<Item[]> => {
    if (!isFirebaseConfigured || !db) return [];
    const itemsCol = collection(db, 'items');
    const q = query(itemsCol, where("userId", "==", userId));
    const itemSnapshot = await getDocs(q);
    const itemList = itemSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item));
    return itemList;
}

export const addItem = async (item: Omit<Item, 'id'>): Promise<string> => {
    if (!isFirebaseConfigured || !db) {
        console.log("Firebase not configured, item not added");
        return "mock-id";
    }
    const itemsCol = collection(db, 'items');
    const docRef = await addDoc(itemsCol, item);
    return docRef.id;
}

export const updateItemDescription = async (itemId: string, description: string) => {
    if (!isFirebaseConfigured || !db) return;
    const itemDoc = doc(db, 'items', itemId);
    await updateDoc(itemDoc, { description });
}

export const deleteItem = async (itemId: string) => {
    if (!isFirebaseConfigured || !db) return;
    const itemDoc = doc(db, 'items', itemId);
    await deleteDoc(itemDoc);
}

export const addImageToItem = async (itemId: string, imageUrl: string, currentImages: string[]) => {
    if (!isFirebaseConfigured || !db || currentImages.length >= 3) return;
    const itemDoc = doc(db, 'items', itemId);
    await updateDoc(itemDoc, {
        images: [...currentImages, imageUrl]
    });
}

// --- Firestore Announcement Service ---
export const addAnnouncement = async (announcement: Omit<Announcement, 'id'>) => {
  if (!isFirebaseConfigured || !db) {
    console.log("Firebase not configured, announcement not added");
    return;
  }
  const announcementsCol = collection(db, 'announcements');
  await addDoc(announcementsCol, announcement);
};

// --- Firestore Chat Message Service ---
export const addChatMessage = async (message: Omit<ChatMessage, 'id'>) => {
  if (!isFirebaseConfigured || !db) {
    console.log("Firebase not configured, chat message not added");
    return;
  }
  const chatCol = collection(db, 'chatHistory');
  await addDoc(chatCol, message);
};

export const getChatHistory = async (userId: string): Promise<ChatMessage[]> => {
    if (!isFirebaseConfigured || !db) return [];
    const chatCol = collection(db, 'chatHistory');
    // Get the last 20 messages to keep the context reasonable
    const q = query(chatCol, where("userId", "==", userId), orderBy("timestamp", "desc"), limit(20));
    const chatSnapshot = await getDocs(q);
    // Reverse the array to be in chronological order (asc)
    return chatSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)).reverse();
};


// --- Mock Data Fallbacks ---

export function getTraders(): Trader[] {
  // In the future, this will fetch from a database.
  return traders;
}
