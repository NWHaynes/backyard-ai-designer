'use client'

import React, { useState } from 'react'
import ImageUpload from './components/ImageUpload'
import ImageGallery from './components/ImageGallery'

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generationCount, setGenerationCount] = useState(0)

  const handleImageUpload = (imageUrl: string) => {
    if (imageUrl) {
      setUploadedImage(imageUrl)
      setGeneratedImages([]) // Clear previous results
      setError(null)
    } else {
      setUploadedImage(null)
      setGeneratedImages([])
    }
  }

  const handleGenerate = async () => {
    if (!uploadedImage || !prompt.trim()) {
      setError('Please upload an image and enter a prompt')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      console.log('🚀 Starting generation with enhanced prompting...')
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: uploadedImage,
          prompt: prompt.trim(),
        }),
      })

      console.log('�� API Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.error || `API Error: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ API Response data received')
      
      if (data.images && Array.isArray(data.images)) {
        setGeneratedImages(data.images)
        setGenerationCount(prev => prev + 1) // Increment counter
        console.log('🖼️ Images set:', data.images.length)
      } else {
        throw new Error('Invalid response format')
      }
      
    } catch (error) {
      console.error('❌ Generation error:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate images')
    } finally {
      setIsGenerating(false)
    }
  }

  // Enhanced suggestions based on the prompt engineering system
  const suggestions = [
    'Replace the gravel with lush green grass',
    'Add a swimming pool in the center',
    'Create a beautiful garden with colorful flowers along the fence',
    'Add a wooden deck with outdoor furniture',
    'Install a fire pit area with surrounding seating',
    'Add modern landscape lighting throughout',
    'Create a zen garden with rocks and bamboo features',
    'Add a concrete patio with outdoor dining furniture',
    'Install raised garden beds with vegetables and herbs',
    'Add shade trees around the perimeter',
    'Create a modern outdoor kitchen area',
    'Add a water feature or fountain as a centerpiece'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Backyard AI Designer
          </h1>
          <p className="text-gray-600">
            Transform your backyard into the yard of your dreams
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Generations used: {generationCount}/10
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Column - Upload and Controls */}
          <div className="space-y-6">
            <ImageUpload onImageUpload={handleImageUpload} />
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Describe Your Dream Backyard
              </h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">✨ Enhanced prompts for better results:</p>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(suggestion)}
                      className="text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-lg text-sm border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or write your own description:
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to change in your backyard..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Tip: Be specific about what you want to replace, add, or modify
                </p>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              <button
                onClick={handleGenerate}
                disabled={!uploadedImage || !prompt.trim() || isGenerating}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Generating Enhanced Design...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Generate Enhanced Design
                  </>
                )}
              </button>
              
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700">
                  🎯 <strong>New:</strong> Enhanced AI prompting for more realistic results that preserve your yard&apos;s layout and proportions!
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Results (only show if there are images) */}
          <div>
            {generatedImages.length > 0 && (
              <ImageGallery images={generatedImages} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
