import { Entity, Ability } from "../internal.js";

export type AbilityTarget = 'any' | 'self' | 'enemy' | 'ownTeam' | 'enemyTeam'; // TODO flesh this out

export type AbilityParameterDefinitionCommon = {
  required?: boolean,
  default?: any
}

type RequiredParameterDefinition = { required: true }
type OptionalParameterDefinition = { required: false }

export type NumberParameterDefinition = AbilityParameterDefinitionCommon & {
  type: 'number',
  min?: number,
  max?: number,
}

export type StringParameterDefinition = AbilityParameterDefinitionCommon & {
  type: 'string',
  maxLength?: number
}

export type EntityParameterDefinition = AbilityParameterDefinitionCommon & {
  type: 'entity',
  permitted?: AbilityTarget[],
  forbidden?: AbilityTarget[]
}

export type AbilityParameterDefinition = NumberParameterDefinition | StringParameterDefinition | EntityParameterDefinition;

export type AbilityParameters = { [key: string]: AbilityParameterDefinition };

export type ProcessedParams<T extends AbilityParameters> = {
  [Key in keyof T as `${Lowercase<string & Key>}`]: T[Key] extends { required: true } ? ProcessMap[T[Key]['type']] : ProcessMap[T[Key]['type']] | undefined
}

type ProcessMap = {
  number: number,
  string: string,
  entity: Entity
}
