import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AccessibilityContextType {
    highContrast: boolean
    toggleHighContrast: () => void
    fontSize: number
    increaseFontSize: () => void
    decreaseFontSize: () => void
    resetFontSize: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

const FONT_SIZE_KEY = 'accessibility-font-size'
const HIGH_CONTRAST_KEY = 'accessibility-high-contrast'
const MIN_FONT_SIZE = 14
const MAX_FONT_SIZE = 22
const DEFAULT_FONT_SIZE = 16

export function AccessibilityProvider({ children }: { children: ReactNode }) {
    const [highContrast, setHighContrast] = useState(() => {
        const saved = localStorage.getItem(HIGH_CONTRAST_KEY)
        return saved === 'true'
    })

    const [fontSize, setFontSize] = useState(() => {
        const saved = localStorage.getItem(FONT_SIZE_KEY)
        return saved ? parseInt(saved, 10) : DEFAULT_FONT_SIZE
    })

    // Apply high contrast class to document
    useEffect(() => {
        if (highContrast) {
            document.documentElement.classList.add('high-contrast')
        } else {
            document.documentElement.classList.remove('high-contrast')
        }
        localStorage.setItem(HIGH_CONTRAST_KEY, String(highContrast))
    }, [highContrast])

    // Apply font size to document
    useEffect(() => {
        document.documentElement.style.fontSize = `${fontSize}px`
        localStorage.setItem(FONT_SIZE_KEY, String(fontSize))
    }, [fontSize])

    const toggleHighContrast = () => {
        setHighContrast(prev => !prev)
    }

    const increaseFontSize = () => {
        setFontSize(prev => Math.min(MAX_FONT_SIZE, prev + 2))
    }

    const decreaseFontSize = () => {
        setFontSize(prev => Math.max(MIN_FONT_SIZE, prev - 2))
    }

    const resetFontSize = () => {
        setFontSize(DEFAULT_FONT_SIZE)
    }

    return (
        <AccessibilityContext.Provider
            value={{
                highContrast,
                toggleHighContrast,
                fontSize,
                increaseFontSize,
                decreaseFontSize,
                resetFontSize,
            }}
        >
            {children}
        </AccessibilityContext.Provider>
    )
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext)
    if (context === undefined) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider')
    }
    return context
}
