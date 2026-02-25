# Analytics Storyteller 📊✨

Transform your data into compelling narratives with AI. Upload a CSV file and watch as AI uncovers hidden insights, identifies trends, and generates actionable recommendations.

## Features

- **📁 CSV Upload** - Drag & drop or click to upload your data files
- **🤖 AI Analysis** - Claude AI analyzes your data and finds patterns
- **📖 Narrative Generation** - Get a compelling story that explains your data
- **💡 Key Insights** - Specific, data-driven findings highlighted
- **🎯 Recommendations** - Actionable next steps based on the analysis
- **📈 Auto-Visualizations** - Smart charts that highlight important trends

## Tech Stack

- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first styling
- **Claude AI** - Anthropic's AI for analysis
- **Chart.js** - Data visualization
- **PapaParse** - CSV parsing

## Getting Started

### Prerequisites

- Node.js 18+
- Anthropic API key

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/analytics-storyteller.git
cd analytics-storyteller

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key from [console.anthropic.com](https://console.anthropic.com) |

## Deploy to Render

1. Push to GitHub
2. Connect repo to Render
3. Add `ANTHROPIC_API_KEY` environment variable
4. Deploy!

Or use the `render.yaml` blueprint for one-click deploy.

## Usage

1. Upload a CSV file (drag & drop or click)
2. Preview your data
3. Click "Generate Story"
4. Read the AI-generated narrative
5. Review insights and recommendations
6. Explore the auto-generated visualization

## License

MIT
