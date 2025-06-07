import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Convert data URL to File for the edit API
async function dataURLtoFile(dataurl: string, filename: string): Promise<File> {
  const response = await fetch(dataurl)
  const blob = await response.blob()
  return new File([blob], filename, { type: blob.type })
}

// Get detailed analysis from the analyze endpoint
async function getDetailedAnalysis(imageUrl: string): Promise<string> {
  try {
    console.log('🔗 Calling /api/analyze for detailed analysis...')
    
    // Call your existing analyze endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Detailed analysis received from /api/analyze')
      
      // Use the rich generationContext from the analyze endpoint
      return data.generationContext || data.analysis || 'Standard backyard suitable for enhancement'
    } else {
      console.log('⚠️ Analyze endpoint failed, using fallback analysis')
      return 'Well-maintained residential backyard with standard layout and good potential for thoughtful improvements'
    }
  } catch (error) {
    console.error('❌ Failed to get detailed analysis:', error)
    return 'Residential backyard space requiring careful enhancement that respects existing layout and features'
  }
}

// Enhanced prompt with detailed vision analysis
function createPersonalizedPrompt(userPrompt: string, detailedAnalysis: string): string {
  const enhancedPrompt = `BACKYARD TRANSFORMATION RULES:
1. PRESERVE FOUNDATION: Keep exact perspective, camera angle, depth, and horizon line. Maintain geometry and proportions of existing elements (fences, homes, paths, furniture). Preserve lighting, shadows, and visual identity.

2. DETAILED SPACE ANALYSIS: ${detailedAnalysis}

3. STYLE INTEGRATION: Ensure new elements complement the existing aesthetic and scale appropriately for this specific yard size and layout. Respect the established architectural character.

4. REALISTIC IMPLEMENTATION: No floating objects, distortions, or scale issues. Maintain natural integration where additions blend seamlessly with current materials and design language.

5. LAYOUT PRESERVATION: Keep furniture, fences, trees, and structures in current positions unless explicitly asked to move them. Preserve successful existing relationships between elements.

USER TRANSFORMATION REQUEST: ${userPrompt}

Execute this transformation maintaining photorealistic quality with natural lighting that matches existing conditions. Focus on realistic, achievable improvements that enhance rather than replace the yard's established character and design integrity.`

  return enhancedPrompt
}

// Process common requests with enhanced context awareness
function processBackyardRequest(userPrompt: string): string {
  const lowercasePrompt = userPrompt.toLowerCase()
  
  const enhancements: { [key: string]: string } = {
    'grass': 'Replace existing ground surface with lush, healthy green grass while maintaining exact layout and preserving all hardscape elements',
    'pool': 'Add a swimming pool in an appropriate location that fits naturally within the space proportions and complements existing features',
    'fire pit': 'Add a fire pit with surrounding seating area positioned logically within the existing layout without disrupting traffic flow',
    'deck': 'Add a wooden deck structure that integrates naturally with the existing architecture and landscape design',
    'patio': 'Create a patio area using materials that complement the existing landscape and architectural style',
    'trees': 'Add trees and landscaping around the perimeter and along fence lines that enhance rather than obstruct the current design',
    'flowers': 'Add colorful flower beds and garden areas in natural locations that complement the existing plant palette',
    'lighting': 'Install landscape lighting that enhances the space while maintaining current layout and highlighting existing architectural features',
    'furniture': 'Replace or add outdoor furniture that fits the scale, style, and color palette of the existing space design'
  }
  
  let enhancedPrompt = userPrompt
  for (const [keyword, enhancement] of Object.entries(enhancements)) {
    if (lowercasePrompt.includes(keyword)) {
      enhancedPrompt = `${enhancement}. ${userPrompt}`
      break
    }
  }
  
  return enhancedPrompt
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Enhanced Generate API called with detailed vision analysis')
    const { imageUrl: inputImageUrl, prompt: userPrompt } = await request.json()

    if (!inputImageUrl || !userPrompt) {
      return NextResponse.json({ error: 'Image URL and prompt are required' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    console.log('Original user prompt:', userPrompt)
    
    // Step 1: Get detailed analysis from the analyze endpoint
    console.log('🔍 Getting detailed backyard analysis...')
    const detailedAnalysis = await getDetailedAnalysis(inputImageUrl)
    console.log('✅ Detailed analysis:', detailedAnalysis.substring(0, 150) + '...')
    
    // Step 2: Process user request for common patterns
    const processedPrompt = processBackyardRequest(userPrompt)
    console.log('🔄 Processed prompt:', processedPrompt !== userPrompt ? 'Enhanced' : 'Original')
    
    // Step 3: Create personalized prompt with detailed insights
    const finalPrompt = createPersonalizedPrompt(processedPrompt, detailedAnalysis)
    console.log('🎯 Final enhanced prompt length:', finalPrompt.length)
    console.log('📝 Final prompt preview:', finalPrompt.substring(0, 300) + '...')

    // Step 4: Convert image and generate
    console.log('🖼️ Converting uploaded image to file...')
    const imageFile = await dataURLtoFile(inputImageUrl, 'backyard.png')
    console.log('📊 Image file size:', `${(imageFile.size / 1024 / 1024).toFixed(2)}MB`)

    console.log('🎨 Calling GPT-image-1 with detailed personalized prompt...')
    
    const response = await openai.images.edit({
      image: imageFile,
      prompt: finalPrompt,
      model: "gpt-image-1",
      size: "1024x1024"
    })

    console.log('✅ GPT-image-1 response received')

    if (!response.data || response.data.length === 0) {
      return NextResponse.json({ error: 'No images returned from OpenAI' }, { status: 500 })
    }

    const firstImage = response.data[0]
    
    if (firstImage.url) {
      console.log('📥 Downloading and converting image...')
      
      try {
        const imageResponse = await fetch(firstImage.url)
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`)
        }
        
        const imageBuffer = await imageResponse.arrayBuffer()
        const base64Image = Buffer.from(imageBuffer).toString('base64')
        const dataUrl = `data:image/png;base64,${base64Image}`
        
        console.log('✅ Successfully converted URL to base64')
        
        return NextResponse.json({ 
          images: [dataUrl],
          message: 'Image generated with detailed AI vision analysis',
          detailedAnalysis: detailedAnalysis.substring(0, 200) + '...',
          promptUsed: finalPrompt.substring(0, 400) + '...'
        })
        
      } catch (fetchError) {
        console.error('❌ Failed to download image:', fetchError)
        return NextResponse.json({ 
          error: 'Failed to download generated image',
          details: 'Could not access the generated image URL'
        }, { status: 500 })
      }
      
    } else if (firstImage.b64_json) {
      console.log('✅ Using base64 image data directly')
      
      const dataUrl = `data:image/png;base64,${firstImage.b64_json}`
      return NextResponse.json({ 
        images: [dataUrl],
        message: 'Image generated with detailed AI vision analysis',
        detailedAnalysis: detailedAnalysis.substring(0, 200) + '...',
        promptUsed: finalPrompt.substring(0, 400) + '...'
      })
      
    } else {
      console.log('❌ No image data found:', Object.keys(firstImage || {}))
      return NextResponse.json({ error: 'No image data returned from OpenAI' }, { status: 500 })
    }

  } catch (error: unknown) {
    console.error('=== ENHANCED VISION GENERATION ERROR ===')
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error')
    console.error('=== END ERROR DETAILS ===')
    
    return NextResponse.json({ 
      error: `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: 'Check server logs for more details'
    }, { status: 500 })
  }
}