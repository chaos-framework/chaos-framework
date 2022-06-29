import React, { useState, useEffect } from 'react';
import { Box, Newline, Text, useApp, useInput } from 'ink';
import { Action, Chaos, Entity, Game, Server, TerminalMessage } from '@chaos-framework/core';

import Message, { MessageProps } from './Message.js';

const MessageLog = (props: any) => {
  // Create a cache of all messages and a fake update to force rerender
  const [messages] = useState<MessageProps[]>([]);
  const [fake, fakeUpdate] = useState({});
  // Create a simple function to push messages using the fake updater
  const pushMessages = (newMessages: MessageProps[]) => {
    messages.push(...newMessages);
    fakeUpdate({});
  };
  useEffect(() => {
    // Rebind the logger in the current JS context to also update the message array
    // OBVIOUSLY don't render two of these loggers unless I set up some higher context provider
    const log = console.log.bind(console);
    console.log = (...args: any) => {
      for (const message of args) {
        pushMessages([{ type: 'log', message: message }]);
      }
      // log(...args)
    };
    const error = console.error.bind(console);
    console.error = (...args: any) => {
      for (const message of args) {
        pushMessages([{ type: 'error', message: message }]);
      }
      // error(...args)
    };
    // Also create a nice hook for the Chaos instance itself
    const handleChaosMessages = (actions: Action[]) => {
      const newMessages: MessageProps[] = [];
      for (const action of actions) {
        if (action.generatedMessage !== undefined) {
          newMessages.push({ type: 'game', message: action.generatedMessage });
        }
      }
      pushMessages(newMessages);
    };
    Chaos.attachExecutionHook(handleChaosMessages);
    return () => {
      // Reset the logger in current JS context
      console.log = log;
      console.error = error;
      // Unhook from the Chaos instance
      Chaos.detachExecutionHook(handleChaosMessages);
    };
  }, []);

  return (
    <Box borderStyle="round" flexGrow={4} flexDirection="column">
      {messages.slice(-10).map((msg, index) => (
        <Message key={index} message={msg} />
      ))}
    </Box>
  );
};

export default MessageLog;
