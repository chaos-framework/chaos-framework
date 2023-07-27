export interface UpdateProperties {
  target?: any,
  caster?: any,
  using?: any
}

type ReservedNames = 'MOVE' | 'CALL'

export type Move = ['MOVE', UpdateProperties & { x: number, y: number }];
export type SetProperty = ['PROPERTY_SET', any];

export type Update = Move | SetProperty;

export type Broadcast = ['BROADCAST', string, {[key:string]: any}];

export type Call = ['CALL', CallableSubroutine, ...any[]];

export type SubRoutineYieldable = Update | Broadcast | Call;

export type CallableSubroutine = (...args: any[]) => Promise<Subroutine>;

export type Subroutine = AsyncGenerator<SubRoutineYieldable, SubRoutineYieldable | void, any>;

export type Mechanic = ((payload:any) => Promise<Subroutine>) & { messageType: string, scope?: string }