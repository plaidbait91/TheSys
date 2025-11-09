'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { useState } from 'react';

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit
} from "@/components/ai-elements/prompt-input";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";

export default function Page() {

  const { messages, sendMessage, addToolOutput, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),

    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,

    // run client-side tools that are automatically executed:
    async onToolCall({ toolCall }) {

      if (toolCall.dynamic) {
        return;
      }

      if (toolCall.toolName === 'retrieveAllEntries') {

        const jVal = sessionStorage.getItem('journal') || '[]'
        const journal = JSON.parse(jVal) as string[]

        addToolOutput({
          tool: 'retrieveAllEntries',
          toolCallId: toolCall.toolCallId,
          output: journal,
        });
      }

      if (toolCall.toolName === 'addEntry') {
        try {
          const new_msg = toolCall.input as { message: string }
          const new_entry = new_msg.message
          const jVal = sessionStorage.getItem('journal') || '[]'
          const journal = JSON.parse(jVal)
          const newjVal = JSON.stringify([...journal, new_entry])

          sessionStorage.setItem('journal', newjVal)

          addToolOutput({
            tool: 'addEntry',
            toolCallId: toolCall.toolCallId,
            output: 'success',
          });
        } catch (e) {
          addToolOutput({
            tool: 'addEntry',
            toolCallId: toolCall.toolCallId,
            output: `Error while editing journal: ${e}`,
          });
        }
      }
    },
  });
  const [input, setInput] = useState('');
  const isLoading = (status === 'submitted' || status === 'streaming');

  return (
    <div className="flex flex-col h-screen">
      <Conversation>
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              title="Start a conversation"
              description="Type a message below to begin"
            />
          ) :
            (messages.map(message => (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.parts.map((part) => {
                    switch (part.type) {
                      case 'text':
                        return part.text

                      // for tools, use the typed tool part names:
                      case 'tool-addEntry':
                      case 'tool-retrieveAllEntries': {
                        return <div>
                          <Tool>
                            <ToolHeader state={part.state} type={part.type} />
                            <ToolContent>
                              <ToolInput input={part.input} />
                              {(part.state === "output-available" || part.state === 'output-error') && (
                                <ToolOutput
                                  errorText={part.errorText}
                                  output={part.output}
                                />
                              )}
                            </ToolContent>
                          </Tool>
                        </div>
                      }

                    }
                  }
                  )}
                </MessageContent>
              </Message>
            )))
          }
        </ConversationContent>
      </Conversation>

      <div className="border-t p-4">
        <PromptInput
          onSubmit={(message, event) => {
            event.preventDefault();
            if (message.text) {
              sendMessage({ text: message.text });
              setInput("");
            }
          }}
          className="max-w-3xl mx-auto flex gap-2 items-end"
        >
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            rows={1}
            className="flex-1"
          />
          <PromptInputSubmit disabled={isLoading} />
        </PromptInput>
      </div>
    </div>
  );
}