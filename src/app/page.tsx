'use client'

import React, { useState } from 'react'
import { Camera, Sparkles, ArrowRight, RefreshCw, Download, Share2, Zap, TreePine, Waves, Home, Sun, ChevronRight, X, Maximize2, Star, Upload, Wand2, ArrowLeft } from 'lucide-react'
import ImageUpload from './components/ImageUpload'
import ImageGallery from './components/ImageGallery'

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
  const [backyardRanking, setBackyardRanking] = useState<any>(null)
  const [isRanking, setIsRanking] = useState(false)

  // Steps configuration
  const steps = [
    { title: 'Upload', description: 'Share your backyard photo' },
    { title: 'Analyze', description: 'AI assessment & recommendations' },
    { title: 'Describe', description: 'Tell us your vision' },
    { title: 'Generate', description: 'Watch AI transform' },
    { title: 'Results', description: 'See your new yard' }
  ]

  // Style presets (enhanced with more variety)
  const stylePresets = [
    { icon: <Sun className="w-4 h-4" />, label: 'Modern', prompt: 'Transform into a sleek modern backyard with clean lines, contemporary furniture, and minimalist landscaping with geometric patterns' },
    { icon: <TreePine className="w-4 h-4" />, label: 'Natural', prompt: 'Create a natural oasis with lush plants, organic shapes, native trees, and earthy materials that blend with nature' },
    { icon: <Waves className="w-4 h-4" />, label: 'Resort', prompt: 'Design a resort-style backyard with pool area, tropical plants, luxury outdoor living spaces, and vacation-like ambiance' },
    { icon: <Home className="w-4 h-4" />, label: 'Cozy', prompt: 'Make a cozy intimate space with warm lighting, comfortable seating areas, fire pit, and charming garden elements' }
  ]

  // Quick elements (expanded options)
  const quickElements = [
    { emoji: '🔥', label: 'Fire Pit', text: 'Install a beautiful fire pit area with surrounding comfortable seating for cozy evenings' },
    { emoji: '🏊', label: 'Pool', text: 'Add a swimming pool with proper decking and elegant pool furniture' },
    { emoji: '🌿', label: 'Garden', text: 'Create beautiful garden beds with colorful flowers and well-organized plant arrangements' },
    { emoji: '🌳', label: 'Trees', text: 'Add shade trees and decorative trees around the perimeter for natural beauty' },
    { emoji: '🪑', label: 'Deck', text: 'Build a wooden deck with outdoor dining and entertainment area' },
    { emoji: '💡', label: 'Lighting', text: 'Install modern landscape lighting throughout for beautiful evening ambiance' }
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
    'Add a water feature or fountain as a stunning centerpiece',
    'Install a pergola or gazebo for shade and architectural interest',
    'Create defined pathways with decorative stones or pavers',
    'Add privacy screening with tall plants or attractive fencing'
  ]

  // Get comprehensive backyard ranking (enhanced from your local version)
  const getBackyardRanking = async (imageUrl: string) => {
    setIsRanking(true)
    try {
      console.log('🏆 Getting AI backyard ranking...')
      const response = await fetch('/api/rank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setBackyardRanking(data.ranking)
        console.log('✅ Backyard ranking complete:', data)
      } else {
        console.log('❌ Ranking failed, using enhanced fallback')
        setBackyardRanking({
          overall_score: 3.5,
          overall_grade: "B",
          condition_scores: {
            maintenance: 4,
            cleanliness: 3,
            plant_health: 3,
            structural_condition: 4
          },
          summary: "A well-maintained backyard with excellent potential for enhancement and creative improvements",
          top_strengths: ["Clean and well-organized space", "Good structural foundation", "Ready for transformation"],
          improvement_priorities: ["Add more colorful plants and flowers", "Enhance lighting for evening use", "Create more defined outdoor living areas"],
          potential_score: 4.5
        })
      }
    } catch (error) {
      console.error('Ranking error:', error)
      setBackyardRanking({
        overall_score: 3.2,
        overall_grade: "B-",
        condition_scores: {
          maintenance: 3,
          cleanliness: 3,
          plant_health: 3,
          structural_condition: 3
        },
        summary: "A backyard with solid foundation and tremendous potential for creative transformation",
        top_strengths: ["Good bones and structure", "Ready for improvement", "Great canvas for design"],
        improvement_priorities: ["Upload clearer image for detailed analysis", "Consider landscape improvements", "Add outdoor living elements"],
        potential_score: 4.2
      })
    } finally {
      setIsRanking(false)
    }
  }

  // Get AI recommendations (enhanced from your local version)
  const getAIRecommendations = async (imageUrl: string) => {
    setIsAnalyzing(true)
    try {
      console.log('🧠 Getting AI personalized recommendations...')
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Ensure we're getting an array of strings, not objects
        const recommendations = data.recommendations || []
        const processedRecommendations = recommendations.map((rec: any) => {
          // If it's an object, extract the text/suggestion field
          if (typeof rec === 'object' && rec !== null) {
            return rec.suggestion || rec.text || rec.details || JSON.stringify(rec)
          }
          // If it's already a string, use it
          return String(rec)
        })
        setAiRecommendations(processedRecommendations)
        console.log('✅ AI Analysis complete:', data)
      } else {
        console.log('❌ AI Analysis failed, using enhanced fallback suggestions')
        setAiRecommendations([
          'Add colorful flowering plants and garden beds for visual interest and natural beauty',
          'Consider installing outdoor lighting for evening ambiance and extended usability',
          'Create defined seating areas with comfortable furniture for entertaining and relaxation',
          'Add a water feature or fire pit as a stunning focal point for the space',
          'Install pathways and borders to organize the space and improve flow'
        ])
      }
    } catch (error) {
      console.error('AI analysis error:', error)
      setAiRecommendations([
        'Add lush plants and greenery to enhance the natural beauty of your space',
        'Consider adding outdoor furniture and seating for comfort and functionality',
        'Install landscape lighting for beautiful evening use and safety',
        'Create defined areas for different activities like dining and relaxation',
        'Add decorative elements like planters or garden features for visual interest'
      ])
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Enhanced image upload handler with AI features
  const handleImageUpload = (imageUrl: string) => {
    if (imageUrl) {
      setUploadedImage(imageUrl)
      setGeneratedImages([]) // Clear previous results
      setError(null)
      setAiRecommendations([]) // Clear previous recommendations
      setBackyardRanking(null) // Clear previous ranking
      
      // Trigger AI analysis automatically
      getBackyardRanking(imageUrl)
      getAIRecommendations(imageUrl)
      
      setTimeout(() => setCurrentStep(1), 300) // Move to analysis step
    } else {
      setUploadedImage(null)
      setGeneratedImages([])
      setAiRecommendations([])
      setBackyardRanking(null)
      setCurrentStep(0) // Go back to upload step
    }
  }

  // Enhanced generation with vision analysis
  const handleGenerate = async () => {
    if (!uploadedImage || !prompt.trim()) {
      setError('Please upload an image and enter a prompt')
      return
    }

    setIsGenerating(true)
    setCurrentStep(3) // Move to generating step
    setError(null)

    try {
      console.log('🚀 Starting enhanced generation with AI vision analysis...')
      
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

      console.log('📡 Enhanced API Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.error || `API Error: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Enhanced API Response data received')
      
      if (data.images && Array.isArray(data.images)) {
        setGeneratedImages(data.images)
        setGenerationCount(prev => prev + 1)
        setCurrentStep(4) // Move to results step
        setTimeout(() => setShowComparison(true), 500)
        console.log('🖼️ Images set:', data.images.length)
        if (data.visionAnalysis) {
          console.log('🔍 Vision analysis used:', data.visionAnalysis)
        }
      } else {
        throw new Error('Invalid response format')
      }
      
    } catch (error) {
      console.error('❌ Generation error:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate images')
      setCurrentStep(2) // Go back to prompt step on error
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate another variation - go back to step 2
  const handleGenerateAnother = () => {
    setCurrentStep(2)
    setShowComparison(false)
  }

  // Download image function
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
    setPrompt('')
    setGeneratedImages([])
    setShowComparison(false)
    setError(null)
    setExpandedImage(null)
    setAiRecommendations([])
    setBackyardRanking(null)
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
            
            {/* Enhanced Progress Steps */}
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

        {/* Step 1: AI Analysis & Assessment */}
        {uploadedImage && currentStep === 1 && (
          <div className="transition-all duration-500 opacity-100 scale-100">
            
            {/* SINGLE AI Analysis Section - Combined Ranking & Recommendations */}
            <div className="mb-8 bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-3xl p-8 shadow-xl">
              
              {/* Single AI Analysis Header - Show during both ranking and recommendations */}
              {(isRanking || isAnalyzing) && (
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mr-4">
                      <RefreshCw className="w-6 h-6 text-white animate-spin" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        AI is analyzing your backyard...
                      </h3>
                      <p className="text-gray-600">
                        Comprehensive analysis and personalized recommendations in progress
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="animate-pulse text-blue-600 text-lg font-medium">
                        {isRanking && isAnalyzing ? 'Evaluating condition and creating personalized recommendations...' :
                         isRanking ? 'Evaluating maintenance, cleanliness, plant health, and structural condition...' :
                         'Analyzing layout, style, and creating personalized suggestions...'}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full animate-pulse" style={{width: '70%'}}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Ranking Results - Show when ranking is complete */}
              {!isRanking && backyardRanking && (
                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">Professional AI Assessment</h3>
                      <p className="text-gray-600">Complete evaluation of your outdoor space</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Enhanced Overall Score Display */}
                    <div className="flex items-center justify-between bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className={`text-4xl font-bold ${
                            backyardRanking.overall_score >= 4.5 ? 'text-green-600' :
                            backyardRanking.overall_score >= 3.5 ? 'text-blue-600' :
                            backyardRanking.overall_score >= 2.5 ? 'text-yellow-600' :
                            'text-orange-600'
                          }`}>
                            {backyardRanking.overall_score}/5
                          </div>
                          <div className={`text-xl font-bold ${
                            backyardRanking.overall_score >= 4.5 ? 'text-green-600' :
                            backyardRanking.overall_score >= 3.5 ? 'text-blue-600' :
                            backyardRanking.overall_score >= 2.5 ? 'text-yellow-600' :
                            'text-orange-600'
                          }`}>
                            Grade {backyardRanking.overall_grade}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 mb-2 text-lg">Overall Assessment</h4>
                          <p className="text-gray-600">{backyardRanking.summary}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Potential Score</div>
                        <div className="text-2xl font-bold text-green-600">
                          {backyardRanking.potential_score}/5
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          With improvements
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Detailed Scores Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(backyardRanking.condition_scores || {}).map(([category, score]) => (
                        <div key={category} className="bg-white rounded-xl p-4 border border-slate-200 text-center shadow-sm">
                          <div className={`text-2xl font-bold mb-1 ${
                            score >= 4 ? 'text-green-600' :
                            score >= 3 ? 'text-blue-600' :
                            score >= 2 ? 'text-yellow-600' :
                            'text-orange-600'
                          }`}>
                            {score}/5
                          </div>
                          <div className="text-sm text-gray-600 capitalize font-medium">
                            {category.replace('_', ' ')}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Enhanced Strengths and Improvements */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                        <h5 className="font-bold text-green-800 mb-4 flex items-center text-lg">
                          <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                          Top Strengths
                        </h5>
                        <ul className="space-y-2">
                          {(backyardRanking.top_strengths || []).map((strength, index) => (
                            <li key={index} className="text-green-700 flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                        <h5 className="font-bold text-blue-800 mb-4 flex items-center text-lg">
                          <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                          Priority Improvements
                        </h5>
                        <ul className="space-y-2">
                          {(backyardRanking.improvement_priorities || []).map((improvement, index) => (
                            <li key={index} className="text-blue-700 flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Enhanced Motivational Message with blue/green gradient */}
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-2xl p-6 text-center">
                      <div className="text-2xl mb-2">🚀</div>
                      <p className="text-blue-700 font-semibold text-lg">
                        {backyardRanking.potential_score > backyardRanking.overall_score 
                          ? `Amazing potential! With some improvements, you could reach ${backyardRanking.potential_score}/5 ⭐`
                          : "Your backyard is already looking fantastic! Let's make it even better! ✨"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Recommendations Results - Show when analysis is complete */}
              {!isAnalyzing && aiRecommendations.length > 0 && (
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mr-4">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">Personalized AI Recommendations</h3>
                      <p className="text-gray-600">Custom suggestions tailored for your yard</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {aiRecommendations.map((recommendation, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setPrompt(String(recommendation))
                          setCurrentStep(2)
                        }}
                        className="w-full text-left p-5 bg-white/70 hover:bg-white rounded-2xl border border-transparent hover:border-blue-300 transition-all duration-300 text-gray-700 hover:text-blue-700 shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-base font-medium">{String(recommendation)}</span>
                          <ArrowRight className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                        </div>
                      </button>
                    ))}
                    <div className="text-center mt-6">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                      >
                        <span>Continue to Custom Prompt</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-blue-600 text-center mt-4">
                      💡 Click any recommendation to use it, or continue to write your own custom vision
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Current Backyard Display */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
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
          </div>
        )}

        {/* Step 2: Enhanced Describe Your Dream Yard */}
        {currentStep === 2 && (
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

            {/* Enhanced Prompt interface */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Sparkles className="w-6 h-6 mr-3" />
                    Describe Your Dream Yard
                  </h3>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                </div>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your vision... (e.g., 'Add a cozy fire pit area with comfortable seating and string lights')"
                  className="w-full h-40 p-6 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-700 text-lg"
                />

                {/* Enhanced Style Presets */}
                <div className="mt-8">
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

                {/* Enhanced Quick Elements */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Add Elements</h4>
                  <div className="flex flex-wrap gap-3">
                    {quickElements.map((element, index) => (
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

                {/* Enhanced All Suggestions Dropdown */}
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
                    🎯 <strong>Enhanced AI:</strong> Using vision analysis and advanced prompting for the most realistic results!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Enhanced Generating with Scanning Animation */}
        {uploadedImage && currentStep === 3 && (
          <div className="transition-all duration-500 opacity-100 scale-100">
            {/* Enhanced uploaded image with scanning animation */}
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
                    
                    {/* Enhanced blur overlay */}
                    <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm"></div>
                    
                    {/* Enhanced scanning line animation */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-bounce opacity-80"></div>
                      <div 
                        className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-green-500 to-transparent opacity-60"
                        style={{
                          animation: 'scanVertical 4s linear infinite'
                        }}
                      ></div>
                    </div>
                    
                    {/* Enhanced analysis points */}
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

            {/* Enhanced Creating Your Dream Yard animation */}
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
                  
                  {/* Enhanced progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full animate-pulse"
                      style={{
                        width: '85%',
                        animation: 'progress 4s ease-in-out infinite'
                      }}
                    ></div>
                  </div>
                  
                  {/* Enhanced status text */}
                  <p className="text-base text-blue-600 font-medium">
                    Vision analysis • Understanding layout • Generating transformation...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Enhanced Results - Before/After Comparison */}
        {currentStep === 4 && generatedImages.length > 0 && uploadedImage && (
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

            {/* Enhanced Before/After Split-Screen */}
            <div className="max-w-6xl mx-auto mb-8">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Enhanced Before Box */}
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

                {/* Enhanced After Box - Clickable with expand */}
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

            {/* Enhanced Action Buttons */}
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

              {/* Enhanced Start Over */}
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

        {/* Step 4: Additional Results - Extra Generated Images */}
        {currentStep === 4 && generatedImages.length > 1 && (
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

            {/* Show remaining images in enhanced gallery */}
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

      {/* Enhanced Custom CSS for animations */}
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