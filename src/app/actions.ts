
'use server';

import {
  generateTraderTrustRating,
  type GenerateTraderTrustRatingInput,
  type GenerateTraderTrustRatingOutput,
} from '@/ai/flows/generate-trader-trust-rating';

import {
  generateItemDescription,
  type GenerateItemDescriptionInput,
  type GenerateItemDescriptionOutput,
} from '@/ai/flows/generate-item-description';

import {
  identifyItem,
  type IdentifyItemInput,
  type IdentifyItemOutput,
} from '@/ai/flows/identify-item';
  
import {
  getAssistantResponse,
  type PersonalAssistantInput,
  type PersonalAssistantOutput,
} from '@/ai/flows/personal-assistant';

import { addItem, updateItemDescription, type Item, addChatMessage, addAnnouncement } from '@/services/data-service';
import { Timestamp } from 'firebase/firestore';

export async function getTrustRating({
  traderName,
}: {
  traderName: string;
}): Promise<GenerateTraderTrustRatingOutput> {
  let input: GenerateTraderTrustRatingInput;

  // Mock data based on trader name
  switch (traderName) {
    case 'TRADER_ZERO':
      input = {
        transactionHistory:
          'Frequent, small-value trades. High completion rate of 99%. No disputes filed in the last 180 days.',
        networkActivity:
          'Stable connection, low latency. Actively participates in network routing. Online during standard cycle hours.',
        communityReports:
          "Overwhelmingly positive reports. Mentioned as a 'fair and reliable trader' multiple times across different network nodes.",
      };
      break;
    case 'CYBER_NOMAD':
      input = {
        transactionHistory:
          'Mix of small and medium-value trades. 95% completion rate. No disputes.',
        networkActivity:
          'Active daily, but occasionally drops connection. Participates in network routing.',
        communityReports:
          'Generally good reputation for selling rare and unique components, but some mention slow transaction times.',
      };
      break;
    case 'GHOST_IN_THE_MACHINE':
      input = {
        transactionHistory:
          'Infrequent, but very high-value trades. Several recently cancelled transactions without explanation. One dispute filed last week, currently unresolved.',
        networkActivity:
          'Highly unstable connection, frequent packet loss. Does not participate in network routing. Activity spikes at irregular, off-cycle hours.',
        communityReports:
          "Mixed reports. Some praise for rare items, but multiple recent reports flag this trader for 'unreliable communication' and 'changing trade terms at the last minute'.",
      };
      break;
    case 'AGENT_SMITH':
    default:
      input = {
        transactionHistory:
          'Moderate activity, primarily trading in standard-issue gear and common resources. 98% completion rate.',
        networkActivity:
          'Consistent and stable online presence. Standard network participation.',
        communityReports:
          'Neutral reports. Generally seen as a no-frills, by-the-book trader. No major complaints or outstanding praise.',
      };
      break;
  }

  // If no API key, return mock data to avoid crashing
  if (!process.env.GOOGLE_API_KEY) {
    console.warn('GOOGLE_API_KEY is not set. Returning mock trust rating.');
    const ratings: Record<string, GenerateTraderTrustRatingOutput> = {
      TRADER_ZERO: {
        trustRating: 95,
        explanation:
          'Highly reliable trader with excellent transaction history. (Mock Data)',
      },
      CYBER_NOMAD: {
        trustRating: 78,
        explanation: 'Good reputation but can be slow. (Mock Data)',
      },
      GHOST_IN_THE_MACHINE: {
        trustRating: 25,
        explanation: 'Unreliable and risky. Proceed with caution. (Mock Data)',
      },
      AGENT_SMITH: {
        trustRating: 82,
        explanation:
          'A standard, reliable trader with no major issues. (Mock Data)',
      },
    };
    return (
      ratings[traderName] || {
        trustRating: 82,
        explanation:
          'A standard, reliable trader with no major issues. (Mock Data)',
      }
    );
  }

  try {
    const result = await generateTraderTrustRating(input);
    return result;
  } catch (error) {
    console.error('AI trust rating failed:', error);
    // Return a default error structure that can be handled by the client
    return {
      trustRating: 0,
      explanation:
        'AI analysis failed. The network may be unstable or the AI core is offline.',
    };
  }
}

export async function getItemDescription(
  input: GenerateItemDescriptionInput & { itemId: string }
): Promise<GenerateItemDescriptionOutput> {
  let description = `A mock description for ${input.itemName}. The AI is offline. (Mock Data)`;

  if (process.env.GOOGLE_API_KEY) {
    try {
      const result = await generateItemDescription(input);
      description = result.description;
    } catch (error) {
      console.error('AI item description failed:', error);
      description = 'AI description generation failed. Please try again.';
    }
  } else {
    console.warn('GOOGLE_API_KEY is not set. Returning mock description.');
  }
  
  await updateItemDescription(input.itemId, description);

  return { description };
}

export async function identifyItemFromImage(
  input: IdentifyItemInput & { userId: string }
): Promise<IdentifyItemOutput> {
  if (!process.env.GOOGLE_API_KEY) {
    console.warn('GOOGLE_API_KEY is not set. Returning mock identification.');
    return {
      name: 'ไอเท็มปริศนา (AI ออฟไลน์)',
      description: 'นี่คือคำอธิบายจำลองเนื่องจาก AI Core ออฟไลน์อยู่',
    };
  }

  try {
    const result = await identifyItem(input);

    const newItem: Omit<Item, 'id'> = {
      userId: input.userId,
      name: result.name,
      description: result.description,
      images: [input.photoDataUri],
    };

    await addItem(newItem);
    
    return result;
  } catch (error) {
    console.error('AI item identification failed:', error);
    return {
      name: 'การระบุล้มเหลว',
      description: 'AI ไม่สามารถระบุไอเท็มจากรูปภาพได้ โปรดลองอีกครั้ง',
    };
  }
}

export async function callPersonalAssistant(
  input: PersonalAssistantInput & { userId: string }
): Promise<PersonalAssistantOutput> {
   if (!process.env.GOOGLE_API_KEY) {
    console.warn('GOOGLE_API_KEY is not set. Returning mock assistant response.');
    return {
      response: `ขออภัย, ${input.assistantName} ไม่สามารถเชื่อมต่อกับเครือข่ายได้ในขณะนี้ (AI Core ออฟไลน์)`,
    };
  }
  
  // Save user message to history
  await addChatMessage({
    userId: input.userId,
    role: 'user',
    content: [{text: input.message}],
    timestamp: Timestamp.now(),
  });

  try {
    const result = await getAssistantResponse(input);
    
    // Save AI response to history
    await addChatMessage({
      userId: input.userId,
      role: 'model',
      content: [{text: result.response}],
      timestamp: Timestamp.now(),
    });

    return result;
  } catch (error) {
    console.error('AI assistant call failed:', error);
    const errorResponse = {
      response: `เกิดข้อผิดพลาดในการเชื่อมต่อกับ ${input.assistantName} โปรดลองอีกครั้ง`,
    };

    // Save error response to history
    await addChatMessage({
        userId: input.userId,
        role: 'model',
        content: [{text: errorResponse.response}],
        timestamp: Timestamp.now(),
    });

    return errorResponse;
  }
}
