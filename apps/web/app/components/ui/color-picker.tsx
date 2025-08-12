import { useState } from 'react'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
  '#374151', // dark gray
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#84cc16', // lime
  '#a855f7', // purple
  '#e11d48', // rose
]

interface ColorPickerProps {
  value?: string
  onChange: (color: string) => void
  disabled?: boolean
}

export function ColorPicker({ value = '#6b7280', onChange, disabled }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customColor, setCustomColor] = useState(value)

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setCustomColor(newColor)
    onChange(newColor)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="w-8 h-8 p-0 border-2"
          style={{ backgroundColor: value }}
        >
          <span className="sr-only">Pick a color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-1">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className="w-6 h-6 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: color }}
                onClick={() => {
                  onChange(color)
                  setCustomColor(color)
                  setIsOpen(false)
                }}
              >
                <span className="sr-only">Select {color}</span>
              </button>
            ))}
          </div>
          <div className="border-t pt-3">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
                title="Choose custom color"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  const newColor = e.target.value
                  if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
                    setCustomColor(newColor)
                    onChange(newColor)
                  } else {
                    setCustomColor(newColor)
                  }
                }}
                placeholder="#000000"
                className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}