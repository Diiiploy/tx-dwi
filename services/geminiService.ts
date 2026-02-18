
import { GoogleGenAI, Type } from "@google/genai";
import { Course, ScheduledClass, Message } from '../types';

let _ai: GoogleGenAI | null = null;
const getAI = (): GoogleGenAI => {
    if (!_ai) {
        const key = process.env.API_KEY;
        if (!key) throw new Error('API_KEY environment variable not set. Gemini features are unavailable.');
        _ai = new GoogleGenAI({ apiKey: key });
    }
    return _ai;
};

const getAIAnswer = (question: string): string => {
    const q = question.toLowerCase();
    if (q.includes('re-explain') || q.includes('concept')) {
        return "Certainly. The AI Avatar is currently discussing the concept of 'variable scope'. This means where a variable can be accessed or modified in your code.";
    }
    if (q.includes('break')) {
        return "Yes, we have scheduled breaks. Typically, there is a 10-minute break every hour.";
    }
    if (q.includes('homework') || q.includes('deadline')) {
        return "This week's homework (Module 2) is due this Friday at 11:59 PM. You can find it in your student portal.";
    }
    if (q.includes('work') || q.includes('job')) {
        return "To receive credit, you must be fully focused on the class. You cannot be working or distracted during the session.";
    }
    /* Fixed typo: changed q.car to q.includes('car') */
    if (q.includes('drive') || q.includes('driving') || q.includes('car')) {
        return "For safety and legal compliance, you CANNOT be driving during class. You must be in a stationary, safe location.";
    }
    if (q.includes('video') || q.includes('watch')) {
        return "You do not need to watch videos beforehand. We will watch all required course videos together during the live session.";
    }
    if (q.includes('hello') || q.includes('hi')) {
        return "Hello! How can I assist you with the course material?";
    }
    return "That's a great question. I am looking up the information... Please standby. (This is a demo answer. The AI would provide a full response here.)";
};

export const generateChatResponse = async (question: string, activeCourse: Course | null, language: 'en' | 'es' = 'en'): Promise<string> => {
    try {
        const languageInstruction = language === 'es' ? "Answer in Spanish." : "Answer in English.";

        const matchedRagQuestion = activeCourse?.ragQuestions?.find(rq => rq.question.toLowerCase() === question.toLowerCase());

        if (matchedRagQuestion) {
            const response = await getAI().models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Question: "${question}"`,
                config: {
                    systemInstruction: `You are an AI assistant for a DWI course. Answer the student's question based ONLY on the following context. Do not use any outside knowledge.\n\nContext:\n${matchedRagQuestion.context}\n\n${languageInstruction}`,
                },
            });
            return response.text;
        }

        if (question.toLowerCase().includes('break') || 
            question.toLowerCase().includes('work') || 
            question.toLowerCase().includes('drive') || 
            question.toLowerCase().includes('video') ||
            question.toLowerCase().includes('hello') || 
            question.toLowerCase().includes('hi')) {
            return getAIAnswer(question);
        }

        const response = await getAI().models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `A student asked: "${question}"`,
            config: {
                systemInstruction: `You are an AI assistant in a classroom. Provide a helpful and concise answer related to a typical DWI or Alcohol Education course. ${languageInstruction}`,
            },
        });
        
        return response.text;
    } catch (error) {
        console.error("Error generating chat response:", error);
        return language === 'es' 
            ? "Lo siento, tengo problemas para conectarme a mi base de conocimientos en este momento. Por favor inténtelo de nuevo en un momento."
            : "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
    }
};

export const generateAdCopy = async (courseName: string): Promise<{ headline: string; body: string; cta: string }> => {
    try {
        const response = await getAI().models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Create marketing copy for the course: ${courseName}`,
            config: {
                systemInstruction: "You are a professional marketing specialist for a court-mandated DWI school. Create a catchy headline, a short persuasive body (30 words), and a 3-word call to action. Return as JSON.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        headline: { type: Type.STRING },
                        body: { type: Type.STRING },
                        cta: { type: Type.STRING }
                    },
                    required: ["headline", "body", "cta"]
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (error) {
        return {
            headline: "State-Certified Education You Can Trust",
            body: "Fulfill your court requirements conveniently online with our licensed instructors. Fast certificate processing and professional support every step of the way.",
            cta: "Enroll Today"
        };
    }
}

export const generateSuggestedReplies = async (history: Message[]): Promise<string[]> => {
    try {
        const lastThreeMessages = history.slice(-3).map(m => `${m.isOutgoing ? 'Admin' : 'Student'}: ${m.text}`).join('\n');
        
        const response = await getAI().models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Conversation History:\n${lastThreeMessages}\n\nSuggest 3 short, professional replies for the Admin to send.`,
            config: {
                systemInstruction: "You are a professional administrative assistant for a state-certified alcohol education school. Provide 3 suggested replies based on the context. Return them as a JSON array of strings.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        return JSON.parse(response.text || '[]');
    } catch (error) {
        console.error("Error generating suggested replies:", error);
        return ["I've received your message and will look into this.", "Could you please provide more details?", "Thank you for letting us know."];
    }
}

export const generateWebsiteChatResponse = async (question: string, courses: Course[], history: { user: string, text: string }[]): Promise<string> => {
    try {
        const courseInfo = courses
            .filter(c => c.price > 0)
            .map(c => `- ${c.name}: ${c.description} Price: $${c.price}`)
            .join('\n');

        const formattedHistory = history.map(m => `${m.user === 'AI' ? 'AI' : 'User'}: ${m.text}`).join('\n');

        const fullPrompt = `
            History:
            ${formattedHistory}

            New Question: "${question}"
        `;

        const response = await getAI().models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: fullPrompt,
            config: {
                systemInstruction: `You are a friendly and helpful assistant for the DWI Education of Central Texas website. Your goal is to help users find information about courses and encourage them to register.
                - Answer questions about course offerings, registration, pricing, and general inquiries.
                - Use the provided course information below to give accurate answers.
                - Keep your answers concise, clear, and encouraging.
                - If you don't know the answer, politely say you don't have that information and suggest they use the contact form.
                - Do not answer questions unrelated to DWI education or the registration process.

                Available Courses:
                ${courseInfo}
                `,
            },
        });

        return response.text;
    } catch (error) {
        console.error("Error generating website chat response:", error);
        return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment or use the contact form for assistance.";
    }
};

export const generateClassSummary = async (courseName: string, studentCount: number, instructorName: string): Promise<string> => {
    try {
        const mockContext = `
            Class: ${courseName}
            Students: ${studentCount}
            Instructor: ${instructorName}
            Events:
            - Student Alex J. asked for clarification on Texas Intoxication definitions.
            - Student Maria G. had minor audio latency issues during Session 2, resolved by refreshing.
            - Breakout groups 1 and 3 were highly active; Group 2 needed a prompt from the instructor to start.
            - AI Proctor flagged Student David L. once for leaving the frame for 3 minutes.
            - Tech Support helped Student Samantha J. with a PDF viewing error in Module 3.
        `;

        const response = await getAI().models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate a structured class summary report based on the following session context: \n\n${mockContext}`,
            config: {
                systemInstruction: `You are an administrative AI assistant summarizing a state-certified alcohol education course.
                Provide a professional summary with the following sections:
                1. Executive Overview (General participation and engagement score out of 10)
                2. Key Discussion Topics (Summarize what students spoke or asked about)
                3. Technical Assistance Log (Summarize tech support provided)
                4. Compliance & Monitoring (Summary of proctor flags or attendance issues)
                5. Recommendations for next session.
                Use clear Markdown formatting.`,
            },
        });

        return response.text;
    } catch (error) {
        console.error("Error generating class summary:", error);
        return "Failed to generate class summary. Please check your connection and try again.";
    }
};
