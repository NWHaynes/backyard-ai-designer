'use client'

import React, { useState } from 'react'
import { Camera, Sparkles, ArrowRight, RefreshCw, Download, Share2, Zap, TreePine, Waves, Home, Sun, ChevronRight, X, Maximize2 } from 'lucide-react'
import ImageUpload from './components/ImageUpload'
import ImageGallery from './components/ImageGallery'

export default function YardAIPage() {
  // Existing state management
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generationCount, setGenerationCount] = useState(0)

  // New UI state
  const [currentStep, setCurrentStep] = useState(0)
  const [showComparison, setShowComparison] = useState(false)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  // Steps configuration
  const steps = [
    { title: 'Upload', description: 'Share your backyard photo' },
    { title: 'Describe', description: 'Tell us your vision' },
    { title: 'Generate', description: 'Watch AI transform' },
    { title: 'Results', description: 'See your new yard' }
  ]

  // Style presets (converted from your suggestions)
  const stylePresets = [
    { icon: <Sun className="w-4 h-4" />, label: 'Modern', prompt: 'Add modern landscape lighting throughout' },
    { icon: <TreePine className="w-4 h-4" />, label: 'Natural', prompt: 'Create a beautiful garden with colorful flowers along the fence' },
    { icon: <Waves className="w-4 h-4" />, label: 'Resort', prompt: 'Add a water feature or fountain as a centerpiece' },
    { icon: <Home className="w-4 h-4" />, label: 'Cozy', prompt: 'Install a fire pit area with surrounding seating' }
  ]

  // Quick elements (converted from your suggestions)
  const quickElements = [
    { emoji: '🔥', label: 'Fire Pit', text: 'Install a fire pit area with surrounding seating' },
    { emoji: '🏊', label: 'Pool', text: 'Add a swimming pool in the center' },
    { emoji: '🌿', label: 'Garden', text: 'Create a beautiful garden with colorful flowers' },
    { emoji: '🌳', label: 'Trees', text: 'Add shade trees around the perimeter' },
    { emoji: '🪑', label: 'Deck', text: 'Add a wooden deck with outdoor furniture' },
    { emoji: '💡', label: 'Lighting', text: 'Add modern landscape lighting throughout' }
  ]

  // Your existing suggestions for fallback
  const allSuggestions = [
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

  // Your existing image upload handler - updated to trigger step progression
  const handleImageUpload = (imageUrl: string) => {
    if (imageUrl) {
      setUploadedImage(imageUrl)
      setGeneratedImages([]) // Clear previous results
      setError(null)
      setTimeout(() => setCurrentStep(1), 300) // Move to next step with animation delay
    } else {
      setUploadedImage(null)
      setGeneratedImages([])
      setCurrentStep(0) // Go back to upload step
    }
  }

  // Your existing generation logic with step progression
  const handleGenerate = async () => {
    if (!uploadedImage || !prompt.trim()) {
      setError('Please upload an image and enter a prompt')
      return
    }

    setIsGenerating(true)
    setCurrentStep(2) // Move to generating step
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

      console.log('📡 API Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.error || `API Error: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ API Response data received')
      
      if (data.images && Array.isArray(data.images)) {
        setGeneratedImages(data.images)
        setGenerationCount(prev => prev + 1)
        setCurrentStep(3) // Move to results step
        setTimeout(() => setShowComparison(true), 500)
        console.log('🖼️ Images set:', data.images.length)
      } else {
        throw new Error('Invalid response format')
      }
      
    } catch (error) {
      console.error('❌ Generation error:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate images')
      setCurrentStep(1) // Go back to prompt step on error
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate another variation - go back to step 1
  const handleGenerateAnother = () => {
    setCurrentStep(1)
    setShowComparison(false)
  }

  // Download image function
  const downloadImage = async (imageUrl: string, filename: string = 'backyard-design.png') => {
    try {
      if (imageUrl.startsWith('data:')) {
        // Handle base64 data URLs
        const link = document.createElement('a')
        link.href = imageUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // Handle regular URLs
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download image. Please try again.')
    }
  }

  const addToPrompt = (text: string) => {
    setPrompt(prev => prev ? `${prev}, ${text}` : text)
  }

  const resetApp = () => {
    setCurrentStep(0)
    setUploadedImage(null)
    setPrompt('')
    setGeneratedImages([])
    setShowComparison(false)
    setError(null)
    setExpandedImage(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Backyard AI Designer
                </h1>
                <p className="text-sm text-gray-500">
                  Generations used: {generationCount}/10
                </p>
              </div>
            </div>
            
            {/* Progress Steps */}
            <div className="hidden md:flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 ${
                    index <= currentStep 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      index <= currentStep ? 'bg-white' : 'bg-gray-300'
                    }`} />
                    <span className="text-sm font-medium">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-300 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 0: Upload */}
        {currentStep === 0 && (
          <div className="transition-all duration-500 opacity-100 scale-100">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Let&apos;s transform your backyard
              </h2>
              <p className="text-xl text-gray-600">
                Upload a photo to get started with AI-powered design
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <ImageUpload onImageUpload={handleImageUpload} />
            </div>
          </div>
        )}

        {/* Step 1: Show Uploaded Image + Describe */}
        {uploadedImage && currentStep === 1 && (
          <div className="transition-all duration-500 opacity-100 scale-100">
            {/* Keep uploaded image visible */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    Your Current Backyard
                  </h3>
                </div>
                <div className="p-6">
                  <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploadedImage}
                      alt="Your uploaded backyard"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt interface */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Sparkles className="w-6 h-6 mr-3" />
                    Describe Your Dream Yard
                  </h3>
                  <button
                    onClick={resetApp}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your vision... (e.g., &apos;Add a cozy fire pit area with comfortable seating and string lights&apos;)"
                  className="w-full h-40 p-6 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-700 text-lg"
                />

                {/* Style Presets */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Quick Styles</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {stylePresets.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => setPrompt(preset.prompt)}
                        className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                      >
                        {preset.icon}
                        <span className="text-base font-medium">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Elements */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Add Elements</h4>
                  <div className="flex flex-wrap gap-3">
                    {quickElements.map((element, index) => (
                      <button
                        key={index}
                        onClick={() => addToPrompt(element.text)}
                        className="flex items-center space-x-2 px-4 py-3 bg-gray-100 rounded-full hover:bg-blue-100 transition-colors duration-200 text-base"
                      >
                        <span className="text-lg">{element.emoji}</span>
                        <span className="font-medium">{element.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* All Suggestions Dropdown */}
                <details className="mt-8">
                  <summary className="text-lg font-semibold text-gray-700 cursor-pointer hover:text-blue-600 mb-4">
                    More Suggestions ↓
                  </summary>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {allSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setPrompt(suggestion)}
                        className="w-full text-left p-4 text-base bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </details>

                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full mt-8 bg-gradient-to-r from-green-500 to-blue-500 text-white py-5 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center space-x-3"
                >
                  <Zap className="w-6 h-6" />
                  <span>Generate My Dream Yard</span>
                  <ArrowRight className="w-6 h-6" />
                </button>

                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 text-center">
                    🎯 <strong>Enhanced:</strong> AI prompting for realistic results that preserve your yard&apos;s layout!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Generating with Scanning Animation */}
        {uploadedImage && currentStep === 2 && (
          <div className="transition-all duration-500 opacity-100 scale-100">
            {/* Uploaded image with blur overlay and scanning animation */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    Scanning Your Backyard...
                  </h3>
                </div>
                <div className="p-6">
                  <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploadedImage}
                      alt="Your uploaded backyard being analyzed"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Blur overlay */}
                    <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm"></div>
                    
                    {/* Scanning line animation - FIXED */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-bounce opacity-80"></div>
                      <div 
                        className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-green-500 to-transparent opacity-60"
                        style={{
                          animation: 'scanVertical 4s linear infinite'
                        }}
                      ></div>
                    </div>
                    
                    {/* Analysis points */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="grid grid-cols-3 gap-8 opacity-70">
                        {[...Array(9)].map((_, i) => (
                          <div 
                            key={i}
                            className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"
                            style={{
                              animationDelay: `${i * 0.2}s`,
                              animationDuration: '2s'
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Creating Your Dream Yard animation replacing prompt box */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl shadow-xl p-12">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <RefreshCw className="w-12 h-12 text-white animate-spin" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">
                    Creating Your Dream Yard
                  </h3>
                  <p className="text-xl text-gray-600 mb-6">
                    Our enhanced AI is analyzing your photo and designing your perfect backyard...
                  </p>
                  
                  {/* Enhanced progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full animate-pulse"
                      style={{
                        width: '70%',
                        animation: 'progress 4s ease-in-out infinite'
                      }}
                    ></div>
                  </div>
                  
                  {/* Status text */}
                  <p className="text-base text-blue-600 font-medium">
                    Analyzing layout • Understanding style • Generating transformation...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Results - Before/After Comparison */}
        {currentStep === 3 && generatedImages.length > 0 && uploadedImage && (
          <div className={`transition-all duration-500 ${
            showComparison ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Your Transformation Complete! 🎉
              </h2>
              <p className="text-xl text-gray-600">
                Compare your before and after results
              </p>
            </div>

            {/* Before/After Split-Screen with separate boxes */}
            <div className="max-w-6xl mx-auto mb-8">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Before Box */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-200">
                  <div className="relative">
                    <div className="absolute top-6 left-6 bg-black/70 text-white px-6 py-3 rounded-full text-xl font-bold z-10">
                      Before
                    </div>
                    <div className="h-96 bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={uploadedImage}
                        alt="Before transformation"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* After Box - Clickable with expand */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-green-200 group cursor-pointer relative"
                     onClick={() => setExpandedImage(generatedImages[0])}>
                  <div className="relative">
                    <div className="absolute top-6 left-6 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full text-xl font-bold z-10">
                      Your Dream Yard!
                    </div>
                    <div className="absolute top-6 right-6 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Maximize2 className="w-5 h-5" />
                    </div>
                    <div className="h-96 bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={generatedImages[0]}
                        alt="After transformation"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex flex-wrap gap-4 justify-center">
                <button 
                  onClick={handleGenerateAnother}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 text-lg font-semibold"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Generate Another Variation</span>
                </button>
                <button 
                  onClick={() => downloadImage(generatedImages[0], 'dream-backyard.png')}
                  className="flex items-center space-x-2 px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 text-lg font-semibold"
                >
                  <Download className="w-5 h-5" />
                  <span>Download</span>
                </button>
                <button className="flex items-center space-x-2 px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 text-lg font-semibold">
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>

              {/* Start Over */}
              <div className="text-center mt-6">
                <button
                  onClick={resetApp}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200 text-lg"
                >
                  Start a new transformation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Additional Results - Extra Generated Images */}
        {currentStep === 3 && generatedImages.length > 1 && (
          <div className={`transition-all duration-500 mt-8 ${
            showComparison ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                More Variations
              </h3>
              <p className="text-lg text-gray-600">
                Additional designs generated for your backyard
              </p>
            </div>

            {/* Show remaining images in gallery */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h4 className="text-xl font-semibold text-gray-800">Alternative Designs</h4>
              </div>
              <div className="p-6">
                <ImageGallery images={generatedImages.slice(1)} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full bg-white rounded-3xl overflow-hidden border-4 border-gradient-to-r from-green-500 to-blue-500 shadow-2xl">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setExpandedImage(null)}
                className="bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={expandedImage}
              alt="Expanded dream yard design"
              className="w-full h-full object-contain max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <h3 className="text-white text-2xl font-bold mb-2">Your Dream Backyard</h3>
              <button
                onClick={() => downloadImage(expandedImage, 'dream-backyard-full.png')}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download Full Resolution</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes scanVertical {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100vw);
          }
        }
        
        @keyframes progress {
          0%, 100% {
            width: 45%;
          }
          50% {
            width: 85%;
          }
        }
      `}</style>
    </div>
  )
}