'use server';
/**
 * @fileOverview Converts text to speech using the Gemini TTS model.
 *
 * - convertTextToSpeech - A function that converts text to speech.
 * - ConvertTextToSpeechInput - The input type for the convertTextToSpeech function.
 * - ConvertTextToSpeechOutput - The return type for the convertTextToSpeech function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const ConvertTextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
});
export type ConvertTextToSpeechInput = z.infer<typeof ConvertTextToSpeechInputSchema>;

const ConvertTextToSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe('The audio data URI in WAV format.'),
});
export type ConvertTextToSpeechOutput = z.infer<typeof ConvertTextToSpeechOutputSchema>;

export async function convertTextToSpeech(input: ConvertTextToSpeechInput): Promise<ConvertTextToSpeechOutput> {
  return convertTextToSpeechFlow(input);
}

const convertTextToSpeechFlow = ai.defineFlow(
  {
    name: 'convertTextToSpeechFlow',
    inputSchema: ConvertTextToSpeechInputSchema,
    outputSchema: ConvertTextToSpeechOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: input.text,
    });

    if (!media) {
      throw new Error('No media returned from TTS generation.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const audioDataUri = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {
      audioDataUri: audioDataUri,
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) { /* c8 ignore next */
      bufs.push(d);
    });
    writer.on('end', function () { /* c8 ignore next */
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
