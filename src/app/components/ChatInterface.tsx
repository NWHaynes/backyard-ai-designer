'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface ChatInterfaceProps {
  onGenerate: (prompt: string) => void
  isLoading: boolean
  disabled: boolean
}

export default function ChatInterface({ onGenerate, isLoading, disabled }: ChatInterfaceProps) {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim() && !isLoading && !disabled) {
      onGenerate(prompt.trim())
      setPrompt('')
    }
  }

  const suggestionPrompts = [
    "Add a swimming pool in the center",
    "Create a beautiful garden with colorful flowers",
    "Add a wooden deck with outdoor furniture",
    "Install modern landscape lighting",
    "Create a zen garden with rocks and bamboo",
    "Add a fire pit area with seating"
  ]

  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading && !disabled) {
      onGenerate(suggestion)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Describe Your Dream Backyard</h2>
      
      {/* Suggestion Chips */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Try these suggestions:</p>
        <div className="flex flex-wrap gap-2">
          {suggestionPrompts.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isLoading || disabled}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to see in your backyard... (e.g., 'Add a swimming pool and some palm trees')"
            className="w-full p-4 pr-12 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            disabled={isLoading || disabled}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading || disabled}
            className="absolute bottom-3 right-3 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>

        {disabled && (
          <p className="text-red-500 text-sm">
            You&apos;ve reached the 10 generation limit for this session.
          </p>
        )}

        {isLoading && (
          <p className="text-blue-500 text-sm">
            Generating your dream backyard... This may take 10-20 seconds.
          </p>
        )}
      </form>
    </div>
  )
}
