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

// BACKYARD IMAGE GENERATION RULEBOOK
function enhancePrompt(userPrompt: string): string {
  // System prompt that gets prepended to every user request
  const systemPrompt = `BACKYARD TRANSFORMATION RULES:
1. PRESERVE FOUNDATION: Keep exact perspective, camera angle, depth, and horizon line. Maintain geometry and proportions of existing elements (fences, homes, paths, furniture). Preserve lighting, shadows, and visual identity of the property.

2. MATERIAL REPLACEMENTS: When replacing surfaces (gravel→grass, concrete→pavers), overlay new material on same footprint while keeping shape, paths, and objects intact.

3. ADDING ELEMENTS: Place new objects in realistically scaled positions. New fire pits should be centered in seating areas. Trees/shrubs go around perimeter or fence lines unless specified. New elements must visually integrate with existing materials and tone.

4. REALISM PRIORITY: No floating objects, distortions, or sudden scale changes. Maintain natural integration where new additions blend seamlessly with existing space.

5. LAYOUT PRESERVATION: Keep furniture, fences, trees, and house in same positions unless explicitly asked to move them.

TRANSFORMATION REQUEST: ${userPrompt}

Execute this transformation while following all preservation rules above. Maintain photorealistic quality with natural lighting and proper proportions.`

  return systemPrompt
}

// Enhanced prompt processing for common backyard requests
function processBackyardRequest(userPrompt: string): string {
  const lowercasePrompt = userPrompt.toLowerCase()
  
  // Common transformation patterns with enhanced instructions
  const enhancements: { [key: string]: string } = {
    'grass': 'Replace existing ground surface with lush, healthy green grass while maintaining exact layout and keeping all furniture, paths, and structures in their current positions',
    'pool': 'Add a swimming pool in an appropriate central location, ensuring it fits naturally within the existing space proportions and does not interfere with current furniture placement',
    'fire pit': 'Add a fire pit with surrounding seating area, placed in the most logical central location while maintaining current furniture layout and adding appropriate ground treatment beneath',
    'deck': 'Add a wooden deck structure that integrates naturally with the existing layout, maintaining proper scale and connecting logically to current pathways',
    'patio': 'Create a patio area using materials that complement the existing landscape, maintaining current proportions and furniture placement',
    'trees': 'Add trees and landscaping around the perimeter and along fence lines, ensuring they enhance rather than obstruct the current layout',
    'flowers': 'Add colorful flower beds and garden areas in natural locations that complement the existing landscape design',
    'lighting': 'Install landscape lighting that enhances the space while maintaining the current layout and highlighting existing features',
    'furniture': 'Replace or add outdoor furniture that fits the scale and style of the space while maintaining logical placement and traffic flow'
  }
  
  // Check for enhancement keywords and apply context
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
    console.log('Generate API called - Using enhanced prompting system')
    const { imageUrl: inputImageUrl, prompt: userPrompt } = await request.json()

    if (!inputImageUrl || !userPrompt) {
      return NextResponse.json({ error: 'Image URL and prompt are required' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    console.log('Original user prompt:', userPrompt)
    
    // Step 1: Process the user request for common patterns
    const processedPrompt = processBackyardRequest(userPrompt)
    console.log('Processed prompt:', processedPrompt)
    
    // Step 2: Enhance with full system rules
    const finalPrompt = enhancePrompt(processedPrompt)
    console.log('Final enhanced prompt length:', finalPrompt.length)
    console.log('Final prompt preview:', finalPrompt.substring(0, 200) + '...')

    console.log('Converting uploaded image to file...')
    const imageFile = await dataURLtoFile(inputImageUrl, 'backyard.png')
    console.log('Original image file size:', imageFile.size, `(${(imageFile.size / 1024 / 1024).toFixed(2)}MB)`)

    console.log('Calling gpt-image-1 edit API with enhanced prompt...')
    
    const response = await openai.images.edit({
      image: imageFile,
      prompt: finalPrompt,
      model: "gpt-image-1",
      size: "1024x1024"
    })

    console.log('✅ gpt-image-1 edit response received')

    if (!response.data || response.data.length === 0) {
      return NextResponse.json({ error: 'No images returned from OpenAI' }, { status: 500 })
    }

    const firstImage = response.data[0]
    
    if (firstImage.url) {
      console.log('✅ Found image URL, downloading and converting...')
      
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
          message: 'Image edited successfully with enhanced prompting',
          promptUsed: finalPrompt.substring(0, 300) + '...' // Return snippet for debugging
        })
        
      } catch (fetchError) {
        console.error('❌ Failed to download image from URL:', fetchError)
        return NextResponse.json({ 
          error: 'Failed to download generated image',
          details: 'Could not access the generated image URL'
        }, { status: 500 })
      }
      
    } else if (firstImage.b64_json) {
      console.log('✅ Found base64 image data, using directly')
      
      const dataUrl = `data:image/png;base64,${firstImage.b64_json}`
      return NextResponse.json({ 
        images: [dataUrl],
        message: 'Image edited successfully with enhanced prompting',
        promptUsed: finalPrompt.substring(0, 300) + '...'
      })
      
    } else {
      console.log('❌ No image data found. Available properties:', Object.keys(firstImage || {}))
      return NextResponse.json({ error: 'No image data returned from OpenAI' }, { status: 500 })
    }

  } catch (error: unknown) {
    console.error('=== ENHANCED PROMPT ERROR ===')
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('=== END ERROR DETAILS ===')
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ 
      error: `Generation failed: ${errorMessage}`,
      details: 'Check server logs for more details'
    }, { status: 500 })
  }
}
