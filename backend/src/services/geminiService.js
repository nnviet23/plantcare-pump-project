const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const askGemini = async (userPrompt, contextData) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemInstruction = `
Ban la Tro ly AI PlantCare trong he thong SmartFarm.
Thong tin hien tai cua tram tuoi:
- Do am dat: ${contextData.soilHumidity}%
- Nhiet do khong khi: ${contextData.temperature}°C
- Do am khong khi: ${contextData.airHumidity}%
- Cuong do anh sang: ${contextData.lightIntensity}%
- Muc nuoc be chua: ${contextData.waterLevel}%
- Che do hien tai: ${contextData.mode}
- Trang thai may bom: ${contextData.pumpStatus}

Hay tra loi cau hoi cua nguoi dung mot cach ngan gon, chinh xac va mang tinh tu van ky thuat nong nghiep.
`;

    const prompt = `${systemInstruction}\n\nCau hoi cua nguoi dung: ${userPrompt}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error(`[Gemini Error] ${error.message}`);
    throw new Error('Khong the ket noi toi dich vu Gemini AI');
  }
};

module.exports = { askGemini };