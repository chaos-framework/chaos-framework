export type CastCommand = {
  type: 'CAST',
  payload: {
    caster: string,
    ability: string,
    grantedBy: string,
    parameters: any
  }
}

export type Command = CastCommand

export type CommandWithContext<C extends Command = Command> = C & { client: any, receivedAt: Date };