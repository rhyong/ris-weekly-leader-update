/**
 * Tests for the OpenAI service
 * 
 * NOTE: These are basic tests that don't actually call the OpenAI API
 * to avoid costs during testing. For real application testing, you may
 * want to add integration tests with the actual API.
 */

// Mock the OpenAI module
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockImplementation(({ messages }) => {
              // Return mocked enhanced text based on input
              const userMessage = messages.find(m => m.role === 'user')?.content || '';
              const originalText = userMessage.match(/\"(.*)\"/)?.[1] || '';
              
              // Pretend to enhance the text by adding "enhanced: " prefix
              return Promise.resolve({
                choices: [
                  {
                    message: {
                      content: `enhanced: ${originalText}`
                    }
                  }
                ]
              });
            })
          }
        }
      };
    })
  };
});

import { enhanceText } from '../lib/openai-service';

describe('OpenAI Service', () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.OPENAI_API_KEY;
  });

  it('should enhance text with the appropriate context', async () => {
    const originalText = 'Team is working hard';
    const context = 'team_health';
    
    const result = await enhanceText(originalText, context);
    
    // Our mock implementation adds "enhanced: " to the original text
    expect(result).toBe(`enhanced: ${originalText}`);
  });
  
  it('should throw an error for empty text', async () => {
    await expect(enhanceText('', 'team_health')).rejects.toThrow('Text is empty');
    await expect(enhanceText('   ', 'team_health')).rejects.toThrow('Text is empty');
  });
});