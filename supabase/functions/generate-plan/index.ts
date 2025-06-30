import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RequestBody {
  projectDescription: string;
}

interface AIResponse {
  phases: Array<{
    name: string;
    tasks: string[];
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { projectDescription }: RequestBody = await req.json()

    // Validate input
    if (!projectDescription || typeof projectDescription !== 'string' || projectDescription.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Project description is required and must be a non-empty string' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get AI API key from environment variables
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'AI service configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Construct the AI prompt
    const prompt = `Based on the project description: "${projectDescription.trim()}", generate a project plan. Return ONLY a valid JSON object with a single key "phases". "phases" should be an array of objects, where each object has a "name" (string) for the phase and a "tasks" (array of strings) for the tasks in that phase. Do not include any other text or markdown in your response.`

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      }
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'AI service temporarily unavailable' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const geminiData = await geminiResponse.json()

    // Extract the generated text from Gemini response
    const generatedText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      console.error('No text generated from Gemini API')
      return new Response(
        JSON.stringify({ error: 'Failed to generate project plan' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Clean the response text (remove any markdown formatting)
    let cleanedText = generatedText.trim()
    
    // Remove markdown code blocks if present
    cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '')
    
    // Try to parse the JSON response
    let aiResponse: AIResponse
    try {
      aiResponse = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError)
      console.error('Raw AI response:', generatedText)
      
      return new Response(
        JSON.stringify({ error: 'Invalid response format from AI service' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate the structure of the AI response
    if (!aiResponse.phases || !Array.isArray(aiResponse.phases)) {
      console.error('AI response missing phases array:', aiResponse)
      return new Response(
        JSON.stringify({ error: 'Invalid project plan structure' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate each phase has required fields
    for (const phase of aiResponse.phases) {
      if (!phase.name || typeof phase.name !== 'string' || !phase.tasks || !Array.isArray(phase.tasks)) {
        console.error('Invalid phase structure:', phase)
        return new Response(
          JSON.stringify({ error: 'Invalid phase structure in project plan' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Return the validated AI response
    return new Response(
      JSON.stringify(aiResponse),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in generate-plan function:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})