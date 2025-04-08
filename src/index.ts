/**
 * @file Main entry point for the Astria MCP implementation
 * @description Sets up the MCP server and registers the tools
 */

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MODEL_CONFIG } from './config';
import {
    CreateTuneRawSchema,
    ListTunesRawSchema,
    GenerateImageRawSchema,
    handleCreateTune,
    handleListTunes,
    handleGenerateImage
} from './tools';

// --- Resource Definitions ---
import { TuneResourceTemplate, handleTuneResource } from './resources/tune-resource';
import { PromptResourceTemplate, handlePromptResource } from './resources/prompt-resource';
import { ImageResourceTemplate, handleImageResource } from './resources/image-resource';

// --- MCP Server Setup ---
const server = new McpServer({
    name: "astria-mcp-server",
    version: "1.0.0",
    capabilities: {
        tools: {}, // Enable tools capability
        resources: {}, // Enable resources capability
    },
});

// Register the resources
server.resource("astria_tune", TuneResourceTemplate, handleTuneResource);
server.resource("astria_prompt", PromptResourceTemplate, handlePromptResource);
server.resource("astria_image", ImageResourceTemplate, handleImageResource);

// --- Tool Definitions ---

// Tool 1: Create Tune
server.tool(
    "create_tune",
    "Creates a new Astria fine-tune using Flux defaults. Requires valid image URLs that are publicly accessible. Images must be clear portraits for best results.",
    CreateTuneRawSchema,
    handleCreateTune
);

// Tool 2: List Tunes
server.tool(
    "list_tunes",
    "Lists the user's Astria fine-tunes.",
    ListTunesRawSchema,
    handleListTunes
);


// Tool 3: Generate Image
// Create a dynamic description that includes all available models
const AVAILABLE_MODELS = Object.keys(MODEL_CONFIG.MODEL_IDS);
const modelDescription = AVAILABLE_MODELS.length > 1
    ? `Available models: ${AVAILABLE_MODELS.join(', ')}`
    : `Using the ${AVAILABLE_MODELS[0]} model`;

server.tool(
    "generate_image",
    `Generate high-quality images using Astria's models. ${modelDescription}. Supports optional Flux LoRA fine-tunes when using the Flux model (LoRAs must be used with their compatible base model). Images display directly in chat and the first image opens in your browser.`,
    GenerateImageRawSchema,
    handleGenerateImage
);

// --- Start the Server ---
async function main() {
    try {
        console.error("Starting Astria MCP Server...");
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error("Astria MCP Server connected via stdio.");
    } catch (error: any) {
        console.error("Failed to start Astria MCP Server:", error.message, error.stack);
        process.exit(1);
    }
}

main();
