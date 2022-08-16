import { Listener, ComponentCatalog, Scope, EffectGenerator, Action } from '../../internal.js';

export interface ComponentContainer extends Listener {
  id: string;
  components: ComponentCatalog;
  isPublished(): boolean;

  handle(phase: string, action: Action): EffectGenerator;

  getComponentContainerByScope(scope: Scope): ComponentContainer | undefined;
}
