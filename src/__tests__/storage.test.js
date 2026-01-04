import { describe, it, expect, vi } from 'vitest'
import { generateUniqueFilename } from '../util/storage'

describe('generateUniqueFilename', () => {
    it('should include the prefix in the filename', () => {
        const filename = generateUniqueFilename('image', 'jpg')
        expect(filename).toMatch(/^image_/)
    })

    it('should include the extension in the filename', () => {
        const filename = generateUniqueFilename('photo', 'png')
        expect(filename).toMatch(/\.png$/)
    })

    it('should include a timestamp in the filename', () => {
        const before = Date.now()
        const filename = generateUniqueFilename('test', 'jpg')
        const after = Date.now()

        // Extract timestamp from filename (format: prefix_timestamp_random.ext)
        const parts = filename.split('_')
        const timestamp = parseInt(parts[1], 10)

        expect(timestamp).toBeGreaterThanOrEqual(before)
        expect(timestamp).toBeLessThanOrEqual(after)
    })

    it('should generate unique filenames', () => {
        const filenames = new Set()

        for (let i = 0; i < 100; i++) {
            filenames.add(generateUniqueFilename('test', 'jpg'))
        }

        // All 100 should be unique
        expect(filenames.size).toBe(100)
    })

    it('should follow the expected format', () => {
        const filename = generateUniqueFilename('butterfly', 'webp')

        // Format: prefix_timestamp_random.extension
        const regex = /^butterfly_\d+_[a-z0-9]+\.webp$/
        expect(filename).toMatch(regex)
    })

    it('should work with different extensions', () => {
        const extensions = ['jpg', 'png', 'webp', 'gif']

        extensions.forEach(ext => {
            const filename = generateUniqueFilename('image', ext)
            expect(filename.endsWith(`.${ext}`)).toBe(true)
        })
    })

    it('should work with special characters in prefix', () => {
        const filename = generateUniqueFilename('my-image', 'jpg')
        expect(filename).toMatch(/^my-image_/)
    })
})
