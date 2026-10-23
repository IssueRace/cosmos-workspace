import { useState } from 'react';
import { Message } from '../types';

export function useAIStream() {
  const [isStreaming, setIsStreaming] = useState(false);

  const streamAIResponse = async (
    apiBaseUrl: string,
    apiKey: string,
    model: string,
    messages: Message[],
    onChunk: (chunk: string) => void
  ): Promise<string> => {
    if (!apiKey) {
      const msg = '⚠️ **API Key is missing**\n\nPlease click the **⚙️ Settings** icon in the top-left toolbar to enter your OpenAI, Groq, or OpenRouter API key.\n\n*Tip: Groq offers free API access with ultra-fast inference if you need a free key!*';
      onChunk(msg);
      return msg;
    }

    setIsStreaming(true);
    let fullText = '';
    try {
      const cleanBase = apiBaseUrl ? (apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl) : 'https://api.openai.com/v1';
      const url = `${cleanBase}/chat/completions`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        let errorMsg = `API error: ${response.status} ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData?.error?.message) {
            errorMsg = errData.error.message;
          }
        } catch {}
        throw new Error(errorMsg);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No body reader');
      }

      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';

      while (!done) {
        const { done: chunkDone, value } = await reader.read();
        done = chunkDone;
        if (value) {
          buffer += decoder.decode(value, { stream: !done });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const cleaned = line.trim();
            if (!cleaned) {
              continue;
            }
            if (cleaned.startsWith('data: ')) {
              const dataStr = cleaned.slice(6).trim();
              if (dataStr === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                const token = parsed.choices[0]?.delta?.content || '';
                if (token) {
                  fullText += token;
                  onChunk(token);
                }
              } catch {
              }
            }
          }
        }
      }

      if (buffer.trim()) {
        const cleaned = buffer.trim();
        if (cleaned.startsWith('data: ')) {
          const dataStr = cleaned.slice(6).trim();
          if (dataStr !== '[DONE]') {
            try {
              const parsed = JSON.parse(dataStr);
              const token = parsed.choices[0]?.delta?.content || '';
              if (token) {
                fullText += token;
                onChunk(token);
              }
            } catch {
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      const errMsg = error instanceof Error ? error.message : String(error);
      const formattedError = `Error: ${errMsg}`;
      onChunk(formattedError);
      fullText = formattedError;
    } finally {
      setIsStreaming(false);
    }
    return fullText;
  };

  return {
    isStreaming,
    streamAIResponse,
  };
}
