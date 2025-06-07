import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function analyzeBackyardImage(imageUrl: string): Promise<{
  analysis: string;
  recommendations: string[];
  styleProfile: string;
  improvements: string[];
  generationContext: string; // NEW: Specific context for image generation
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this backyard image and provide comprehensive assessment:

1. CURRENT STATE ANALYSIS:
   - Overall style/theme (modern, traditional, rustic, contemporary, farmhouse, etc.)
   - Existing features (furniture, plants, structures, materials, surfaces)
   - Size assessment (small urban, medium suburban, large estate, etc.)
   - Current condition (pristine, well-maintained, needs work, neglected, etc.)
   - Layout characteristics (open, sectioned, formal, casual, etc.)

2. PERSONALIZED RECOMMENDATIONS (3-5 suggestions):
   - What would work best in THIS specific space
   - Consider the existing architecture and style
   - Factor in the yard size and layout
   - Suggest realistic improvements that complement existing elements

3. STYLE PROFILE:
   - What design style would complement this space
   - Color palette that would work well
   - Materials that would fit the aesthetic
   - Architectural elements to preserve or enhance

4. IMPROVEMENT PRIORITIES:
   - Most impactful changes for this yard
   - Budget-friendly quick wins
   - Long-term transformation ideas

5. GENERATION CONTEXT (CRITICAL FOR AI IMAGE GENERATION):
   Provide a detailed 3-4 sentence description specifically for AI image generation that includes:
   - Exact architectural style and current aesthetic
   - Specific materials, surfaces, and features to preserve
   - The type of improvements that would enhance (not clash with) this style
   - Guidance for maintaining the space's unique character and proportions

Example Generation Context:
"Contemporary suburban backyard featuring clean concrete surfaces, established mature evergreen trees, and sleek modern furniture with geometric lines. The space exhibits strong minimalist bones with high-quality hardscaping that should be preserved. Improvements should enhance the sophisticated modern aesthetic through selective organic elements rather than overwhelming the clean design. Any additions must complement the existing scale and maintain the refined contemporary character."

Format your response as JSON with keys: analysis, recommendations, styleProfile, improvements, generationContext`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 1200,
      temperature: 0.3,
      response_format: { type: "json_object" }
    })

    const content = response.choices[0].message.content
    
    try {
      const parsed = JSON.parse(content || '{}')
      return {
        analysis: parsed.analysis || 'Unable to analyze image - please try uploading a clearer photo',
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [
          'Upload a clearer image for better analysis',
          'Ensure the photo shows the main backyard area',
          'Try taking the photo from a different angle'
        ],
        styleProfile: parsed.styleProfile || 'Unable to determine style - analysis inconclusive',
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [
          'Better image quality needed for detailed recommendations',
          'Please try again with a well-lit, clear photo'
        ],
        generationContext: parsed.generationContext || 'Residential backyard space with mixed styling requiring careful assessment of existing elements before adding complementary improvements that respect the current layout and aesthetic foundation'
      }
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', parseError)
      return {
        analysis: 'Analysis parsing failed - using fallback assessment',
        recommendations: [
          'Add colorful flowering plants for visual interest and natural beauty',
          'Consider outdoor lighting for evening ambiance and extended usability',
          'Create defined seating areas for entertaining and relaxation'
        ],
        styleProfile: 'Mixed residential style with enhancement potential',
        improvements: [
          'Enhance plant diversity and color throughout the space',
          'Improve outdoor lighting for evening use and safety',
          'Add functional seating areas for outdoor living'
        ],
        generationContext: 'Established residential backyard with moderate styling and good structural foundation suitable for thoughtful enhancements that build upon existing landscape elements while introducing complementary features'
      }
    }
  } catch (error) {
    console.error('Vision analysis failed:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Enhanced AI analysis API called')
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    console.log('🔍 Starting enhanced AI analysis...')
    
    const analysis = await analyzeBackyardImage(imageUrl)
    
    console.log('✅ Enhanced analysis complete:', {
      recommendationCount: analysis.recommendations?.length || 0,
      hasGenerationContext: !!analysis.generationContext
    })

    return NextResponse.json({
      success: true,
      analysis: analysis.analysis,
      recommendations: analysis.recommendations || [],
      styleProfile: analysis.styleProfile,
      improvements: analysis.improvements || [],
      generationContext: analysis.generationContext, // NEW: Added for generate API
      message: 'Image analyzed successfully with generation context'
    })

  } catch (error: unknown) {
    console.error('❌ Enhanced vision analysis error:', error)
    
    return NextResponse.json({
      error: 'Failed to analyze image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}