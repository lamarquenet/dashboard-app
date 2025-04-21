"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Keep axios for fetching models
import { useTheme } from '../hooks/useTheme';

interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

const ChatComponent: React.FC<{}> = () => {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [model, setModel] = useState('');
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [errorLoadingModels, setErrorLoadingModels] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false); // To disable send button during streaming

  // SVG container styles
  const svgContainerStyles = {
    display: 'inline-flex',
    flexShrink: 0,
    width: '1rem',
    height: '1rem',
    minWidth: 0,
    minHeight: 0,
  };

  // Larger SVG container styles (for the chat bubble)
  const largeSvgContainerStyles = {
    display: 'inline-flex',
    flexShrink: 0,
    width: '2rem',
    height: '2rem',
    minWidth: 0,
    minHeight: 0,
  };

  // SVG icon styles
  const svgIconStyles = {
    height: '1rem',
    width: '1rem',
  };

  // Larger SVG icon styles
  const largeSvgIconStyles = {
    height: '2rem',
    width: '2rem',
    opacity: 0.5,
  };

  // Form styles
  const formStyles = {
    display: 'flex',
    alignItems: 'center', // Changed from items-end to center for better alignment
    gap: '0.5rem', // Space between elements
  };

  // Text area container styles
  const textAreaContainerStyles = {
    position: 'relative' as const,
    flexGrow: 1,
    display: 'flex',
  };

  // Text area styles
  const textAreaStyles = {
    width: '100%',
    padding: '0.75rem',
    paddingLeft: '3rem', // Space for the paperclip icon
    borderWidth: '1px',
    borderStyle: 'solid' as const,
    borderColor: '#d1d5db', // border-gray-300
    borderRadius: '9999px', // rounded-full
    resize: 'none' as const,
    backgroundColor: '#ffffff', // bg-white
    color: '#111827', // text-gray-900
    minHeight: '5rem', // Taller text area (was about 3rem with rows={2})
    outline: 'none',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm
    transition: 'all 200ms',
  };

  // Dark mode text area styles
  const darkTextAreaStyles = {
    ...textAreaStyles,
    backgroundColor: '#374151', // dark:bg-gray-700
    borderColor: '#4b5563', // dark:border-gray-600
    color: '#f9fafb', // dark:text-gray-100
  };

  // Send button styles
  const sendButtonStyles = {
    padding: '0.75rem',
    backgroundColor: '#60a5fa', // bg-blue-400
    color: '#ffffff', // text-white
    borderRadius: '9999px', // rounded-full
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-md
    transition: 'all 200ms',
    cursor: 'pointer',
    height: '3rem', // Fixed height to match text area
    width: '3rem', // Fixed width for circular button
    flexShrink: 0,
  };

  // Hover send button styles
  const hoverSendButtonStyles = {
    ...sendButtonStyles,
    backgroundColor: '#3b82f6', // hover:bg-blue-500
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // hover:shadow-lg
  };

  // Disabled send button styles
  const disabledSendButtonStyles = {
    ...sendButtonStyles,
    opacity: 0.5,
    cursor: 'not-allowed' as const,
  };

  useEffect(() => {
    const fetchModels = async () => {
      setIsLoadingModels(true);
      setErrorLoadingModels(null);
      try {
        const response = await axios.get<{ models: OllamaModel[] }>('/api/models');
        const fetchedModels = response.data.models || [];
        setAvailableModels(fetchedModels);
        if (fetchedModels.length > 0) {
          setModel(fetchedModels[0].name);
        } else {
          // Set a default model name if no models are available
          setModel('llama3');
          setErrorLoadingModels('No models available from the server. Using default model.');
        }
      } catch (error: any) {
        console.error('Error fetching Ollama models:', error);
        
        // Set a default model name when API fails
        setModel('llama3');
        
        // Provide a more specific error message
        if (error.response && error.response.status === 404) {
          setErrorLoadingModels('Models API not found. Using default model.');
        } else {
          setErrorLoadingModels('Failed to load models. Is the Ollama server running?');
        }
        
        setAvailableModels([]);
      } finally {
        setIsLoadingModels(false);
      }
    };
    fetchModels();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || isStreaming) return; // Prevent sending empty messages or while streaming

    setIsStreaming(true); // Start streaming state
    const userMessage = `You: ${message}`;
    const ollamaPlaceholder = 'Ollama: ';
    setMessages((prevMessages) => [...prevMessages, userMessage, ollamaPlaceholder]);
    setMessage(''); // Clear input immediately
    setImageFile(null); // Clear image immediately

    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    const decoder = new TextDecoder();
    let accumulatedResponse = '';
    let leftover = ''; // Buffer for partial JSON objects between chunks

    try {
      const formData = new FormData();
      formData.append('model', model);
      formData.append('message', message); // Use the message state before clearing
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from API:', response.status, errorText);
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          newMessages[newMessages.length - 1] = `Ollama: Error - ${response.statusText} (${response.status})`;
          return newMessages;
        });
        setIsStreaming(false);
        return;
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream finished.');
          break;
        }

        const decodedChunk = decoder.decode(value, { stream: true });
        leftover += decodedChunk; // Add new chunk to leftover buffer

        // Process lines separated by newline
        let lines = leftover.split('\n');

        // Keep the last potentially incomplete line in the buffer
        leftover = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue; // Skip empty lines
          try {
            const parsed = JSON.parse(line);
            if (parsed.message?.content) {
              accumulatedResponse += parsed.message.content;
              setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                newMessages[newMessages.length - 1] = `Ollama: ${accumulatedResponse}`;
                return newMessages;
              });
            }
             if (parsed.error) {
               console.error("Ollama stream error:", parsed.error);
               setMessages((prevMessages) => {
                 const newMessages = [...prevMessages];
                 newMessages[newMessages.length - 1] = `Ollama: Error - ${parsed.error}`;
                 return newMessages;
               });
               // Optionally break or handle differently
             }
             // Check for 'done' field if Ollama sends it in the stream JSON itself
             if (parsed.done) {
                 console.log("Ollama signaled done in stream.");
                 // The reader loop will break on the next read() anyway
             }
          } catch (parseError) {
            console.warn('Failed to parse JSON line:', line, parseError);
            // Decide how to handle lines that aren't valid JSON
          }
        }
      }
       // Process any remaining data in the buffer after the loop finishes
       if (leftover.trim() !== '') {
           try {
               const parsed = JSON.parse(leftover);
               if (parsed.message?.content) {
                   accumulatedResponse += parsed.message.content;
                   setMessages((prevMessages) => {
                       const newMessages = [...prevMessages];
                       newMessages[newMessages.length - 1] = `Ollama: ${accumulatedResponse}`;
                       return newMessages;
                   });
               }
               if (parsed.error) {
                 console.error("Ollama stream error (final chunk):", parsed.error);
                 setMessages((prevMessages) => {
                   const newMessages = [...prevMessages];
                   newMessages[newMessages.length - 1] = `Ollama: Error - ${parsed.error}`;
                   return newMessages;
                 });
               }
           } catch (parseError) {
               console.warn('Failed to parse final leftover JSON:', leftover, parseError);
           }
       }


    } catch (error) {
      console.error('Error handling stream:', error);
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        // Update the placeholder message with the error
        newMessages[newMessages.length - 1] = `Ollama: Error processing stream - ${error instanceof Error ? error.message : 'Unknown error'}`;
        return newMessages;
      });
    } finally {
      if (reader) {
        try {
          await reader.cancel(); // Cancel the stream reader
          reader.releaseLock(); // Release the lock
        } catch (cancelError) {
          console.error("Error cancelling or releasing reader lock:", cancelError);
        }
      }
      setIsStreaming(false); // End streaming state
      // Input clearing is now done at the start
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  return (
    // Main container with flex column layout, border, rounded corners, and padding
    <div className="flex flex-col h-full border border-gray-300 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 shadow-lg">
      {/* Top section for model selection - more compact and stylish */}
      <div className="flex items-center mb-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-2 shadow-sm">
        <div className="flex items-center space-x-2 w-full">
          <div style={svgContainerStyles}>
            <svg xmlns="http://www.w3.org/2000/svg" style={svgIconStyles} className="text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
          </div>
          <select
            value={model}
            onChange={handleModelChange}
            disabled={isLoadingModels || isStreaming}
            className="flex-grow p-2 border-none bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 text-sm"
          >
            {isLoadingModels && <option value="">Loading models...</option>}
            {!isLoadingModels && availableModels.length === 0 && (
              <option value={model}>{model} (default)</option>
            )}
            {!isLoadingModels && availableModels.length > 0 && availableModels.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name} ({m.size ? (m.size / 1e9).toFixed(2) + ' GB' : 'size unknown'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Message display area - takes up remaining space and scrolls */}
      <div className="flex-grow overflow-y-auto mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-inner">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 space-y-2">
            <div style={largeSvgContainerStyles}>
              <svg xmlns="http://www.w3.org/2000/svg" style={largeSvgIconStyles} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p>No messages yet. Start a conversation!</p>
            {errorLoadingModels && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 max-w-xs">
                {errorLoadingModels}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isUser = msg.startsWith('You:');
              const content = isUser ? msg.substring(5) : msg.substring(8); // Remove "You: " or "Ollama: "
              
              return (
                <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl whitespace-pre-wrap ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                  }`}>
                    <div className="text-xs mb-1 opacity-75">
                      {isUser ? 'You' : 'Ollama'}
                    </div>
                    {content}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input form - enhanced with better styling */}
      <form onSubmit={handleSendMessage} style={formStyles}>
        {/* Container for textarea and upload button */}
        <div style={textAreaContainerStyles}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            style={theme === 'dark' ? darkTextAreaStyles : textAreaStyles}
            disabled={isStreaming || isLoadingModels || !!errorLoadingModels}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e as any);
              }
            }}
          />
          
          {/* File Upload Button - Enhanced with better positioning and feedback */}
          <div className="absolute bottom-4 left-3 flex items-center">
            <label className={`cursor-pointer p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 ${isStreaming || isLoadingModels || !!errorLoadingModels ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {/* SVG Paperclip Icon */}
              <div style={svgContainerStyles}>
                <svg xmlns="http://www.w3.org/2000/svg" style={svgIconStyles} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isStreaming || isLoadingModels || !!errorLoadingModels}
                className="hidden"
              />
            </label>
            
            {/* Image file indicator */}
            {imageFile && (
              <span className="ml-2 text-xs text-green-600 dark:text-green-400 animate-pulse">
                Image ready
              </span>
            )}
          </div>
        </div>
        
        {/* Send button - enhanced with better styling */}
        <button
          type="submit"
          disabled={isStreaming || !message || isLoadingModels || !!errorLoadingModels}
          style={isStreaming || !message || isLoadingModels || !!errorLoadingModels ? disabledSendButtonStyles : sendButtonStyles}
          onMouseOver={(e) => {
            if (!(isStreaming || !message || isLoadingModels || !!errorLoadingModels)) {
              e.currentTarget.style.backgroundColor = hoverSendButtonStyles.backgroundColor;
              e.currentTarget.style.boxShadow = hoverSendButtonStyles.boxShadow;
            }
          }}
          onMouseOut={(e) => {
            if (!(isStreaming || !message || isLoadingModels || !!errorLoadingModels)) {
              e.currentTarget.style.backgroundColor = sendButtonStyles.backgroundColor;
              e.currentTarget.style.boxShadow = sendButtonStyles.boxShadow;
            }
          }}
        >
          {isStreaming ? (
            <div style={svgContainerStyles}>
              <svg className="animate-spin text-white" style={svgIconStyles} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <div style={svgContainerStyles}>
              <svg xmlns="http://www.w3.org/2000/svg" style={svgIconStyles} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;