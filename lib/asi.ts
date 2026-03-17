export async function callASI(prompt: string) {
  const ASI_API_KEY = process.env.ASI_API_KEY;
  
  const res = await fetch("https://api.asi1.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ASI_API_KEY}`
    },
    body: JSON.stringify({
      model: "asi1",
      messages: [
        { role: "system", content: "You are an intelligent AI learning agent." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("ASI API error response:", res.status, errorText);
    throw new Error(`ASI API error: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function generateRoadmap(goal: string, timeline: string, hours: string) {
  const prompt = `
You are Planix AI.

Follow structured reasoning:
Step 1: Understand goal: ${goal}
Step 2: Break into phases
Step 3: Assign timeline (${timeline}, ${hours} hours/day)
Step 4: Create objectives
Step 5: Add explanation

Return STRICT JSON:
{
  "title": "Roadmap Title",
  "totalDuration": "${timeline}",
  "phases":[
    {
      "title":"",
      "duration":"",
      "objectives":[],
      "explanation":"",
      "resources":[]
    }
  ]
}
`;

  const aiResponse = await callASI(prompt);

  try {
    // Strip markdown formatting if any
    const cleanedResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch {
    throw new Error("Invalid JSON from ASI");
  }
}

export async function refineRoadmap(currentRoadmap: any, userPrompt: string, uploadedContext?: string, chatHistory?: string, userProgress?: string) {
  const prompt = `
You are Planix AI.

Context:
- Roadmap: ${JSON.stringify(currentRoadmap)}
- Chat History: ${chatHistory || 'None'}
- Uploaded Context: ${uploadedContext || 'None'}
- User Progress: ${userProgress || 'None'}

User request to refine: ${userPrompt}

Return STRICT JSON with the updated roadmap in the exact same structure:
{
  "title": "Roadmap Title",
  "totalDuration": "...",
  "phases":[
    {
      "title":"",
      "duration":"",
      "objectives":[],
      "explanation":"",
      "resources":[]
    }
  ]
}
`;

  const aiResponse = await callASI(prompt);

  try {
    const cleanedResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch {
    throw new Error("Invalid JSON from ASI");
  }
}

export async function teachingExplain(concept: string, context: string, uploadedContext?: string, chatHistory?: string, userProgress?: string) {
  const prompt = `
You are Planix AI tutor.

Context:
- Roadmap: ${context}
- Chat History: ${chatHistory || 'None'}
- Uploaded Context: ${uploadedContext || 'None'}
- User Progress: ${userProgress || 'None'}

User: Explain the concept: "${concept}"

Respond clearly and structured.
Format:
# Topic

## Concept
Explanation

## Example
Example explanation

## Practice Task
Small challenge.
`;

  return await callASI(prompt);
}

export async function generateNotes(topic: string, context: string, uploadedContext?: string, chatHistory?: string, userProgress?: string) {
  const prompt = `
Generate structured notes:

Context:
- Roadmap: ${context}
- Chat History: ${chatHistory || 'None'}
- Uploaded Context: ${uploadedContext || 'None'}
- User Progress: ${userProgress || 'None'}

Topic: ${topic}

Format:
- Definition
- Key Concepts
- Examples
- Summary
`;

  return await callASI(prompt);
}
