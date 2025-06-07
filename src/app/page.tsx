'use client'

import React, { useState } from 'react'
import { Camera, Sparkles, ArrowRight, RefreshCw, Download, Zap, TreePine, Waves, Home, Sun, ChevronRight, X, Maximize2, Star } from 'lucide-react'
import ImageUpload from './components/ImageUpload'
import ImageGallery from './components/ImageGallery'

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

interface GenerationHistory {
  id: string;
  image: string;
  prompt: string;
  timestamp: Date;
  visionAnalysis?: string;
}

export default function YardAIPage() {
  // Core state management
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generationCount, setGenerationCount] = useState(0)

  // Enhanced UI state
  const [currentStep, setCurrentStep] = useState(0)
  const [showComparison, setShowComparison] = useState(false)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  
  // New AI features state
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [backyardRanking, setBackyardRanking] = useState<BackyardRanking | null>(null)
  const [isRanking, setIsRanking] = useState(false)
  
  // Track original base image for before/after comparison
  const [originalBaseImage, setOriginalBaseImage] = useState<string | null>(null)

  // NEW: Generation History Gallery
  const [generationHistory, setGenerationHistory] = useState<GenerationHistory[]>([])
  const [currentMainImage, setCurrentMainImage] = useState<string | null>(null)
  const [currentMainPrompt, setCurrentMainPrompt] = useState<string>('')

  // Steps configuration (updated to 4 steps)
  const steps = [
    { title: 'Upload', description: 'Share your backyard photo' },
    { title: 'Analyze & Describe', description: 'AI assessment & your vision' },
    { title: 'Generate', description: 'Watch AI transform' },
    { title: 'Results', description: 'See your new yard' }
  ]

  // Style presets
  const stylePresets = [
    { icon: <Sun className="w-4 h-4" />, label: 'Modern', prompt: 'Transform into a sleek modern backyard with clean lines, contemporary furniture, and minimalist landscaping' },
    { icon: <TreePine className="w-4 h-4" />, label: 'Natural', prompt: 'Create a natural oasis with lush plants, organic shapes, and earthy materials' },
    { icon: <Waves className="w-4 h-4" />, label: 'Resort', prompt: 'Design a resort-style backyard with pool area, tropical plants, and luxury outdoor living spaces' },
    { icon: <Home className="w-4 h-4" />, label: 'Cozy', prompt: 'Make a cozy intimate space with warm lighting, comfortable seating, and charming garden elements' }
  ]

  // All suggestions for fallback
  const allSuggestions = [
    'Replace the gravel with lush green grass and create defined garden borders',
    'Add a swimming pool in the center with beautiful surrounding landscaping',
    'Create a beautiful garden with colorful flowers along the fence and walkways',
    'Add a wooden deck with outdoor furniture and dining area',
    'Install a fire pit area with surrounding seating for cozy gatherings',
    'Add modern landscape lighting throughout for evening ambiance',
    'Create a zen garden with rocks, bamboo features, and peaceful elements',
    'Add a concrete patio with outdoor dining furniture and entertainment space',
    'Install raised garden beds with vegetables, herbs, and organized planting',
    'Add shade trees around the perimeter for natural cooling and beauty',
    'Create a modern outdoor kitchen area with cooking and prep space',
    'Add a water feature or fountain as a stunning centerpiece'
  ]

  // Get comprehensive backyard ranking
  const getBackyardRanking = async (imageUrl: string) => {
    setIsRanking(true)
    try {
      const response = await fetch('/api/rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      })

      if (response.ok) {
        const data = await response.json()
        setBackyardRanking(data.ranking)
      } else {
        setBackyardRanking({
          overall_score: 3.5,
          overall_grade: "B",
          condition_scores: { maintenance: 4, cleanliness: 3, plant_health: 3, structural_condition: 4 },
          summary: "A well-maintained backyard with excellent potential for enhancement",
          top_strengths: ["Clean and well-organized space", "Good structural foundation"],
          improvement_priorities: ["Add more colorful plants", "Enhance lighting"],
          potential_score: 4.5
        })
      }
    } catch (error) {
      console.error('Ranking error:', error)
      setBackyardRanking({
        overall_score: 3.2,
        overall_grade: "B-",
        condition_scores: { maintenance: 3, cleanliness: 3, plant_health: 3, structural_condition: 3 },
        summary: "A backyard with solid foundation and tremendous potential",
        top_strengths: ["Good bones and structure", "Ready for improvement"],
        improvement_priorities: ["Consider landscape improvements", "Add outdoor living elements"],
        potential_score: 4.2
      })
    } finally {
      setIsRanking(false)
    }
  }

  // Get AI recommendations
  const getAIRecommendations = async (imageUrl: string) => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      })

      if (response.ok) {
        const data = await response.json()
        const recommendations = data.recommendations || []
        const processedRecommendations = recommendations.map((rec: string | { suggestion?: string; text?: string; details?: string }) => {
          if (typeof rec === 'object' && rec !== null) {
            return rec.suggestion || rec.text || rec.details || JSON.stringify(rec)
          }
          return String(rec)
        })
        setAiRecommendations(processedRecommendations)
      } else {
        setAiRecommendations([
          'Add colorful flowering plants and garden beds for visual interest',
          'Consider installing outdoor lighting for evening ambiance',
          'Create defined seating areas with comfortable furniture',
          'Add a water feature or fire pit as a focal point',
          'Install pathways and borders to organize the space'
        ])
      }
    } catch (error) {
      console.error('AI analysis error:', error)
      setAiRecommendations([
        'Add lush plants and greenery to enhance the natural beauty',
        'Consider adding outdoor furniture and seating for comfort',
        'Install landscape lighting for beautiful evening use',
        'Create defined areas for different activities',
        'Add decorative elements like planters or garden features'
      ])
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Enhanced image upload handler
  const handleImageUpload = (imageUrl: string) => {
    if (imageUrl) {
      setUploadedImage(imageUrl)
      setOriginalBaseImage(imageUrl) // Track the true original
      setGeneratedImages([])
      setError(null)
      setAiRecommendations([])
      setBackyardRanking(null)
      
      getBackyardRanking(imageUrl)
      getAIRecommendations(imageUrl)
      
      setTimeout(() => setCurrentStep(1), 300)
    } else {
      setUploadedImage(null)
      setOriginalBaseImage(null)
      setGeneratedImages([])
      setAiRecommendations([])
      setBackyardRanking(null)
      setCurrentStep(0)
    }
  }

  // Enhanced generation
  const handleGenerate = async () => {
    if (!uploadedImage || !prompt.trim()) {
      setError('Please upload an image and enter a prompt')
      return
    }

    setIsGenerating(true)
    setCurrentStep(2)
    setError(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: uploadedImage, prompt: prompt.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `API Error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.images && Array.isArray(data.images)) {
        setGeneratedImages(data.images)
        setGenerationCount(prev => prev + 1)
        
        // NEW: Add to generation history
        const newGeneration: GenerationHistory = {
          id: `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          image: data.images[0],
          prompt: prompt.trim(),
          timestamp: new Date(),
          visionAnalysis: data.detailedAnalysis
        }
        
        setGenerationHistory(prev => [newGeneration, ...prev.slice(0, 19)]) // Keep max 20
        setCurrentMainImage(data.images[0])
        setCurrentMainPrompt(prompt.trim())
        
        // Clear the prompt for next generation
        setPrompt('')
        
        setCurrentStep(3)
        setTimeout(() => setShowComparison(true), 500)
      } else {
        throw new Error('Invalid response format')
      }
      
    } catch (error) {
      console.error('Generation error:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate images')
      setCurrentStep(1)
    } finally {
      setIsGenerating(false)
    }
  }

  // NEW: Switch main image from history
  const switchToHistoryImage = (generation: GenerationHistory) => {
    setCurrentMainImage(generation.image)
    setCurrentMainPrompt(generation.prompt)
    setGeneratedImages([generation.image])
  }

  // NEW: Use generated image as new base image
  const useAsBaseImage = (imageUrl: string) => {
    setUploadedImage(imageUrl)
    setCurrentStep(1)
    setGeneratedImages([])
    setCurrentMainImage(null)
    setCurrentMainPrompt('')
    
    // Re-analyze the new base image
    getBackyardRanking(imageUrl)
    getAIRecommendations(imageUrl)
  }

  // NEW: Clear generation history
  const clearHistory = () => {
    setGenerationHistory([])
  }

  const downloadImage = async (imageUrl: string, filename: string = 'backyard-design.png') => {
    try {
      if (imageUrl.startsWith('data:')) {
        const link = document.createElement('a')
        link.href = imageUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
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
    setOriginalBaseImage(null)
    setPrompt('')
    setGeneratedImages([])
    setShowComparison(false)
    setError(null)
    setExpandedImage(null)
    setAiRecommendations([])
    setBackyardRanking(null)
    // Clear generation history on reset
    setGenerationHistory([])
    setCurrentMainImage(null)
    setCurrentMainPrompt('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Enhanced Header */}
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
                  Generations used: {generationCount}/10 • Enhanced with AI Vision
                </p>
              </div>
            </div>
            
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
        {/* Enhanced Error Display */}
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
                Transform Your Backyard with AI Vision
              </h2>
              <p className="text-xl text-gray-600">
                Upload a photo to get AI-powered analysis, personalized recommendations, and stunning transformations
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <ImageUpload onImageUpload={handleImageUpload} />
            </div>
          </div>
        )}

        {/* Step 1: AI Analysis & Chat Interface */}
        {uploadedImage && currentStep === 1 && (
          <div className="transition-all duration-500 opacity-100 scale-100">
            
            {/* CONDENSED AI Analysis Report */}
            <div className="mb-8 bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-3xl p-6 shadow-xl">
              
              {/* Single AI Analysis Header - Show during analysis */}
              {(isRanking || isAnalyzing) && (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mr-3">
                      <RefreshCw className="w-5 h-5 text-white animate-spin" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">AI Analyzing Your Backyard...</h3>
                      <p className="text-sm text-gray-600">Comprehensive analysis in progress</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-blue-600 font-medium">
                      {isRanking && isAnalyzing ? 'Evaluating condition and creating recommendations...' :
                       isRanking ? 'Evaluating maintenance, cleanliness, plant health, and structure...' :
                       'Analyzing layout, style, and creating suggestions...'}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* CONDENSED AI Ranking Results */}
              {!isRanking && !isAnalyzing && backyardRanking && (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">AI Assessment Complete</h3>
                      <p className="text-sm text-gray-600">Professional evaluation of your space</p>
                    </div>
                  </div>

                  {/* Condensed Score Display */}
                  <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          backyardRanking.overall_score >= 4.5 ? 'text-green-600' :
                          backyardRanking.overall_score >= 3.5 ? 'text-blue-600' :
                          backyardRanking.overall_score >= 2.5 ? 'text-yellow-600' :
                          'text-orange-600'
                        }`}>
                          {backyardRanking.overall_score}/5
                        </div>
                        <div className={`text-sm font-bold ${
                          backyardRanking.overall_score >= 4.5 ? 'text-green-600' :
                          backyardRanking.overall_score >= 3.5 ? 'text-blue-600' :
                          backyardRanking.overall_score >= 2.5 ? 'text-yellow-600' :
                          'text-orange-600'
                        }`}>
                          Grade {backyardRanking.overall_grade}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-1">Overall Assessment</h4>
                        <p className="text-gray-600 text-sm">{backyardRanking.summary}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">Potential</div>
                      <div className="text-lg font-bold text-green-600">
                        {backyardRanking.potential_score}/5
                      </div>
                    </div>
                  </div>

                  {/* Condensed Scores Grid */}
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {Object.entries(backyardRanking.condition_scores || {}).map(([category, score]) => (
                      <div key={category} className="bg-white rounded-lg p-2 border border-slate-200 text-center">
                        <div className={`text-lg font-bold ${
                          (score as number) >= 4 ? 'text-green-600' :
                          (score as number) >= 3 ? 'text-blue-600' :
                          (score as number) >= 2 ? 'text-yellow-600' :
                          'text-orange-600'
                        }`}>
                          {score}/5
                        </div>
                        <div className="text-xs text-gray-600 capitalize">
                          {category.replace('_', ' ').substring(0, 12)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Motivational Message */}
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-3 text-center mt-4">
                    <p className="text-blue-700 font-medium text-sm">
                      🚀 {backyardRanking.potential_score > backyardRanking.overall_score 
                        ? `Great potential! You could reach ${backyardRanking.potential_score}/5 with improvements ⭐`
                        : "Your backyard looks fantastic! Let's make it even better! ✨"
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Current Backyard Display */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    Your Current Backyard
                  </h3>
                  <button
                    onClick={resetApp}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
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

            {/* ENHANCED Chat Interface with AI Recommendations */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Sparkles className="w-6 h-6 mr-3" />
                  Describe Your Dream Yard
                </h3>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your vision... (e.g., 'Add a cozy fire pit area with comfortable seating and string lights')"
                className="w-full h-32 p-6 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-700 text-lg mb-6"
              />

              {/* AI Recommendations Section */}
              {!isAnalyzing && aiRecommendations.length > 0 && (
                <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-2xl">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mr-3">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">AI Recommendations for Your Yard</h4>
                  </div>
                  
                  <div className="space-y-2">
                    {aiRecommendations.map((recommendation, index) => (
                      <button
                        key={index}
                        onClick={() => setPrompt(String(recommendation))}
                        className="w-full text-left p-3 bg-white/70 hover:bg-white rounded-xl border border-transparent hover:border-blue-300 transition-all duration-200 text-gray-700 hover:text-blue-700"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{String(recommendation)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Style Presets */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Quick Styles</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {stylePresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(preset.prompt)}
                      className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
                    >
                      {preset.icon}
                      <span className="text-base font-medium group-hover:text-blue-700">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* EXPANDED Quick Elements with new options */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Add Features</h4>
                <div className="flex flex-wrap gap-3">
                  {[
                    { emoji: '🔥', label: 'Fire Pit', text: 'Install a beautiful fire pit area with surrounding comfortable seating for cozy evenings' },
                    { emoji: '🏊', label: 'Pool', text: 'Add a swimming pool with proper decking and elegant pool furniture' },
                    { emoji: '🌿', label: 'Garden', text: 'Create beautiful garden beds with colorful flowers and well-organized plant arrangements' },
                    { emoji: '🌳', label: 'Trees', text: 'Add shade trees and decorative trees around the perimeter for natural beauty' },
                    { emoji: '🪑', label: 'Deck', text: 'Build a wooden deck with outdoor dining and entertainment area' },
                    { emoji: '💡', label: 'Lighting', text: 'Install modern landscape lighting throughout for beautiful evening ambiance' },
                    { emoji: '🍖', label: 'BBQ', text: 'Add a built-in BBQ grill area with outdoor kitchen features and prep space' },
                    { emoji: '💧', label: 'Waterfall', text: 'Install a stunning waterfall feature with natural stone and flowing water' },
                    { emoji: '⛲', label: 'Fountain', text: 'Add an elegant fountain as a centerpiece with beautiful water features' },
                    { emoji: '🗿', label: 'Statues', text: 'Place decorative statues and sculptures throughout for artistic flair' },
                    { emoji: '🌺', label: 'Tropical', text: 'Create a tropical paradise with palm trees, exotic plants, and vibrant colors' },
                    { emoji: '🧘', label: 'Zen', text: 'Design a peaceful zen garden with meditation areas, bamboo, and tranquil elements' }
                  ].map((element, index) => (
                    <button
                      key={index}
                      onClick={() => addToPrompt(element.text)}
                      className="flex items-center space-x-2 px-4 py-3 bg-gray-100 rounded-full hover:bg-blue-100 transition-colors duration-200 text-base group"
                    >
                      <span className="text-lg">{element.emoji}</span>
                      <span className="font-medium group-hover:text-blue-700">{element.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* More Suggestions Dropdown */}
              <details className="mb-6">
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
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-5 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center space-x-3"
              >
                <Zap className="w-6 h-6" />
                <span>Generate My Dream Yard</span>
                <ArrowRight className="w-6 h-6" />
              </button>

              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 text-center">
                  🎯 <strong>Enhanced AI:</strong> Using vision analysis and advanced prompting for the most realistic results!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Enhanced Generating with Scanning Animation */}
        {uploadedImage && currentStep === 2 && (
          <div className="transition-all duration-500 opacity-100 scale-100">
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    AI Vision Analysis in Progress...
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
                    
                    <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm"></div>
                    
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-bounce opacity-80"></div>
                      <div 
                        className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-green-500 to-transparent opacity-60"
                        style={{
                          animation: 'scanVertical 4s linear infinite'
                        }}
                      ></div>
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="grid grid-cols-3 gap-8 opacity-70">
                        {[...Array(9)].map((_, i) => (
                          <div 
                            key={i}
                            className="w-4 h-4 bg-blue-400 rounded-full animate-pulse"
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
                    Our enhanced AI is analyzing your photo with vision technology and designing your perfect backyard...
                  </p>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full animate-pulse"
                      style={{
                        width: '85%',
                        animation: 'progress 4s ease-in-out infinite'
                      }}
                    ></div>
                  </div>
                  
                  <p className="text-base text-blue-600 font-medium">
                    Vision analysis • Understanding layout • Generating transformation...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Enhanced Results - Before/After Comparison */}
        {currentStep === 3 && generatedImages.length > 0 && uploadedImage && (
          <div className={`transition-all duration-500 ${
            showComparison ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Your Transformation Complete! 🎉
              </h2>
              <p className="text-xl text-gray-600">
                Compare your before and after results with AI-enhanced vision technology
              </p>
            </div>

            <div className="max-w-6xl mx-auto mb-8">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-200">
                  <div className="relative">
                    <div className="absolute top-6 left-6 bg-black/70 text-white px-6 py-3 rounded-full text-xl font-bold z-10">
                      Before
                    </div>
                    <div className="h-96 bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={originalBaseImage || uploadedImage}
                        alt="Before transformation"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-green-200 group cursor-pointer relative"
                     onClick={() => setExpandedImage(currentMainImage || generatedImages[0])}>
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
                        src={currentMainImage || generatedImages[0]}
                        alt="After transformation"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Download button aligned right under the output image */}
              <div className="flex justify-end mt-4">
                <button 
                  onClick={() => downloadImage(currentMainImage || generatedImages[0], 'dream-backyard.png')}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
                >
                  <Download className="w-5 h-5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* NEW: Generation History Carousel */}
            {generationHistory.length > 0 && (
              <div className="mt-8">
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generation History ({generationHistory.length})
                      </h3>
                      <p className="text-sm text-gray-600">
                        {currentMainPrompt && `Current: &ldquo;${currentMainPrompt.length > 50 ? currentMainPrompt.substring(0, 50) + '...' : currentMainPrompt}&rdquo;`}
                      </p>
                    </div>
                    <button
                      onClick={clearHistory}
                      className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                    >
                      Clear History
                    </button>
                  </div>

                  {/* Horizontal Scrolling Carousel */}
                  <div className="overflow-x-auto">
                    <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
                      {generationHistory.map((generation, index) => (
                        <div
                          key={generation.id}
                          className={`flex-shrink-0 transition-all duration-300 ${
                            currentMainImage === generation.image 
                              ? 'ring-4 ring-blue-500 ring-opacity-50' 
                              : 'hover:ring-2 hover:ring-gray-300'
                          }`}
                        >
                          <div className="relative group">
                            <div 
                              className="bg-gray-100 rounded-xl overflow-hidden cursor-pointer" 
                              style={{ width: '200px', height: '120px' }}
                              onClick={() => switchToHistoryImage(generation)}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={generation.image}
                                alt={`Generation ${generationHistory.length - index}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            {/* NEW: Use as Base Image button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                useAsBaseImage(generation.image)
                              }}
                              className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
                            >
                              Use as Base
                            </button>
                          </div>
                          
                          <div className="mt-2 px-2">
                            <div className="text-xs text-gray-500 mb-1">
                              Gen {generationHistory.length - index} • {generation.timestamp.toLocaleTimeString()}
                            </div>
                            <div 
                              className="text-xs text-gray-700 leading-tight cursor-pointer"
                              style={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                maxWidth: '180px'
                              }}
                              title={generation.prompt}
                              onClick={() => switchToHistoryImage(generation)}
                            >
                              {generation.prompt}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Carousel Instructions */}
                  <div className="text-center text-sm text-gray-500 mt-2">
                    Click any image to make it the main result • Use &ldquo;Use as Base&rdquo; to build upon previous generations
                  </div>
                </div>
              </div>
            )}

            {/* NEW: Prompt Interface directly under Generation History */}
            {currentStep === 3 && (
              <div className="mt-8 bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Sparkles className="w-6 h-6 mr-3" />
                    Create Another Variation
                  </h3>
                </div>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your next vision... (e.g., 'Add more tropical plants and a water feature')"
                  className="w-full h-32 p-6 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-700 text-lg mb-6"
                />

                {/* Enhanced Style Presets */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Quick Styles</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {stylePresets.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => setPrompt(preset.prompt)}
                        className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
                      >
                        {preset.icon}
                        <span className="text-base font-medium group-hover:text-blue-700">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* EXPANDED Quick Elements */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Add Features</h4>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { emoji: '🔥', label: 'Fire Pit', text: 'Install a beautiful fire pit area with surrounding comfortable seating for cozy evenings' },
                      { emoji: '🏊', label: 'Pool', text: 'Add a swimming pool with proper decking and elegant pool furniture' },
                      { emoji: '🌿', label: 'Garden', text: 'Create beautiful garden beds with colorful flowers and well-organized plant arrangements' },
                      { emoji: '🌳', label: 'Trees', text: 'Add shade trees and decorative trees around the perimeter for natural beauty' },
                      { emoji: '🪑', label: 'Deck', text: 'Build a wooden deck with outdoor dining and entertainment area' },
                      { emoji: '💡', label: 'Lighting', text: 'Install modern landscape lighting throughout for beautiful evening ambiance' },
                      { emoji: '🍖', label: 'BBQ', text: 'Add a built-in BBQ grill area with outdoor kitchen features and prep space' },
                      { emoji: '💧', label: 'Waterfall', text: 'Install a stunning waterfall feature with natural stone and flowing water' },
                      { emoji: '⛲', label: 'Fountain', text: 'Add an elegant fountain as a centerpiece with beautiful water features' },
                      { emoji: '🗿', label: 'Statues', text: 'Place decorative statues and sculptures throughout for artistic flair' },
                      { emoji: '🌺', label: 'Tropical', text: 'Create a tropical paradise with palm trees, exotic plants, and vibrant colors' },
                      { emoji: '🧘', label: 'Zen', text: 'Design a peaceful zen garden with meditation areas, bamboo, and tranquil elements' }
                    ].map((element, index) => (
                      <button
                        key={index}
                        onClick={() => addToPrompt(element.text)}
                        className="flex items-center space-x-2 px-4 py-3 bg-gray-100 rounded-full hover:bg-blue-100 transition-colors duration-200 text-base group"
                      >
                        <span className="text-lg">{element.emoji}</span>
                        <span className="font-medium group-hover:text-blue-700">{element.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-5 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center space-x-3"
                >
                  <Zap className="w-6 h-6" />
                  <span>Generate Next Variation</span>
                  <ArrowRight className="w-6 h-6" />
                </button>

                <div className="text-center mt-6">
                  <button
                    onClick={resetApp}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200 text-lg"
                  >
                    Start a new transformation
                  </button>
                </div>
              </div>
            )}
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
                Additional AI-generated designs for your backyard
              </p>
            </div>

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

      {/* Enhanced Expanded Image Modal */}
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
              <h3 className="text-white text-2xl font-bold mb-2">Your AI-Enhanced Dream Backyard</h3>
              {/* Show prompt if it's from history */}
              {currentMainPrompt && expandedImage === currentMainImage && (
                <p className="text-white/90 text-sm mb-3">&ldquo;{currentMainPrompt}&rdquo;</p>
              )}
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