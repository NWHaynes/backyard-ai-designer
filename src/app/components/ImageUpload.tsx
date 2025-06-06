'use client'

import React, { useState, useRef } from 'react'

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload }) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Function to compress/resize image
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setUploadProgress('Loading image...')
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        try {
          setUploadProgress('Resizing image...')
          
          // Calculate new dimensions (max 1024x1024, maintain aspect ratio)
          const maxSize = 1024
          let { width, height } = img
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height
              height = maxSize
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          setUploadProgress('Compressing image...')
          
          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height)
          
          // Convert to base64 with compression (0.8 quality)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8)
          
          setUploadProgress('Finalizing...')
          resolve(compressedDataUrl)
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      console.log('No files selected')
      return
    }

    const file = files[0]
    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeMB: (file.size / 1024 / 1024).toFixed(2)
    })

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, etc.)')
      return
    }

    // Validate file size (50MB limit for initial upload)
    if (file.size > 50 * 1024 * 1024) {
      alert('Please upload an image smaller than 50MB')
      return
    }

    setIsUploading(true)
    setUploadProgress('Starting upload...')

    try {
      console.log('Starting image compression...')

      // Compress the image
      const compressedDataUrl = await compressImage(file)
      
      console.log('Image compressed successfully:', {
        originalSize: file.size,
        compressedLength: compressedDataUrl.length,
        compressionRatio: ((file.size - compressedDataUrl.length) / file.size * 100).toFixed(1) + '%'
      })
      
      // Set preview image
      setUploadedImage(compressedDataUrl)
      
      // Call parent callback
      onImageUpload(compressedDataUrl)
      
      console.log('✅ Image upload completed successfully')
      
    } catch (error) {
      console.error('❌ Upload error:', error)
      alert('Error processing image. Please try a different image or try again.')
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } finally {
      setIsUploading(false)
      setUploadProgress('')
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    console.log('Files dropped:', e.dataTransfer.files.length)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed, files:', e.target.files?.length || 0)
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleClick = () => {
    if (isUploading) return
    
    console.log('Upload area clicked')
    
    // Reset the input value to ensure onChange fires even for the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  const handleRemove = () => {
    console.log('Removing uploaded image')
    setUploadedImage(null)
    onImageUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
        Upload Your Backyard Photo
      </h2>

      {!uploadedImage ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          } ${isUploading ? 'pointer-events-none opacity-75' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600 font-medium">Processing your image...</p>
              <p className="text-sm text-blue-600 mt-1">{uploadProgress}</p>
              <p className="text-xs text-gray-500 mt-2">This may take a moment for large images</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
              </svg>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag and drop your backyard photo here
              </p>
              <p className="text-gray-500 mb-2">or click to browse files</p>
              <p className="text-sm text-gray-400">
                 Supported formats: JPG, PNG, GIF (max 50MB)
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border-2 border-green-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uploadedImage}
              alt="Uploaded backyard"
              className="w-full h-64 object-cover"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center justify-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-700 font-medium">Photo processed and ready!</span>
          </div>
          
          <p className="text-sm text-gray-600 text-center">
            Now describe your dream backyard design below
          </p>
        </div>
      )}
    </div>
  )
}

export default ImageUpload
