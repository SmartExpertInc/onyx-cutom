# Elai API Test Script

This script comprehensively tests the Elai API integration for creating green screen avatar videos that can be used for chroma key overlay on custom slides.

## Features

✅ **Complete API Workflow**: Create → Render → Monitor → Download  
✅ **Green Screen Background**: Perfect for chroma key removal  
✅ **Detailed Logging**: All requests/responses logged for debugging  
✅ **Progress Monitoring**: Real-time status updates during rendering  
✅ **Automatic Download**: Downloads completed video to local storage  
✅ **Error Handling**: Robust error handling and timeout management  

## Prerequisites

1. **Elai Account**: You need an active Elai account with API access
2. **API Token**: Generate your API token from Elai's API Settings page
3. **Python 3.7+**: Make sure you have Python 3.7 or higher installed

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

Or install manually:
```bash
pip install requests
```

### 2. Set API Token

**On Windows:**
```cmd
set ELAI_API_TOKEN=your_actual_api_token_here
```

**On macOS/Linux:**
```bash
export ELAI_API_TOKEN="your_actual_api_token_here"
```

**Note**: Replace `your_actual_api_token_here` with your real Elai API token from [Elai API Settings](https://elai.io/api-settings).

### 3. Run the Test

```bash
python test_elai_api.py
```

## What the Script Does

### 1. **Create Video** (`POST /api/v1/videos`)
- Creates a video with a single slide
- Features the "Gia Casual" avatar on pure green background (`#00FF00`)
- Uses a ~1-minute voiceover script (optimized for natural speech timing)
- Avatar is centered and scaled to 50% for optimal visibility

### 2. **Start Rendering** (`POST /api/v1/videos/render/{video_id}`)
- Initiates the video rendering process
- Returns immediately while processing continues in background

### 3. **Monitor Progress** (`GET /api/v1/videos/{video_id}`)
- Checks status every 30 seconds
- Handles statuses: `draft`, `queued`, `rendering`, `rendered`, `failed`
- Maximum wait time: 15 minutes (configurable)

### 4. **Download Video** (Direct HTTP download)
- Downloads the completed MP4 file
- Shows download progress
- Saves with timestamp: `elai_green_screen_video_YYYYMMDD_HHMMSS.mp4`

## Output Files

- **Video File**: `elai_green_screen_video_YYYYMMDD_HHMMSS.mp4`
- **Log File**: `elai_api_test_YYYYMMDD_HHMMSS.log`

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/videos` | POST | Create new video |
| `/api/v1/videos/render/{id}` | POST | Start rendering |
| `/api/v1/videos/{id}` | GET | Check status |
| Video URL | GET | Download completed video |

## Green Screen Specifications

- **Background Color**: `#00FF00` (pure green)
- **Avatar**: Gia Casual (female, professional appearance)
- **Positioning**: Centered for optimal chroma key removal
- **Scale**: 50% for good visibility without edge artifacts

## Expected Timing

- **Video Creation**: ~5 seconds
- **Rendering Time**: 3-10 minutes (depends on Elai server load)
- **Download Time**: 30 seconds - 2 minutes (depends on file size and connection)
- **Total Duration**: ~5-15 minutes

## Troubleshooting

### Common Issues

**"ELAI_API_TOKEN environment variable not set!"**
- Make sure you've set the environment variable correctly
- Restart your terminal/command prompt after setting it

**"Failed to create video. Status: 401"**
- Your API token is invalid or expired
- Generate a new token from Elai API Settings

**"Failed to create video. Status: 403"**
- Your account doesn't have API access
- Check your Elai subscription plan

**"Timeout after 15 minutes"**
- Elai servers might be under heavy load
- Try again later or contact Elai support

**Download fails**
- Check your internet connection
- The video URL might have expired (generate a new video)

### Debug Information

The script logs all HTTP requests and responses, including:
- Request headers and body
- Response status codes and headers  
- Full response JSON for debugging
- Timing information for each step

## Integration with Your Slides

Once you have the green screen video:

1. **Remove Green Background**: Use video editing software or programmatic chroma key removal
2. **Overlay on Slides**: Composite the transparent avatar onto your slide backgrounds
3. **Sync with Content**: Align the avatar timing with your slide transitions

## API Rate Limits

Be aware of Elai's rate limits:
- Check your account plan for API usage limits
- The script includes reasonable delays between requests
- Monitor your usage in the Elai dashboard

## Security Notes

- Never commit your API token to version control
- Use environment variables for sensitive credentials
- Regenerate your API token if compromised

## Support

- **Elai API Documentation**: https://elai.readme.io/reference
- **Elai Support**: Contact through their support portal
- **Script Issues**: Check the generated log files for detailed error information 