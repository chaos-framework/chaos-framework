import { ChaosInstance, Subroutine, broadcast } from "../internal.js";

export async function *MockProcessor(instance: ChaosInstance, subroutine: Subroutine) {
  yield broadcast('INNER');
}

export async function *MockSubroutine(): Subroutine {
  yield broadcast('ORIGINAL');
}

export async function *MockEmptySubroutine(): Subroutine { }