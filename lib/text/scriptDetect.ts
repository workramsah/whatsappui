/**
 * Script Detection for Text
 */

export type ScriptType = 'devanagari' | 'latin' | 'arabic' | 'unknown';

export function detectScript(text: string): ScriptType {
  return 'latin';
}
