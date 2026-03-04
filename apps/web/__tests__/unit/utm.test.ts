import { describe, it, expect, vi } from 'vitest';
import { generateUTM } from '@mythos/ai-engine/utm';

describe('UTM Utility', () => {
  it('should generate a valid UTM link', () => {
    const baseUrl = 'https://example.com';
    const params = {
      source: 'newsletter',
      medium: 'email',
      campaign: 'spring_sale',
    };
    
    const result = generateUTM(baseUrl, params);
    expect(result).toContain('utm_source=newsletter');
    expect(result).toContain('utm_medium=email');
    expect(result).toContain('utm_campaign=spring_sale');
  });

  it('should handle existing query params', () => {
    const baseUrl = 'https://example.com?foo=bar';
    const params = { source: 'twitter' };
    
    const result = generateUTM(baseUrl, params);
    expect(result).toContain('foo=bar');
    expect(result).toContain('utm_source=twitter');
  });
});
