import { NextResponse } from 'next/server';
import axios from 'axios';

// Define the expected structure of a model from Ollama's /api/tags endpoint
interface OllamaTagModel {
  name: string;
  model: string; // Often the same as name or includes digest
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[] | null;
    parameter_size: string;
    quantization_level: string;
  };
}

// Define the structure we want to return to the frontend
interface FrontendModel {
  name: string;
  modified_at: string;
  size: number;
}

// Use environment variable for Ollama URL, default to localhost
const OLLAMA_API_BASE_URL = process.env.OLLAMA_API_BASE_URL || 'http://localhost:11434';

export async function GET() {
  try {
    const response = await axios.get<{ models: OllamaTagModel[] }>(`${OLLAMA_API_BASE_URL}/api/tags`);

    // Transform the data to match the frontend's expected structure
    const modelsForFrontend: FrontendModel[] = response.data.models.map(model => ({
      name: model.name,
      modified_at: model.modified_at,
      size: model.size,
    }));

    return NextResponse.json({ models: modelsForFrontend });

  } catch (error: any) {
    console.error('Error fetching models from Ollama:', error);

    let errorMessage = 'Failed to fetch models from Ollama server.';
    let statusCode = 500;

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        errorMessage = `Could not connect to Ollama server at ${OLLAMA_API_BASE_URL}. Is it running?`;
        statusCode = 503; // Service Unavailable
      } else if (error.response) {
        errorMessage = `Ollama server responded with status ${error.response.status}: ${error.response.data?.error || 'Unknown error'}`;
        statusCode = error.response.status;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}