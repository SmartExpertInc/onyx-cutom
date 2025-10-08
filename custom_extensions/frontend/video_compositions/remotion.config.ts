import { Config } from '@remotion/cli/config';

// Set video image format for better quality
Config.setVideoImageFormat('jpeg');

// Overwrite output if file exists
Config.setOverwriteOutput(true);

// Set concurrency for rendering performance
Config.setConcurrency(2);

// Set timeout for long renders
Config.setTimeoutInMilliseconds(600000); // 10 minutes

// Enable verbose logging for debugging
Config.setLevel('info');

