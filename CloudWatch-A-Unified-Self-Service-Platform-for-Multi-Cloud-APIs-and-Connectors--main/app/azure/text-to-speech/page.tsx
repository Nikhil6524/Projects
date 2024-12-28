import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TextToSpeech() {
  const [text, setText] = useState('')
  const [voice, setVoice] = useState('en-IN-NeerjaNeural')
  const [voices, setVoices] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Fetch available voices when component mounts
  useState(() => {
    fetch('http://localhost:5001/tts/voices')
      .then(res => res.json())
      .then(data => setVoices(data))
      .catch(err => console.error('Error fetching voices:', err))
  })

  const handleSynthesize = async () => {
    if (!text) return

    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5001/tts/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice }),
      })

      const data = await response.json()
      
      if (data.success && data.audio) {
        // Create audio from base64
        const audio = `data:audio/wav;base64,${data.audio}`
        if (audioRef.current) {
          audioRef.current.src = audio
          audioRef.current.play()
        }
      } else {
        console.error('Speech synthesis failed:', data.error)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Azure Text-to-Speech</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Text to Speech Converter</CardTitle>
          <CardDescription>
            Convert your text to natural-sounding speech using Azure's Neural Text to Speech service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Voice Selection</label>
            <Select value={voice} onValueChange={setVoice}>
              <SelectTrigger>
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((v: any) => (
                  <SelectItem key={v.name} value={v.name}>
                    {v.language} - {v.gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Text Input</label>
            <Input
              placeholder="Enter text to convert to speech..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handleSynthesize}
            disabled={!text || isLoading}
            className="w-full"
          >
            {isLoading ? 'Converting...' : 'Convert to Speech'}
          </Button>
          
          <audio ref={audioRef} className="w-full mt-4" controls />
        </CardContent>
      </Card>
    </div>
  )
} 