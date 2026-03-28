export type GamePhase = 'idle' | 'scanning' | 'item' | 'narrative' | 'challenge' | 'resolving' | 'story_complete';

export interface GameItem {
  name: string;
  description: string;
  mechanicTag: string; // e.g. "combat", "utility", "magic"
  imageUrl?: string;
}

export interface GameState {
  phase: GamePhase;
  scannedLabel: string | null;
  generatedItem: GameItem | null;
  challengeStep: number;
}

export type GameEvent =
  | { type: 'START_SCAN' }
  | { type: 'OBJECT_DETECTED'; label: string }
  | { type: 'ITEM_GENERATED'; item: GameItem }
  | { type: 'NARRATIVE_DONE' }
  | { type: 'SUBMIT_CHOICE' }
  | { type: 'NEXT_CHALLENGE' }
  | { type: 'END_STORY' }
  | { type: 'RESET' };

export const initialState: GameState = {
  phase: 'idle',
  scannedLabel: null,
  generatedItem: null,
  challengeStep: 1
};

export function transition(state: GameState, event: GameEvent): GameState {
  // Global resets
  if (event.type === 'RESET') {
    return initialState;
  }

  switch (state.phase) {
    case 'idle':
      if (event.type === 'START_SCAN') return { ...state, phase: 'scanning' };
      break;

    case 'scanning':
      if (event.type === 'OBJECT_DETECTED') {
        return { ...state, phase: 'item', scannedLabel: event.label, challengeStep: 1 };
      }
      break;

    case 'item':
      if (event.type === 'ITEM_GENERATED') {
        return { ...state, phase: 'narrative', generatedItem: event.item };
      }
      break;

    case 'narrative':
      if (event.type === 'NARRATIVE_DONE') {
        return { ...state, phase: 'challenge', challengeStep: 1 };
      }
      break;

    case 'challenge':
      if (event.type === 'SUBMIT_CHOICE') {
        return { ...state, phase: 'resolving' };
      }
      break;

    case 'resolving':
      if (event.type === 'NEXT_CHALLENGE') {
        return { ...state, phase: 'challenge', challengeStep: state.challengeStep + 1 };
      }
      if (event.type === 'END_STORY') {
        return { ...state, phase: 'story_complete' };
      }
      break;

    case 'story_complete':
      // Handled by global reset
      break;
  }

  return state;
}
