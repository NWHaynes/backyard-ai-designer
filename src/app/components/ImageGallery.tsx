'use client'

import React, { useState, useEffect } from 'react'

interface ImageGalleryProps {
  images: string[]
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [imageStates, setImageStates] = useState<{ [key: number]: 'loading' | 'loaded' | 'error' }>({})
  const [imageBlobUrls, setImageBlobUrls] = useState<{ [key: number]: string }>({})

  console.log('🖼️ ImageGallery rendered with:', {
    imageCount: images.length,
    firstImageLength: images[0]?.length,
    firstImageStart: images[0]?.substring(0, 50),
    isDataUrl: images[0]?.startsWith('data:image/')
  })

  useEffect(() => {
    console.log('🔄 Converting base64 images to blob URLs...')
    
    const convertImagesToBlobs = async () => {
      const newBlobUrls: { [key: number]: string } = {}
      const newStates: { [key: number]: 'loading' | 'loaded' | 'error' } = {}
      
      for (let index = 0; index < images.length; index++) {
        const imageUrl = images[index]
        
        if (imageUrl.startsWith('data:image/')) {
          try {
            console.log(`🔄 Converting image ${index + 1} from base64 to blob...`)
            
            // Convert base64 to blob
            const response = await fetch(imageUrl)
            const blob = await response.blob()
            const blobUrl = URL.createObjectURL(blob)
            
            newBlobUrls[index] = blobUrl
            newStates[index] = 'loading' // Will be set to 'loaded' by onLoad
            
            console.log(`✅ Created blob URL for image ${index + 1}:`, blobUrl.substring(0, 50))
          } catch (error) {
            console.error(`❌ Failed to convert image ${index + 1} to blob:`, error)
            newStates[index] = 'error'
          }
        } else {
          // Regular URL
          newBlobUrls[index] = imageUrl
          newStates[index] = 'loading'
        }
      }
      
      setImageBlobUrls(newBlobUrls)
      setImageStates(newStates)
    }
    
    if (images.length > 0) {
      convertImagesToBlobs()
    }
    
    // Cleanup blob URLs when component unmounts or images change
    return () => {
      Object.values(imageBlobUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [images]) // eslint-disable-line react-hooks/exhaustive-deps

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      if (imageUrl.startsWith('data:')) {
        const link = document.createElement('a')
        link.href = imageUrl
        link.download = `backyard-design-${index + 1}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `backyard-design-${index + 1}.png`
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

  const handleImageLoad = (index: number) => {
    console.log(`✅ Image ${index + 1} loaded successfully from blob URL`)
    setImageStates(prev => ({ ...prev, [index]: 'loaded' }))
  }

  const handleImageError = (index: number) => {
    console.error(`❌ Image ${index + 1} failed to load from blob URL`)
    setImageStates(prev => ({ ...prev, [index]: 'error' }))
  }

  if (images.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Generated Designs</h2>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-500">
            Your generated backyard designs will appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">
        Generated Designs ({images.length})
      </h2>
      
      <div className="space-y-6">
        {images.map((originalImageUrl, index) => {
          const currentState = imageStates[index] || 'loading'
          const blobUrl = imageBlobUrls[index]
          
          console.log(`🖼️ Rendering image ${index + 1}, state: ${currentState}, has blob: ${!!blobUrl}`)
          
          return (
            <div key={index} className="relative group">
              {/* Image Container */}
              <div className="w-full h-80 bg-gray-200 rounded-lg overflow-hidden shadow-md relative">
                {/* Loading State */}
                {currentState === 'loading' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <div className="text-gray-500">Loading image...</div>
                    </div>
                  </div>
                )}
                
                {/* Error State */}
                {currentState === 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
                    <div className="text-center text-red-600">
                      <div className="text-lg mb-2">❌</div>
                      <div>Failed to load image</div>
                      <div className="text-sm mt-1">Check browser console for details</div>
                    </div>
                  </div>
                )}

                {/* The actual image using blob URL */}
                {blobUrl && (
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={blobUrl}
                    alt={`Generated backyard design ${index + 1}`}
                    className="w-full h-full object-contain bg-white"
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                    style={{
                      display: 'block',
                      opacity: currentState === 'loaded' ? 1 : 0
                    }}
                  />
                )}
              </div>
              
              {/* Download Button */}
              <button
                onClick={() => downloadImage(originalImageUrl, index)}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download Design {index + 1}
              </button>
              
              <div className="mt-2 text-center text-sm text-gray-600">
                Design Variant {index + 1} - State: {currentState}
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <p className="text-sm text-green-700">
          💡 <strong>Tip:</strong> Try different prompts to explore various design styles and features for your backyard!
        </p>
      </div>
    </div>
  )
}

export default ImageGallery
