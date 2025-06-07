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

// AI Vision Analysis for personalized prompting
async function analyzeBackyard(imageUrl: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this backyard for AI image generation. Provide a concise analysis focusing on:
              - Current style/aesthetic (modern, traditional, rustic, etc.)
              - Yard size and layout
              - Existing features and materials
              - What improvements would work best in THIS specific space
              
              Keep response under 200 words, focus on actionable insights for image generation.`
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 300,
      temperature: 0.3
    })

    return response.choices[0].message.content || 'Modern backyard with standard layout'
  } catch (error) {
    console.error('Vision analysis failed, using fallback:', error)
    return 'Well-maintained backyard with potential for enhancement'
  }
}

// Enhanced prompt with vision analysis
function createPersonalizedPrompt(userPrompt: string, visionAnalysis: string): string {
  const enhancedPrompt = `BACKYARD TRANSFORMATION RULES:
1. PRESERVE FOUNDATION: Keep exact perspective, camera angle, depth, and horizon line. Maintain geometry and proportions of existing elements (fences, homes, paths, furniture). Preserve lighting, shadows, and visual identity.

2. PERSONALIZED CONTEXT: ${visionAnalysis}

3. STYLE INTEGRATION: Ensure new elements complement the existing aesthetic and scale appropriately for this specific yard size and layout.

4. REALISTIC IMPLEMENTATION: No floating objects, distortions, or scale issues. Maintain natural integration where additions blend seamlessly.

5. LAYOUT PRESERVATION: Keep furniture, fences, trees, and structures in current positions unless explicitly asked to move them.

USER TRANSFORMATION REQUEST: ${userPrompt}

Execute this transformation maintaining photorealistic quality with natural lighting that matches existing conditions. Focus on realistic, achievable improvements that enhance rather than replace the yard's character.`

  return enhancedPrompt
}

// Process common requests (keep your existing logic)
function processBackyardRequest(userPrompt: string): string {
  const lowercasePrompt = userPrompt.toLowerCase()
  
  const enhancements: { [key: string]: string } = {
    'grass': 'Replace existing ground surface with lush, healthy green grass while maintaining exact layout',
    'pool': 'Add a swimming pool in an appropriate central location that fits naturally within the space',
    'fire pit': 'Add a fire pit with surrounding seating area in the most logical central location',
    'deck': 'Add a wooden deck structure that integrates naturally with the existing layout',
    'patio': 'Create a patio area using materials that complement the existing landscape',
    'trees': 'Add trees and landscaping around the perimeter and along fence lines',
    'flowers': 'Add colorful flower beds and garden areas in natural locations',
    'lighting': 'Install landscape lighting that enhances the space while maintaining current layout',
    'furniture': 'Replace or add outdoor furniture that fits the scale and style of the space'
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
    console.log('🚀 Generate API called with AI vision analysis')
    const { imageUrl: inputImageUrl, prompt: userPrompt } = await request.json()

    if (!inputImageUrl || !userPrompt) {
      return NextResponse.json({ error: 'Image URL and prompt are required' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    console.log('Original user prompt:', userPrompt)
    
    // Step 1: Analyze the backyard with AI vision
    console.log('🔍 Analyzing backyard with AI vision...')
    const visionAnalysis = await analyzeBackyard(inputImageUrl)
    console.log('✅ Vision analysis:', visionAnalysis.substring(0, 100) + '...')
    
    // Step 2: Process user request for common patterns
    const processedPrompt = processBackyardRequest(userPrompt)
    
    // Step 3: Create personalized prompt with vision insights
    const finalPrompt = createPersonalizedPrompt(processedPrompt, visionAnalysis)
    console.log('🎯 Final enhanced prompt length:', finalPrompt.length)
    console.log('📝 Prompt preview:', finalPrompt.substring(0, 200) + '...')

    // Step 4: Convert image and generate
    console.log('🖼️ Converting uploaded image to file...')
    const imageFile = await dataURLtoFile(inputImageUrl, 'backyard.png')
    console.log('📊 Image file size:', `${(imageFile.size / 1024 / 1024).toFixed(2)}MB`)

    console.log('🎨 Calling GPT-image-1 with personalized prompt...')
    
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
          message: 'Image generated with AI vision analysis',
          visionAnalysis: visionAnalysis.substring(0, 200) + '...',
          promptUsed: finalPrompt.substring(0, 300) + '...'
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
        message: 'Image generated with AI vision analysis',
        visionAnalysis: visionAnalysis.substring(0, 200) + '...',
        promptUsed: finalPrompt.substring(0, 300) + '...'
      })
      
    } else {
      console.log('❌ No image data found:', Object.keys(firstImage || {}))
      return NextResponse.json({ error: 'No image data returned from OpenAI' }, { status: 500 })
    }

  } catch (error: unknown) {
    console.error('=== VISION-ENHANCED GENERATION ERROR ===')
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error')
    console.error('=== END ERROR DETAILS ===')
    
    return NextResponse.json({ 
      error: `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: 'Check server logs for more details'
    }, { status: 500 })
  }
}
