import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface BackyardRanking {
  overall_score: number;
  overall_grade: string;
  condition_scores: {
    maintenance: number;
    cleanliness: number;
    plant_health: number;
    structural_condition: number;
  };
  summary: string;
  top_strengths: string[];
  improvement_priorities: string[];
  potential_score: number;
}

// Comprehensive backyard ranking using GPT-4o Vision
async function rankBackyard(imageUrl: string): Promise<BackyardRanking> {
  try {
    console.log('🖼️ Processing image URL length:', imageUrl.length)
    console.log('🖼️ Image URL starts with:', imageUrl.substring(0, 30))
    
    // Check if it's a base64 data URL
    if (!imageUrl.startsWith('data:image/')) {
      console.log('❌ Invalid image URL format. Expected data:image/ URL')
      throw new Error('Invalid image URL format')
    }
    
    console.log('🤖 Calling OpenAI Vision API...')
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a professional landscape designer and backyard assessment expert. Analyze this backyard image and provide a comprehensive ranking.

ASSESSMENT CRITERIA:
1. MAINTENANCE LEVEL (1-5): How well-maintained is this space?
   - 5: Pristine, professional maintenance
   - 4: Well-maintained, minor touch-ups needed
   - 3: Decent condition, some maintenance needed
   - 2: Noticeable neglect, significant maintenance needed
   - 1: Poor condition, major overhaul required

2. CLEANLINESS (1-5): How clean and organized is the space?
   - 5: Spotless, perfectly organized
   - 4: Very clean, well-organized
   - 3: Generally clean, some clutter
   - 2: Somewhat messy, needs cleaning
   - 1: Very cluttered, significant cleanup needed

3. PLANT HEALTH (1-5): Condition of vegetation and landscaping?
   - 5: Lush, healthy, professionally landscaped
   - 4: Healthy plants, good landscaping
   - 3: Most plants healthy, adequate landscaping
   - 2: Some plant issues, basic landscaping
   - 1: Poor plant health, minimal/dying landscaping

4. STRUCTURAL CONDITION (1-5): Condition of fences, patios, furniture, etc.?
   - 5: Excellent condition, high-quality materials
   - 4: Good condition, well-maintained structures
   - 3: Decent condition, minor repairs needed
   - 2: Showing wear, several repairs needed
   - 1: Poor condition, major repairs required

ANALYSIS REQUIRED:
- Calculate overall score (average of 4 categories)
- Assign letter grade (A=4.5-5, B=3.5-4.4, C=2.5-3.4, D=1.5-2.4, F=1-1.4)
- Identify top 3 strengths
- List 3 priority improvement areas
- Estimate potential score with improvements
- Provide encouraging summary

RESPOND IN THIS EXACT JSON FORMAT:
{
  "overall_score": 3.8,
  "overall_grade": "B+",
  "condition_scores": {
    "maintenance": 4,
    "cleanliness": 4,
    "plant_health": 3,
    "structural_condition": 4
  },
  "summary": "A well-maintained backyard with good bones and strong potential for enhancement",
  "top_strengths": [
    "Clean and well-organized space",
    "Good structural condition",
    "Nice outdoor furniture arrangement"
  ],
  "improvement_priorities": [
    "Add more colorful flowering plants",
    "Install landscape lighting for evening ambiance", 
    "Create defined plant beds with edging"
  ],
  "potential_score": 4.5
}`
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 800,
      temperature: 0.3,
      response_format: { type: "json_object" }
    })

    console.log('🤖 OpenAI response received!')
    
    const content = response.choices[0].message.content
    console.log('📝 Raw OpenAI response:', content)
    
    try {
      const parsed = JSON.parse(content || '{}') as Partial<BackyardRanking>
      console.log('✅ Successfully parsed JSON response')
      
      // Validate and sanitize the response
      const ranking: BackyardRanking = {
        overall_score: Math.max(1, Math.min(5, parsed.overall_score || 3)),
        overall_grade: parsed.overall_grade || 'B',
        condition_scores: {
          maintenance: Math.max(1, Math.min(5, parsed.condition_scores?.maintenance || 3)),
          cleanliness: Math.max(1, Math.min(5, parsed.condition_scores?.cleanliness || 3)),
          plant_health: Math.max(1, Math.min(5, parsed.condition_scores?.plant_health || 3)),
          structural_condition: Math.max(1, Math.min(5, parsed.condition_scores?.structural_condition || 3))
        },
        summary: parsed.summary || 'A backyard with potential for improvement',
        top_strengths: Array.isArray(parsed.top_strengths) ? parsed.top_strengths.slice(0, 3) : [
          'Has good foundation',
          'Decent space to work with',
          'Shows care from owner'
        ],
        improvement_priorities: Array.isArray(parsed.improvement_priorities) ? parsed.improvement_priorities.slice(0, 3) : [
          'Add more plants and greenery',
          'Improve lighting',
          'Enhance seating areas'
        ],
        potential_score: Math.max(parsed.overall_score || 3, Math.min(5, parsed.potential_score || 4))
      }
      
      return ranking
    } catch (parseError) {
      console.error('❌ Failed to parse ranking JSON:', parseError)
      console.error('❌ Content that failed to parse:', content)
      throw new Error('Invalid response format from AI')
    }

  } catch (error) {
    console.error('❌ Vision ranking failed:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🏆 Backyard ranking API called')
    const { imageUrl } = await request.json()
    
    console.log('📸 Image URL received:', imageUrl ? 'YES' : 'NO')
    console.log('🔑 OpenAI API Key exists:', !!process.env.OPENAI_API_KEY)

    if (!imageUrl) {
      console.log('❌ No image URL provided')
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log('❌ No OpenAI API key')
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    console.log('🔍 Starting comprehensive backyard ranking...')
    
    // Get detailed ranking from AI vision
    const ranking = await rankBackyard(imageUrl)
    
    console.log('✅ Ranking complete:', ranking)

    return NextResponse.json({
      success: true,
      ranking: ranking,
      message: 'Backyard ranked successfully'
    })

  } catch (error: unknown) {
    console.error('❌ Ranking API error:', error)
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error')
    
    return NextResponse.json({
      error: 'Failed to rank backyard',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}