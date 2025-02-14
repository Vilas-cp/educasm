"use client";
import { Question, UserContext, ExploreResponse, StreamChunk } from "../types";

export class GPTService {
  private async makeRequest(messages: any[], stream: boolean = false) {
    try {
      const response = await fetch("https://back-edu-tau.vercel.app/api/gpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages, stream }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      if (stream) {
        return response.body?.getReader();
      } else {
        const data = await response.json();
        return data.content;
      }
    } catch (error) {
      console.error("API Error:", error);
      throw new Error("Failed to generate content");
    }
  }
  

  async getExploreContent(
    query: string,
    userContext: UserContext
  ): Promise<ExploreResponse> {
    const systemPrompt = `You are a Gen-Z tutor who explains complex topics concisely considering you are teaching someone with a low IQ.
        First, identify the domain of the topic from these categories:
        - SCIENCE: Physics, Chemistry, Biology
        - MATHEMATICS: Algebra, Calculus, Geometry
        - TECHNOLOGY: Computer Science, AI, Robotics
        - MEDICAL: Anatomy, Healthcare, Medicine
        - HISTORY: World History, Civilizations
        - BUSINESS: Economics, Finance, Marketing
        - LAW: Legal Systems, Rights
        - PSYCHOLOGY: Human Behavior, Development
        - CURRENT_AFFAIRS: Global Events, Politics
        - GENERAL: Any other topic

        Return your response in this EXACT JSON format:
        {
          "domain": "identified domain",
          "content": {
            "paragraph1": "Core concept in around 20-30 words - clear, simple, story-telling based introduction and definition",
            "paragraph2": "talk more detail about it in around 20-30 words - main ideas and examples",
            "paragraph3": "Real world applications in around 20-40 words - practical uses and relevance"
          },
          "relatedTopics": [
            {
              "topic": "Most fundamental prerequisite concept",
              "type": "prerequisite",
              "reason": "Brief explanation of why this is essential to understand first"
            },
            {
              "topic": "Most exciting advanced application",
              "type": "extension",
              "reason": "Why this advanced topic is fascinating"
            },
            {
              "topic": "Most impactful real-world use",
              "type": "application",
              "reason": "How this changes everyday life"
            },
            {
              "topic": "Most interesting related concept",
              "type": "parallel",
              "reason": "What makes this connection intriguing"
            },
            {
              "topic": "Most thought-provoking aspect",
              "type": "deeper",
              "reason": "Why this specific aspect is mind-bending"
            }
          ],
          "relatedQuestions": [
            {
              "question": "What if...? (speculative question)",
              "type": "curiosity",
              "context": "Thought-provoking scenario"
            },
            {
              "question": "How exactly...? (mechanism question)",
              "type": "mechanism",
              "context": "Fascinating process to understand"
            },
            {
              "question": "Why does...? (causality question)",
              "type": "causality",
              "context": "Surprising cause-effect relationship"
            },
            {
              "question": "Can we...? (possibility question)",
              "type": "innovation",
              "context": "Exciting potential development"
            },
            {
              "question": "What's the connection between...? (insight question)",
              "type": "insight",
              "context": "Unexpected relationship"
            }
          ]
        }

        IMPORTANT RULES:
        - Each paragraph MUST be around 20-30 words
        - Use simple, clear language
        - Focus on key information only
        - No repetition between paragraphs
        - Make every word count
        - Keep examples specific and brief

        SUBTOPIC GUIDELINES:
        - Focus on the most fascinating aspects
        - Highlight unexpected connections
        - Show real-world relevance
        - Include cutting-edge developments
        - Connect to current trends
        - Emphasize "wow factor"

        QUESTION GUIDELINES:
        - Start with curiosity triggers: "What if", "How exactly", "Why does", "Can we"
        - Focus on mind-bending aspects
        - Highlight counterintuitive elements
        - Explore edge cases
        - Connect to emerging trends
        - Challenge assumptions
        - Spark imagination
        - Make reader think "I never thought about that!"`; // Your existing system prompt
    const userPrompt = `Explain "${query}" in approximately three 20-30 word paragraphs:
        1. Basic definition without using words like imagine
        2. more details
        3. Real-world application examples without using the word real world application
        Make it engaging for someone aged ${userContext.age}.`; // Your existing user prompt

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const content = await this.makeRequest(messages);
    const parsedContent = JSON.parse(content);

    // Validate and format the response
    if (!parsedContent.domain || !parsedContent.content) {
      throw new Error("Invalid response structure");
    }

    return {
      content: [
        parsedContent.content.paragraph1,
        parsedContent.content.paragraph2,
        parsedContent.content.paragraph3,
      ].join("\n\n"),
      relatedTopics: parsedContent.relatedTopics || [],
      relatedQuestions: parsedContent.relatedQuestions || [],
    };
  }

  async streamExploreContent(
    query: string,
    userContext: UserContext,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void> {
    const systemPrompt = `You are a Gen-Z tutor who explains complex topics concisely for a ${userContext.age} year old.
        First provide the explanation in plain text, then provide related content in a STRICT single-line JSON format.
  
        Structure your response exactly like this:
  
        <paragraph 1>
  
        <paragraph 2>
  
        <paragraph 3>
  
        ---
        {"topics":[{"topic":"Topic","type":"prerequisite","reason":"Why"}],"questions":[{"question":"Q?","type":"curiosity","context":"Context"}]}
  
        RULES:
        - ADAPT CONTENT FOR ${userContext.age} YEAR OLD:
          * Match complexity of explanation to age level
        - STRICT LENGTH LIMITS:
          * Total explanation must be 60-80 words maximum
          * Each paragraph around 20-25 words each
          * Related questions maximum 12 words each
          * Topic details 1-2 words each
        - Keep paragraphs clear and simple
        - Third paragraph should directly state applications and facts
        - Use "---" as separator
        - JSON must be in a single line, no line breaks
        - MUST provide EXACTLY 5 related topics and 5 questions
        - Related questions must be:
          * Curiosity-driven and thought-provoking (8-12 words)
          * Make users think "Wow, I never thought about that!"
        - Related topics must be:
          * Directly relevant to understanding the main topic
          * Mix of prerequisites and advanced concepts
          * Brief, clear explanation of importance
        - Topic types: prerequisite, extension, application, parallel, deeper
        - Do not split words across lines or insert unexpected spaces within words
        - Don't generate a single letter generate a whole word before sending
        - Question types: curiosity, mechanism, causality, innovation, insight
        - {"topics":[{"topic":"Topic","type":"prerequisite","reason":"Why"}],"questions":[{"question":"Q?","type":"curiosity","context":"Context"}]} this format should be strictly used without any extra characters`;
  
    const userPrompt = `Explain "${query}" in three very concise paragraphs for a ${userContext.age} year old in Gen Z style:
    1. Basic definition (15-20 words)
    2. Key details (15-20 words)
    3. Direct applications and facts (15-20 words)
  
    Then provide EXACTLY:
    - 5 related topics that help understand ${query} better (age-appropriate)
    - 5 mind-blowing questions (8-12 words each) that spark curiosity
  
    Follow the format and length limits strictly.`;
  
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];
  
    const reader = await this.makeRequest(messages, true);
    if (!reader) return;
  
    const decoder = new TextDecoder();
    let buffer = "";
    let mainText = "";
    let jsonBuffer = "";
    let topics: any[] = [];
    let questions: any[] = [];
    let isJsonSection = false;
  
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
  
      buffer += decoder.decode(value, { stream: true });
  
      // Process each complete line
      let lines = buffer.split("\n\n");
      buffer = lines.pop() || ""; // Keep last incomplete chunk
  
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
  
        const json = line.slice(5).trim();
        if (!json) continue;
  
        try {
          const data = JSON.parse(json);
          const content = data.content || "";
  
          if (content.includes("---")) {
            isJsonSection = true;
            const splitIndex = content.indexOf("---");
            mainText += content.slice(0, splitIndex).trim(); // Store text part
            jsonBuffer = content.slice(splitIndex + 3).trim(); // Start JSON collection
            continue;
          }
  
          if (isJsonSection) {
            jsonBuffer += content.trim(); // Collect JSON part
  
            if (jsonBuffer.endsWith("}")) {
              try {
                const parsed = JSON.parse(jsonBuffer);
                topics = parsed.topics || [];
                questions = parsed.questions || [];
  
                // ✅ Final update when full JSON is received
                onChunk({
                  text: mainText.trim(),
                  topics,
                  questions,
                });
  
                isJsonSection = false; // Stop buffering JSON
                jsonBuffer = ""; // Clear JSON buffer
              } catch (error) {
                console.error("JSON Parsing Error:", error);
              }
            }
          } else {
            mainText += content.trim() + " ";
  
            // ✅ Stream text updates normally
            onChunk({
              text: mainText.trim(),
              topics: [],
              questions: [],
            });
          }
        } catch (error) {
          console.error("Streaming JSON Parse Error:", error);
        }
      }
    }
  }
  

  private validateQuestionFormat(question: Question): boolean {
    try {
      // Basic validation
      if (!question.text?.trim()) return false;
      if (!Array.isArray(question.options) || question.options.length !== 4)
        return false;
      if (question.options.some((opt) => !opt?.trim())) return false;
      if (
        typeof question.correctAnswer !== "number" ||
        question.correctAnswer < 0 ||
        question.correctAnswer > 3
      )
        return false;

      // Explanation validation
      if (
        !question.explanation?.correct?.trim() ||
        !question.explanation?.key_point?.trim()
      )
        return false;

      // Additional validation
      if (question.text.length < 10) return false; // Too short
      if (question.options.length !== new Set(question.options).size)
        return false; // Duplicates
      if (
        question.explanation.correct.length < 5 ||
        question.explanation.key_point.length < 5
      )
        return false; // Too short explanations

      return true;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  }

  async getPlaygroundQuestion(
    topic: string,
    level: number,
    userContext: UserContext
  ): Promise<Question> {
    const aspects = [
      "core_concepts",
      "applications",
      "problem_solving",
      "analysis",
      "current_trends",
    ];

    // Randomly select an aspect to focus on
    const selectedAspect = aspects[Math.floor(Math.random() * aspects.length)];

    const systemPrompt = `Generate a UNIQUE multiple-choice question about ${topic}.
        Focus on: ${selectedAspect.replace("_", " ")}

        Return in this JSON format:
        {
          "text": "question text here",
          "options": ["option A", "option B", "option C", "option D"],
          "correctAnswer": RANDOMLY_PICKED_NUMBER_0_TO_3,
          "explanation": {
            "correct": "Brief explanation of why the correct answer is right (max 15 words)",
            "key_point": "One key concept to remember (max 10 words)"
          },
          "difficulty": ${level},
          "topic": "${topic}",
          "subtopic": "specific subtopic",
          "questionType": "conceptual",
          "ageGroup": "${userContext.age}"
        }

        IMPORTANT RULES FOR UNIQUENESS:
        1. For ${topic}, based on selected aspect:
           - core_concepts: Focus on fundamental principles and theories
           - applications: Focus on real-world use cases and implementations
           - problem_solving: Present a scenario that needs solution
           - analysis: Compare different approaches or technologies
           - current_trends: Focus on recent developments and future directions

        2. Question Variety:
           - NEVER use the same question pattern twice
           - Mix theoretical and practical aspects
           - Include industry-specific examples
           - Use different question formats (what/why/how/compare)
           - Incorporate current developments in ${topic}

        3. Answer Choices:
           - Make ALL options equally plausible
           - Randomly assign the correct answer (0-3)
           - Ensure options are distinct but related
           - Include common misconceptions
           - Make wrong options educational

        4. Format Requirements:
           - Question must be detailed and specific
           - Each option must be substantive
           - Explanation must cover why correct answer is right AND why others are wrong
           - Include real-world context where possible
           - Use age-appropriate language

        ENSURE HIGH ENTROPY:
        - Randomize question patterns
        - Vary difficulty within level ${level}
        - Mix theoretical and practical aspects
        - Use different companies/technologies as examples
        - Include various ${topic} scenarios

        EXPLANATION GUIDELINES:
        - Keep explanations extremely concise and clear
        - Focus on the most important point only
        - Use simple language
        - Highlight the key concept
        - No redundant information
        - Maximum 25 words total`;

    const userPrompt = `Create a completely unique ${level}/10 difficulty question about ${topic}.
    Focus on ${selectedAspect.replace("_", " ")}.
    Ensure the correct answer is randomly placed.
    Make it engaging for a ${userContext.age} year old student.
    Use current examples and trends.`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const content = await this.makeRequest(messages);
    const parsedContent = JSON.parse(content);

    // Randomly shuffle the options and adjust correctAnswer accordingly
    const shuffled = this.shuffleOptionsAndAnswer(parsedContent);

    // Validate and format the question
    const formattedQuestion: Question = {
      text: shuffled.text || "",
      options: shuffled.options,
      correctAnswer: shuffled.correctAnswer,
      explanation: {
        correct: shuffled.explanation?.correct || "Correct answer explanation",
        key_point: shuffled.explanation?.key_point || "Key learning point",
      },
      difficulty: level,
      topic: topic,
      subtopic: parsedContent.subtopic || topic,
      questionType: "conceptual",
      ageGroup: userContext.age.toString(),
    };

    if (this.validateQuestionFormat(formattedQuestion)) {
      return formattedQuestion;
    }

    throw new Error("Generated question failed validation");
  }

  private shuffleOptionsAndAnswer(question: Question): Question {
    // Create array of option objects with original index
    const optionsWithIndex = question.options.map((opt, idx) => ({
      text: opt,
      isCorrect: idx === question.correctAnswer,
    }));

    // Shuffle the options
    for (let i = optionsWithIndex.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionsWithIndex[i], optionsWithIndex[j]] = [
        optionsWithIndex[j],
        optionsWithIndex[i],
      ];
    }

    // Find new index of correct answer
    const newCorrectAnswer = optionsWithIndex.findIndex((opt) => opt.isCorrect);

    return {
      ...question,
      options: optionsWithIndex.map((opt) => opt.text),
      correctAnswer: newCorrectAnswer,
    };
  }

  async getTestQuestions(
    topic: string,
    examType: "JEE" | "NEET"
  ): Promise<Question[]> {
    const systemPrompt = `Create a ${examType} exam test set about ${topic}.
      Generate exactly 15 questions following this structure:
      {
        "questions": [
          {
            "text": "Clear question text",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": 0,
            "explanation": "Step-by-step solution",
            "difficulty": 1,
            "topic": "${topic}",
            "subtopic": "specific concept",
            "examType": "${examType}",
            "questionType": "conceptual"
          }
        ]
      }`;

    const userPrompt = `Create 15 ${examType} questions about ${topic} (5 easy, 5 medium, 5 hard)`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const content = await this.makeRequest(messages);
    const parsed = JSON.parse(content);

    if (!parsed?.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid response structure");
    }

    const processedQuestions = parsed.questions.map(
      (q: Partial<Question>, index: number) => {
        const difficulty = Math.floor(index / 5) + 1;
        return {
          text: q.text || "",
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswer:
            typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
          explanation: q.explanation || "",
          difficulty,
          topic,
          subtopic: q.subtopic || `${topic} Concept ${index + 1}`,
          examType,
          questionType: "conceptual",
          ageGroup: "16-18",
        } as Question;
      }
    );

    const validQuestions = processedQuestions.filter((q: Question) =>
      this.validateQuestionFormat(q)
    );

    if (validQuestions.length >= 5) {
      return validQuestions.slice(0, 15);
    }

    throw new Error(`Only ${validQuestions.length} valid questions generated`);
  }

  async exploreQuery(query: string): Promise<string> {
    const systemPrompt = `You are a social media trend expert who explains topics by connecting them to current viral trends, memes, and pop culture moments.`; // Your existing system prompt
    const userPrompt = this.buildPrompt(query);

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const content = await this.makeRequest(messages);
    return content;
  }

  private buildPrompt(query: string): string {
    return `
      Explain "${query}" using current social media trends, memes, and pop culture references.
      
      Content Style Guide:
      1. Social Media Format Mix:
         - Start with a TikTok-style hook ("POV: you're learning ${query}")
         - Add Instagram carousel-style bullet points
         - Use Twitter/X thread style for facts
         - Include YouTube shorts-style quick explanations
         - End with a viral trend reference
      
      2. Current Trends to Use:
         - Reference viral TikTok sounds/trends
         - Use current meme formats
         - Mention trending shows/movies
         - Reference popular games
         - Include viral challenges
         - Use trending audio references
      
      3. Make it Relatable With:
         - Instagram vs Reality comparisons
         - "That one friend who..." examples
         - "Nobody: / Me:" format
         - "Real ones know..." references
         - "Living rent free in my head" examples
         - "Core memory" references
      
      4. Structure it Like:
         - 🎭 The Hook (TikTok style intro)
         - 📱 The Breakdown (Instagram carousel style)
         - 🧵 The Tea (Twitter thread style facts)
         - 🎬 Quick Takes (YouTube shorts style)
         - 🌟 The Trend Connection (viral reference)
      
      5. Format as:
         {
           "part": {
             "style": "tiktok/insta/twitter/youtube/trend",
             "content": "explanation using current trend",
             "trendReference": "name of trend being referenced",
             "viralComparisons": ["relatable comparison 1", "relatable comparison 2"],
             "popCultureLinks": {
               "trend or term": "how it relates to the topic"
             }
           }
         }

      6. Related Content Style:
         - "Trending topics to explore..."
         - "This gives... vibes"
         - "Main character moments in..."
         - "POV: when you learn about..."

      Important:
      - Use CURRENT trends (2024)
      - Reference viral moments
      - Make pop culture connections
      - Use platform-specific formats
      - Keep updating references
    `;
  }
}

export const gptService = new GPTService();
