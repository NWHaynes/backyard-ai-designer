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

3. ADDING ELEMENTS: Place new objects in realistically scaled positions that make sense for the specific space and user request. Consider the size and layout of the yard when choosing what elements to add. Elements should visually integrate with existing materials and tone.

4. REALISM PRIORITY: No floating objects, distortions, or sudden scale changes. Maintain natural integration where new additions blend seamlessly with existing space.

5. LAYOUT PRESERVATION: Keep furniture, fences, trees, and house in same positions unless explicitly asked to move them.

6. USER-FOCUSED DESIGN: Only add elements that are specifically requested or that directly support the user's stated goals. Do not add decorative elements unless they enhance the specific request.

TRANSFORMATION REQUEST: ${userPrompt}

Execute this transformation while following all preservation rules above. Focus specifically on what the user has requested without adding unnecessary elements. Maintain photorealistic quality with natural lighting and proper proportions.`

  return systemPrompt
}

// Enhanced prompt processing for common backyard requests
function processBackyardRequest(userPrompt: string): string {
  const lowercasePrompt = userPrompt.toLowerCase()
  
  // Common transformation patterns with enhanced instructions
  const enhancements: { [key: string]: string } = {
    'grass': 'Replace existing ground surface with lush, healthy green grass while maintaining exact layout and keeping all furniture, paths, and structures in their current positions',
    'lawn': 'Replace existing ground surface with lush, healthy green grass while maintaining exact layout and keeping all furniture, paths, and structures in their current positions',
    'pool': 'Add a swimming pool in an appropriate location that fits naturally within the existing space proportions and doesn\'t interfere with current furniture placement',
    'swimming pool': 'Add a swimming pool in an appropriate location that fits naturally within the existing space proportions and doesn\'t interfere with current furniture placement',
    'fire pit': 'Add a fire pit with appropriate seating arrangement, placed in a suitable location while maintaining current furniture layout',
    'firepit': 'Add a fire pit with appropriate seating arrangement, placed in a suitable location while maintaining current furniture layout',
    'deck': 'Add a wooden deck structure that integrates naturally with the existing layout, maintaining proper scale and connecting logically to current pathways',
    'patio': 'Create a patio area using materials that complement the existing landscape, maintaining current proportions and furniture placement',
    'trees': 'Add trees and landscaping in appropriate locations that enhance the existing layout without obstructing views or pathways',
    'plants': 'Add plants and landscaping that complement the existing space and enhance the overall design',
    'flowers': 'Add colorful flower beds and garden areas in natural locations that complement the existing landscape design',
    'garden': 'Add garden beds with plants and flowers in locations that enhance the existing landscape design',
    'lighting': 'Install appropriate landscape lighting that enhances the space while maintaining the current layout and highlighting existing features',
    'furniture': 'Add or replace outdoor furniture that fits the scale and style of the space while maintaining logical placement and traffic flow',
    'seating': 'Add appropriate outdoor seating that fits the space and complements the existing layout',
    'dining': 'Add outdoor dining furniture and setup that fits naturally within the existing space',
    'entertaining': 'Create an entertaining area with appropriate furniture and layout for the space size and existing features',
    'modern': 'Transform the space with modern design elements, clean lines, and contemporary materials while preserving the existing layout',
    'traditional': 'Transform the space with traditional design elements and classic materials while preserving the existing layout',
    'cozy': 'Create a cozy, intimate atmosphere with appropriate scaled elements for relaxation',
    'spacious': 'Enhance the sense of space with design choices that make the area feel larger and more open'
  }
  
  // Check for enhancement keywords and apply context
  let enhancedPrompt = userPrompt
  for (const [keyword, enhancement] of Object.entries(enhancements)) {
    if (lowercasePrompt.includes(keyword)) {
      enhancedPrompt = `${enhancement}. Original request: ${userPrompt}`
      break // Only apply the first matching enhancement
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
    let imageFile = await dataURLtoFile(inputImageUrl, 'backyard.png')
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

  } catch (error: any) {
    console.error('=== ENHANCED PROMPT ERROR ===')
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    console.error('=== END ERROR DETAILS ===')
    
    return NextResponse.json({ 
      error: `Generation failed: ${error.message}`,
      details: 'Check server logs for more details'
    }, { status: 500 })
  }
}
