/**
 * Image optimization utilities
 * - Compress images before upload
 * - Resize images to multiple sizes
 * - Convert to WebP format (optional)
 */

export interface ImageCompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'webp' | 'png'
}

const DEFAULT_OPTIONS: Required<ImageCompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  format: 'jpeg',
}

/**
 * Compress and resize image
 * @param file Original image file
 * @param options Compression options
 * @returns Compressed Blob
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions
        if (width > opts.maxWidth || height > opts.maxHeight) {
          const ratio = Math.min(
            opts.maxWidth / width,
            opts.maxHeight / height
          )
          width = width * ratio
          height = height * ratio
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        // Draw image with better quality
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          `image/${opts.format}`,
          opts.quality
        )
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Get file size in MB
 */
export function getFileSizeMB(file: File | Blob): number {
  return file.size / (1024 * 1024)
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

/**
 * Check if image needs compression
 * @param file Image file
 * @param maxSizeMB Maximum size in MB (default: 1MB)
 * @returns true if compression is needed
 */
export function needsCompression(file: File, maxSizeMB: number = 1): boolean {
  return getFileSizeMB(file) > maxSizeMB
}

/**
 * Compress multiple images
 */
export async function compressImages(
  files: File[],
  options: ImageCompressionOptions = {}
): Promise<Blob[]> {
  const results = await Promise.allSettled(
    files.map((file) => compressImage(file, options))
  )

  return results
    .filter((result): result is PromiseFulfilledResult<Blob> => 
      result.status === 'fulfilled'
    )
    .map((result) => result.value)
}

/**
 * Create thumbnail from image
 * @param file Original image file
 * @param size Thumbnail size (default: 300x300)
 * @returns Thumbnail Blob
 */
export async function createThumbnail(
  file: File,
  size: number = 300
): Promise<Blob> {
  return compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'jpeg',
  })
}

