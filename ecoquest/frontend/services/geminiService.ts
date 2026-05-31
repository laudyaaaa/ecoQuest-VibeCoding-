import { GoogleGenAI, Type } from '@google/genai';
import { MissionData, OutcomeData, HeroType } from '../types';
import { HERO_TYPES } from '../constants';

const MODEL_NAME = 'gemini-2.5-flash';

// Lazy initialization to prevent errors if process.env is not immediately available on script load
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });
};

export const generateMission = async (
  playerName: string,
  heroType: HeroType,
  cityName: string
): Promise<MissionData> => {
  const ai = getAiClient();
  const heroInfo = HERO_TYPES[heroType];
  
  const prompt = `
    Kamu adalah Game Master untuk game RPG edukasi lingkungan bernama "EcoQuest".
    Pemain bernama "${playerName}" adalah seorang "${heroInfo.name}" yang fokus pada masalah: ${heroInfo.focus}.
    Saat ini pemain berada di kota ${cityName}, Indonesia.
    
    Buatkan sebuah misi lingkungan yang spesifik terjadi di ${cityName} yang relevan dengan keahlian karakter (${heroInfo.name}).
    
    Berikan:
    1. Cerita pengantar (2-3 paragraf pendek yang dramatis dan memotivasi).
    2. Tiga (3) pilihan aksi yang bisa dilakukan pemain. WAJIB terdiri dari:
       - 1 pilihan TERBAIK (solusi paling efektif dan berdampak jangka panjang)
       - 1 pilihan LUMAYAN (solusi cukup baik tapi kurang maksimal/jangka pendek)
       - 1 pilihan KURANG TEPAT (solusi buruk, tidak menyelesaikan masalah, atau memperparah)
       ACAK urutan pilihan ini (jangan selalu A yang terbaik). Pilihan harus realistis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            story: {
              type: Type.STRING,
              description: 'Cerita pengantar misi, 2-3 paragraf.',
            },
            choices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: 'ID unik singkat, misal A, B, C' },
                  text: { type: Type.STRING, description: 'Teks pilihan aksi' },
                },
              },
              description: 'Tiga pilihan aksi untuk pemain.',
            },
          },
          required: ['story', 'choices'],
        },
      },
    });

    if (!response.text) throw new Error("Empty response from AI");
    return JSON.parse(response.text) as MissionData;
  } catch (error) {
    console.error("Error generating mission:", error);
    // Fallback data in case of API failure
    return {
      story: `Terjadi gangguan komunikasi dengan markas pusat. Namun, masalah di ${cityName} tetap nyata. Sampah menumpuk dan warga butuh bantuanmu, ${playerName}!`,
      choices: [
        { id: 'A', text: 'Ajak warga gotong royong membersihkan area secara rutin.' },
        { id: 'B', text: 'Bersihkan area sendiri hari ini saja.' },
        { id: 'C', text: 'Abaikan dan tunggu pemerintah yang membersihkan.' }
      ]
    };
  }
};

export const generateOutcome = async (
  playerName: string,
  heroType: HeroType,
  cityName: string,
  missionStory: string,
  chosenAction: string
): Promise<OutcomeData> => {
  const ai = getAiClient();
  const prompt = `
    Pemain bernama "${playerName}" berada di ${cityName}.
    Konteks Misi: "${missionStory}"
    Aksi yang dipilih pemain: "${chosenAction}"
    
    Evaluasi pilihan aksi pemain tersebut. Tentukan apakah pilihan ini termasuk Terbaik, Lumayan, atau Kurang Tepat berdasarkan konteks misi.
    
    WAJIB berikan data berikut sesuai hasil evaluasi:
    - Jika Terbaik: label = "Pilihan Terbaik! ✅", xpChange = 150, ecoScoreChange = 15
    - Jika Lumayan: label = "Lumayan 👍", xpChange = 100, ecoScoreChange = 5
    - Jika Kurang Tepat: label = "Kurang Tepat ❌", xpChange = 50, ecoScoreChange = -10
    
    Berikan:
    1. label: Sesuai aturan di atas.
    2. outcomeStory: Cerita hasil dari aksi pemain (1-2 paragraf).
    3. explanation: Penjelasan singkat mengapa pilihan tersebut dinilai Terbaik/Lumayan/Kurang Tepat.
    4. xpChange: Angka pasti sesuai aturan di atas.
    5. ecoScoreChange: Angka pasti sesuai aturan di atas.
    6. fact: Satu fakta lingkungan nyata (1 kalimat) tentang Indonesia yang berkaitan dengan masalah di misi ini. Awali dengan "Tahukah kamu? ".
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, description: 'Label hasil evaluasi (Pilihan Terbaik! ✅ / Lumayan 👍 / Kurang Tepat ❌)' },
            outcomeStory: { type: Type.STRING, description: 'Cerita hasil dari aksi pemain.' },
            explanation: { type: Type.STRING, description: 'Penjelasan mengapa pilihan tersebut dinilai demikian.' },
            xpChange: { type: Type.NUMBER, description: 'XP yang didapat (150, 100, atau 50).' },
            ecoScoreChange: { type: Type.NUMBER, description: 'Perubahan EcoScore (15, 5, atau -10).' },
            fact: { type: Type.STRING, description: 'Fakta lingkungan nyata tentang Indonesia.' },
          },
          required: ['label', 'outcomeStory', 'explanation', 'xpChange', 'ecoScoreChange', 'fact'],
        },
      },
    });

    if (!response.text) throw new Error("Empty response from AI");
    return JSON.parse(response.text) as OutcomeData;
  } catch (error) {
    console.error("Error generating outcome:", error);
    return {
      label: "Lumayan 👍",
      outcomeStory: `Aksimu ("${chosenAction}") membawa perubahan. Pilihan ini cukup lumayan karena memberikan dampak positif jangka pendek.`,
      explanation: "Tindakan ini baik, namun kurang menyelesaikan akar permasalahan secara menyeluruh.",
      xpChange: 100,
      ecoScoreChange: 5,
      fact: "Tahukah kamu? Setiap tindakan kecil untuk lingkungan, jika dilakukan bersama-sama, akan memberikan dampak yang besar bagi bumi kita."
    };
  }
};
