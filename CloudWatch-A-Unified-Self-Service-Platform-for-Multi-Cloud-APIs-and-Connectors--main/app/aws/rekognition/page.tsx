'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, Image as ImageIcon, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { analyzeImage } from '@/lib/api'

export default function RekognitionPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setResults(null)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    try {
      const data = await analyzeImage(selectedImage)
      setResults(data.results)
      toast.success('Image analysis complete!')
    } catch (error) {
      console.error('Failed to analyze image:', error)
      toast.error('Failed to analyze image. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <Link
          href="/aws"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to AWS Services
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Amazon Rekognition</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary"
                onClick={() => document.getElementById('image-input')?.click()}
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-64 object-contain mb-4"
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                )}
                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <p className="text-sm text-muted-foreground">
                  Click to select or drag and drop an image
                </p>
              </div>
              <Button
                className="w-full"
                disabled={!selectedImage || isAnalyzing}
                onClick={handleAnalyze}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Analyze Image
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {results.labels && results.labels.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Labels Detected:</h3>
                    <div className="space-y-1">
                      {results.labels.map((label: any, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span>{label.Name}</span>
                          <span className="text-muted-foreground">
                            {label.Confidence.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.faces && results.faces.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Face Analysis:</h3>
                    <div className="space-y-4">
                      {results.faces.map((face: any, index: number) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p>Age: {face.AgeRange.Low}-{face.AgeRange.High} years</p>
                              <p>Gender: {face.Gender.Value}</p>
                              <p>Smile: {face.Smile.Value ? 'Yes' : 'No'} ({face.Smile.Confidence.toFixed(1)}%)</p>
                              <p>Eyes Open: {face.EyesOpen.Value ? 'Yes' : 'No'}</p>
                              <p>Mouth Open: {face.MouthOpen.Value ? 'Yes' : 'No'}</p>
                            </div>
                            <div>
                              <p className="font-medium">Emotions:</p>
                              {face.Emotions.sort((a: any, b: any) => b.Confidence - a.Confidence)
                                .map((emotion: any, i: number) => (
                                  <p key={i} className="text-sm">
                                    {emotion.Type}: {emotion.Confidence.toFixed(1)}%
                                  </p>
                                ))}
                            </div>
                          </div>
                          {face.Quality && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              Quality Score: {face.Quality.Brightness.toFixed(1)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.text && results.text.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Text Detected:</h3>
                    <div className="space-y-1">
                      {results.text.map((text: any, index: number) => (
                        <div key={index}>{text.DetectedText}</div>
                      ))}
                    </div>
                  </div>
                )}

                {results.ppe && results.ppe.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Safety Equipment:</h3>
                    <div className="space-y-2">
                      {results.ppe.map((person: any, index: number) => (
                        <div key={index} className="text-sm">
                          <p>Person {index + 1}:</p>
                          <ul className="list-disc list-inside pl-4">
                            {person.BodyParts.map((part: any, i: number) => (
                              <li key={i}>
                                {part.Name}: {part.EquipmentDetections.length > 0 
                                  ? part.EquipmentDetections.map((eq: any) => eq.Type).join(', ')
                                  : 'No equipment detected'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.dominant_colors && (
                  <div>
                    <h3 className="font-semibold mb-2">Color Analysis:</h3>
                    <div className="flex gap-2">
                      {results.dominant_colors.map((color: any, index: number) => (
                        <div key={index} className="text-center">
                          <div 
                            className="w-10 h-10 rounded-full border"
                            style={{ backgroundColor: color.color }}
                          />
                          <div className="text-xs mt-1">{color.percentage.toFixed(1)}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.celebrities && results.celebrities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Celebrity Matches:</h3>
                    <div className="space-y-2">
                      {results.celebrities.map((celeb: any, index: number) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <div className="font-medium">{celeb.Name}</div>
                          <div className="text-sm text-muted-foreground">
                            Confidence: {celeb.MatchConfidence.toFixed(1)}%
                          </div>
                          {celeb.Urls && (
                            <div className="text-sm text-blue-500">
                              <a href={celeb.Urls[0]} target="_blank" rel="noopener noreferrer">
                                Learn More
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 