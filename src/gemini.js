import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);

export async function generateAIQuestions(role, mode, cvText = "") {
  try {
    const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite",
});

    const prompt = `
You are a professional interview coach.

Generate exactly 5 interview questions.

Role: ${role}
Interview Type: ${mode}

Resume Content:
${cvText}

Rules:
- Questions must be specific to the role.
- Use the resume information when possible.
- Return ONLY the questions.
- One question per line.
- No numbering.
`;

    const result = await model.generateContent(prompt);

    const text = result.response.text();

    return text
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 10)
      .slice(0, 5);
  } 
  catch (error) {
  console.error("Gemini Error:", error);

 return [
  `What technical skills are most important for a ${role}, and how have you used them?`,
  `Describe a project or experience that prepared you for a ${role}.`,
  `How would you solve a real-world problem related to ${role}?`,
  `What tools, frameworks, or methods would you use in this role?`,
  `How would you improve your performance and grow in this position?`
];
}
}
