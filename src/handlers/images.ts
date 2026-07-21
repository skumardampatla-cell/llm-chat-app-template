/**
 * Image generation handler
 */

import { Env } from '../types/env';

export async function generateImage(prompt: string, env: Env): Promise<string> {
  const imageResponse = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
    prompt,
    num_steps: 4,
  });

  const base64 = btoa(String.fromCharCode(...new Uint8Array(imageResponse as any)));
  return `data:image/jpeg;base64,${base64}`;
}
