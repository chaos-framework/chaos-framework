import { ChaosInstance, AbilityParameterDefinition, AbilityParameters, BadAbilityParametersError, Component, EffectContext, Entity, Subroutine, ProcessedParams } from "../internal.js";

// TODO ability decorator to add parameter context and register with the instance

export abstract class Ability {
  abstract name: string;

  static parameters: AbilityParameters;

  abstract cast(context: EffectContext, payload: any): Subroutine;

  getParameters(): AbilityParameters {
    return (this.constructor as any).parameters || [];
  }

  // Ensures all parameters were passed correctly
  processParameters<T extends AbilityParameters>(instance: ChaosInstance, params: any): ProcessedParams<T> {
    // Make sure we got an object
    if (typeof params != 'object') {
      throw new BadAbilityParametersError('Parameters not supplied in correct format');
    }

    const processed: any = {};

    for (const [name, definition] of Object.entries(this.getParameters())) {
      const value = params[name];

      if (definition.required && value === undefined) {
        throw new BadAbilityParametersError(`Missing required parameter: ${name}`);
      }

      switch(definition.type) {
        case 'number':
          if (typeof value !== 'number') {
            throw new BadAbilityParametersError(`Parameter ${name} is of type ${typeof value}, expected a number.`);
          }
          break;
        case 'string':
          if (typeof value !== 'string') {
            throw new BadAbilityParametersError(`Parameter ${name} is of type ${typeof value}, expected a string.`);
          }
          break;
        case 'entity':
          if (typeof value !== 'string') {
            throw new BadAbilityParametersError(`Parameter ${name} is of type ${typeof value}, expected an entity ID string.`);
          }
          const entity = instance.entities.get(value);
          if (!entity) {
            throw new BadAbilityParametersError(`Entity with ID ${value} passed to ${name} does not exist.`);
          }
          processed[name] = value;
          break;
      }
    }

    return processed;
  }

}
