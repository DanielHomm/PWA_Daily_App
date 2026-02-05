import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    try {
        const body = await req.json();
        const { url, text } = body;

        let promptContent = "";

        if (url) {
            // Simple HTML fetch (Note: heavily guarded sites might block this)
            // For a robust app, we'd use Puppeteer or similar, but let's try fetch first.
            try {
                // Use Jina AI Reader to convert URL to LLM-friendly Markdown
                const jinaUrl = `https://r.jina.ai/${url}`;
                const res = await fetch(jinaUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; DailyApp/1.0)',
                        // Jina might throttle if no headers, standard fetch usually fine
                    }
                });

                if (!res.ok) throw new Error("Failed to fetch via Jina Reader");
                const markdown = await res.text();

                // Jina returns clean markdown, so we don't need heavy regex HTML cleaning anymore.
                // We might still want to limit length if it's huge.
                const cleanText = markdown.substring(0, 30000);

                promptContent = `Extract recipe from this Jina Reader Markdown content:\n\n${cleanText}`;
            } catch (err) {
                return NextResponse.json({ error: "Could not fetch URL. " + err.message }, { status: 400 });
            }
        } else if (text) {
            promptContent = `Extract recipe from this text:\n\n${text}`;
        } else {
            return NextResponse.json({ error: "Missing url or text" }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const systemPrompt = `
    You are an expert recipe parser. Extract the recipe into a JSON format.

    CRITICAL VALIDATION STEP:
    First, check if the content provided is actually a cooking recipe.
    If it is NOT a recipe (e.g. a blog post without a recipe, a privacy policy, a generic page), return exactly:
    {"error": "No recipe found in content"}

    CRITICAL RULE FOR SPICES & PANTRY ITEMS:
    Identify "Pantry Spices", "Common Pantry Items" (Salt, Pepper, Oil, Sugar, Flour), AND "Garnishes" (e.g. Parmesan, Basil, Parsley if used for topping).
    ALSO identify items with VAGUE or MISSING units (e.g. "some basil", "salt to taste", "parmesan").
    REMOVE ALL these from the 'ingredients' list. The 'ingredients' list must only contain clear grocery items to buy.
    Return a separate "spices" array for these removed items.

    CRITICAL RULE FOR TIME:
    Extract 'prep_time', 'cook_time', and 'total_time' (in minutes).
    If 'cook_time' is missing but 'total_time' exists, estimate: cook_time = total_time - prep_time.
    If only 'total_time' is known, assign it to 'cook_time' and set 'prep_time' to 0.

    CRITICAL RULE FOR DESCRIPTION:
    Do NOT generate a summary or intro for the recipe. Leave the 'description' field empty. We only want the instructions/steps in the 'steps' array.

    CRITICAL RULE FOR STEPS:
    Extract instructions as a clean array of strings. Do not number them yourself.

    Return JSON structure:
    {
       "title": "Recipe Title",
       "description": "", 
       "servings": 4, 
       "prep_time": 15,
       "cook_time": 30,
       "ingredients": [ 
          { "item": "Chicken Breast", "amount": "500", "unit": "g" },
          { "item": "Carrots", "amount": "2", "unit": "pcs" }
       ],
       "spices": ["Salt", "Black Pepper", "Olive Oil"],
       "steps": ["Chop the carrots.", "Fry chicken...", "Add carrots and simmer."]
    }
    
    Response MUST be valid JSON only.
    `;

        const result = await model.generateContent([systemPrompt, promptContent]);
        const response = await result.response;
        const textRes = response.text();

        // Clean markdown code blocks if Gemini adds them
        const cleanJson = textRes.replace(/```json/g, "").replace(/```/g, "").trim();

        const recipeData = JSON.parse(cleanJson);

        if (recipeData.error) {
            return NextResponse.json({ error: recipeData.error }, { status: 400 });
        }

        // --- Post-Processing for JustTheRecipe Link & Formatting ---
        const jtrUrl = `https://www.justtherecipe.com/?url=${encodeURIComponent(url)}`;

        let formattedDesc = recipeData.description || "";

        // 1. Add Spices Section
        if (recipeData.spices && recipeData.spices.length > 0) {
            formattedDesc += "\n\n**Needed Pantry Items/Spices:** " + recipeData.spices.join(", ");
        }

        // 2. Add Clean View Link
        formattedDesc += `\n\n**Clean View:** [Just The Recipe](${jtrUrl})`;

        // 3. Add Instructions
        if (recipeData.steps && recipeData.steps.length > 0) {
            formattedDesc += "\n\n**Instructions:**\n\n" + recipeData.steps.map(s => `* ${s}`).join("\n");
        }

        // Return processed data (frontend expects 'description' to be the full blob)
        recipeData.description = formattedDesc;

        return NextResponse.json(recipeData);

    } catch (error) {
        console.error("AI Recipe Error Details:", error);
        return NextResponse.json({
            error: error.message || "Failed to process recipe",
            details: JSON.stringify(error, Object.getOwnPropertyNames(error))
        }, { status: 500 });
    }
}
