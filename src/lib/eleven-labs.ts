export interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  model?: string;
  voiceSettings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  fine_tuning: {
    is_allowed: boolean;
    finetuning_state: string;
  };
  labels: Record<string, string>;
  description: string;
  preview_url: string;
  available_for_tiers: string[];
  settings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
}

export class ElevenLabsClient {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getVoices(): Promise<ElevenLabsVoice[]> {
    const response = await fetch(`${this.baseUrl}/voices`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.voices;
  }

  async generateSpeech(
    text: string,
    voiceId: string,
    options: {
      model?: string;
      voice_settings?: {
        stability: number;
        similarity_boost: number;
        style?: number;
        use_speaker_boost?: boolean;
      };
    } = {}
  ): Promise<ArrayBuffer> {
    const {
      model = 'eleven_monolingual_v1',
      voice_settings = {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
    } = options;

    const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs TTS error: ${response.status} ${error}`);
    }

    return await response.arrayBuffer();
  }

  async getVoiceSettings(voiceId: string) {
    const response = await fetch(`${this.baseUrl}/voices/${voiceId}/settings`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async updateVoiceSettings(
    voiceId: string,
    settings: {
      stability: number;
      similarity_boost: number;
      style?: number;
      use_speaker_boost?: boolean;
    }
  ) {
    const response = await fetch(`${this.baseUrl}/voices/${voiceId}/settings/edit`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} ${error}`);
    }

    return await response.json();
  }

  async getUserInfo() {
    const response = await fetch(`${this.baseUrl}/user`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
}

export function createElevenLabsClient(): ElevenLabsClient {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;

  if (!apiKey) {
    throw new Error('ELEVEN_LABS_API_KEY environment variable is not set');
  }

  return new ElevenLabsClient(apiKey);
}

export function getDefaultVoiceId(): string {
  return process.env.ELEVEN_LABS_VOICE_ID || 'GBv7mTt0atIp3Br8iCZE'; // Default Thomas voice
}

export const ELEVEN_LABS_MODELS = {
  MULTILINGUAL_V2: 'eleven_multilingual_v2',
  MULTILINGUAL_V1: 'eleven_multilingual_v1',
  MONOLINGUAL_V1: 'eleven_monolingual_v1',
  TURBO_V2: 'eleven_turbo_v2',
} as const;

export const DEFAULT_VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true,
} as const;