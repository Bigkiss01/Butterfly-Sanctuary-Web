import { describe, it, expect } from 'vitest'
import {
    SUPPORTED_LANGUAGES,
    LANGUAGE_NAMES,
    GRADIENT_OPTIONS,
    EMOJI_OPTIONS,
    createEmptyButterflyData
} from '../util/butterflySchema'

describe('SUPPORTED_LANGUAGES', () => {
    it('should contain exactly 7 languages', () => {
        expect(SUPPORTED_LANGUAGES).toHaveLength(7)
    })

    it('should include English and Thai', () => {
        expect(SUPPORTED_LANGUAGES).toContain('en')
        expect(SUPPORTED_LANGUAGES).toContain('th')
    })

    it('should include all expected languages', () => {
        const expected = ['en', 'th', 'zh', 'ru', 'ja', 'ko', 'ar']
        expect(SUPPORTED_LANGUAGES).toEqual(expected)
    })
})

describe('LANGUAGE_NAMES', () => {
    it('should have a name for each supported language', () => {
        SUPPORTED_LANGUAGES.forEach(lang => {
            expect(LANGUAGE_NAMES).toHaveProperty(lang)
            expect(typeof LANGUAGE_NAMES[lang]).toBe('string')
        })
    })

    it('should have correct English name', () => {
        expect(LANGUAGE_NAMES.en).toBe('English')
    })

    it('should have correct Thai name', () => {
        expect(LANGUAGE_NAMES.th).toBe('ไทย')
    })
})

describe('GRADIENT_OPTIONS', () => {
    it('should have at least one gradient option', () => {
        expect(GRADIENT_OPTIONS.length).toBeGreaterThan(0)
    })

    it('should have value, label, and preview for each option', () => {
        GRADIENT_OPTIONS.forEach(option => {
            expect(option).toHaveProperty('value')
            expect(option).toHaveProperty('label')
            expect(option).toHaveProperty('preview')
        })
    })
})

describe('EMOJI_OPTIONS', () => {
    it('should have at least one emoji option', () => {
        expect(EMOJI_OPTIONS.length).toBeGreaterThan(0)
    })

    it('should include butterfly emoji', () => {
        expect(EMOJI_OPTIONS).toContain('🦋')
    })
})

describe('createEmptyButterflyData', () => {
    it('should return an object with all required fields', () => {
        const data = createEmptyButterflyData()

        expect(data).toHaveProperty('emoji')
        expect(data).toHaveProperty('gradient')
        expect(data).toHaveProperty('rarity')
        expect(data).toHaveProperty('mainImage')
        expect(data).toHaveProperty('galleryImages')
        expect(data).toHaveProperty('name')
        expect(data).toHaveProperty('scientificName')
        expect(data).toHaveProperty('description')
        expect(data).toHaveProperty('habitat')
        expect(data).toHaveProperty('wingspan')
        expect(data).toHaveProperty('lifespan')
        expect(data).toHaveProperty('bestTime')
        expect(data).toHaveProperty('funFact')
        expect(data).toHaveProperty('order')
    })

    it('should have default emoji as butterfly', () => {
        const data = createEmptyButterflyData()
        expect(data.emoji).toBe('🦋')
    })

    it('should have default rarity of 3', () => {
        const data = createEmptyButterflyData()
        expect(data.rarity).toBe(3)
    })

    it('should have null mainImage by default', () => {
        const data = createEmptyButterflyData()
        expect(data.mainImage).toBeNull()
    })

    it('should have empty galleryImages array', () => {
        const data = createEmptyButterflyData()
        expect(data.galleryImages).toEqual([])
    })

    it('should have name object with en key', () => {
        const data = createEmptyButterflyData()
        expect(data.name).toHaveProperty('en')
        expect(data.name.en).toBe('')
    })

    it('should use first gradient option as default', () => {
        const data = createEmptyButterflyData()
        expect(data.gradient).toBe(GRADIENT_OPTIONS[0].value)
    })

    it('should return a new object each time (not a reference)', () => {
        const data1 = createEmptyButterflyData()
        const data2 = createEmptyButterflyData()

        expect(data1).not.toBe(data2)
        data1.emoji = '🌸'
        expect(data2.emoji).toBe('🦋')
    })
})
