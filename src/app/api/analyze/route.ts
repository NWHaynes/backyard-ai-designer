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
              text: `Analyze this backyard image and provide personalized recommendations:

1. CURRENT STATE ANALYSIS:
   - Overall style/theme (modern, traditional, rustic, etc.)
   - Existing features (furniture, plants, structures, materials)
   - Size assessment (small, medium, large yard)
   - Current condition (well-maintained, needs work, etc.)

2. PERSONALIZED RECOMMENDATIONS (3-5 suggestions):
   - What would work best in THIS specific space
   - Consider the existing architecture and style
   - Factor in the yard size and layout
   - Suggest realistic improvements

3. STYLE PROFILE:
   - What design style would complement this space
   - Color palette that would work well
   - Materials that would fit the aesthetic

4. IMPROVEMENT PRIORITIES:
   - Most impactful changes for this yard
   - Budget-friendly quick wins
   - Long-term transformation ideas

Format your response as JSON with keys: analysis, recommendations, styleProfile, improvements`
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
      max_tokens: 1000,
      temperature: 0.3,
      response_format: { type: "json_object" }
    })

    const content = response.choices[0].message.content
    
    try {
      const parsed = JSON.parse(content || '{}')
      return {
        analysis: parsed.analysis || 'Unable to analyze image',
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [
          'Upload a clearer image for better analysis'
        ],
        styleProfile: parsed.styleProfile || 'Unable to determine style',
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [
          'Please try again with a different image'
        ]
      }
    } catch {
      return {
        analysis: 'Unable to analyze image',
        recommendations: ['Upload a clearer image for better analysis'],
        styleProfile: 'Unable to determine style',
        improvements: ['Please try again with a different image']
      }
    }
  } catch (error) {
    console.error('Vision analysis failed:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 AI analysis API called')
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    console.log('🔍 Starting AI analysis...')
    
    const analysis = await analyzeBackyardImage(imageUrl)
    
    console.log('✅ Analysis complete:', {
      recommendationCount: analysis.recommendations?.length || 0
    })

    return NextResponse.json({
      success: true,
      analysis: analysis.analysis,
      recommendations: analysis.recommendations || [],
      styleProfile: analysis.styleProfile,
      improvements: analysis.improvements || [],
      message: 'Image analyzed successfully'
    })

  } catch (error: unknown) {
    console.error('❌ Vision analysis error:', error)
    
    return NextResponse.json({
      error: 'Failed to analyze image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}