import React, { useState, useEffect, Fragment } from 'react';
import { Box, Newline, Text, useApp, useInput } from 'ink';
import { Action, Chaos, Entity, Game, Server, TerminalMessage, TerminalMessageFragment } from '@chaos-framework/core';

export interface MessageProps {
  type: 'game' | 'log' | 'error';
  message: string | TerminalMessage;
}

const Message = (props: { message: MessageProps }) => {
  const { type, message } = props.message;
  if (message instanceof TerminalMessage) {
    const elements: JSX.Element[] = [];
    for (const fragment of message.fragments) {
      if (fragment instanceof TerminalMessageFragment) {
        let color;
        switch (fragment.type) {
          case 'entity':
            color = 'blue';
            break;
          case 'component':
            color = 'green';
            break;
          default:
            color = 'white';
        }
        elements.push(<Text color={color}>{fragment.print()} </Text>);
      } else {
        elements.push(<Text color="white">{fragment} </Text>);
      }
    }
    return <Text>{elements}</Text>;
  } else {
    const color = type === 'log' ? 'grey' : 'red';
    return <Text color={color}>{message}</Text>;
  }
};

export default Message;
