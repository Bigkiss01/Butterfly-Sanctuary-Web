import { describe, it, expect } from 'vitest'
import { sanitizeText } from '../firebase'

describe('sanitizeText', () => {
    it('should return empty string for undefined input', () => {
        expect(sanitizeText()).toBe('')
    })

    it('should trim whitespace from input', () => {
        expect(sanitizeText('  hello world  ')).toBe('hello world')
    })

    it('should remove HTML-like characters < and >', () => {
        expect(sanitizeText('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
    })

    it('should remove control characters', () => {
        const textWithControlChars = 'hello\x00\x01\x02world'
        expect(sanitizeText(textWithControlChars)).toBe('helloworld')
    })

    it('should limit text to maxLength', () => {
        const longText = 'a'.repeat(300)
        expect(sanitizeText(longText, 100)).toBe('a'.repeat(100))
    })

    it('should use default maxLength of 255', () => {
        const longText = 'b'.repeat(500)
        expect(sanitizeText(longText)).toBe('b'.repeat(255))
    })

    it('should handle empty string', () => {
        expect(sanitizeText('')).toBe('')
    })

    it('should preserve normal text', () => {
        expect(sanitizeText('Hello, World!')).toBe('Hello, World!')
    })

    it('should handle Thai text correctly', () => {
        expect(sanitizeText('สวัสดีครับ')).toBe('สวัสดีครับ')
    })
})
