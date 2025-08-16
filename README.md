# AI Code Generator

A modern, responsive React application that generates code using AI based on natural language prompts. Built with TypeScript, Tailwind CSS, and featuring a comprehensive dark mode, mobile-first design, and real-time statistics.

## 📸 Screenshots

<div align="center">

### Code Generation Interface
<img src="https://raw.githubusercontent.com/Shudhu7/AIcodeGen-Frontend/refs/heads/main/Screenshot%202025-08-16%20224207.png" alt="Code Generator Interface" width="800"/>

*Clean, intuitive interface for selecting programming languages and entering code prompts*

### Generated Code Output
<img src="https://raw.githubusercontent.com/Shudhu7/AIcodeGen-Frontend/refs/heads/main/Screenshot%202025-08-16%20224310.png" alt="Generated Code Display" width="800"/>

*Syntax-highlighted code output with execution time, copy, download, and clear functionality*

### Generation History
<img src="https://raw.githubusercontent.com/Shudhu7/AIcodeGen-Frontend/refs/heads/main/Screenshot%202025-08-16%20224353.png" alt="History Panel" width="800"/>

*Searchable history of previous generations with timestamps and success indicators*

### Statistics Dashboard
<img src="https://raw.githubusercontent.com/Shudhu7/AIcodeGen-Frontend/refs/heads/main/Screenshot%202025-08-16%20224425.png" alt="Statistics Dashboard" width="800"/>

*Comprehensive analytics showing usage patterns, success rates, and language preferences*

</div>

## 🚀 Features

### Core Functionality
- **AI-Powered Code Generation**: Generate code in 14+ programming languages using natural language prompts
- **Multi-Language Support**: JavaScript, TypeScript, Python, Java, C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, HTML, CSS
- **Real-time Generation**: Fast code generation with execution time tracking
- **Error Handling**: Comprehensive error reporting and user feedback

### User Experience
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Dark/Light Mode**: System preference detection with manual toggle
- **Progressive Web App**: Optimized for mobile and desktop usage
- **Keyboard Shortcuts**: Ctrl+Enter to generate code quickly
- **Copy & Download**: Easy code copying and file downloading

### Data Management
- **Generation History**: Search and browse previous code generations
- **Statistics Dashboard**: Track usage patterns, success rates, and performance metrics
- **Advanced Search**: Filter history by keywords and programming languages
- **Performance Monitoring**: Execution time tracking and success rate analysis

### Accessibility & Performance
- **WCAG Compliant**: Proper contrast ratios, keyboard navigation, screen reader support
- **Mobile Optimized**: Touch-friendly interface with proper sizing
- **Performance Optimized**: Lazy loading, efficient state management
- **Cross-browser Compatible**: Works on modern browsers with fallbacks

## 🛠️ Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **API Communication**: Fetch API with error handling
- **Build Tool**: Create React App
- **Testing**: React Testing Library & Jest

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API server running on port 8080 (or configured endpoint)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shudhu7/ai-code-generator.git
   cd ai-code-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:8080/api/codegen
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── App.tsx                 # Main application component
├── App.css                 # Global styles and Tailwind utilities
├── index.tsx              # Application entry point
├── index.css              # Base Tailwind imports
├── setupTests.ts          # Test configuration
├── reportWebVitals.ts     # Performance monitoring
└── logo.svg               # React logo asset
```

## 🔧 Configuration

### API Endpoints

The application expects a backend API with the following endpoints:

- `POST /api/codegen` - Generate code
- `GET /api/codegen/history` - Get full history
- `GET /api/codegen/history/recent?limit=N` - Get recent history
- `GET /api/codegen/stats` - Get usage statistics
- `GET /api/codegen/history/search?keyword=X` - Search history

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:8080/api/codegen` |

## 📱 Usage

### Generating Code

1. **Select Programming Language**: Choose from 14+ supported languages
2. **Enter Prompt**: Describe what code you want (max 1000 characters)
3. **Generate**: Click "Generate Code" or press Ctrl+Enter
4. **Review Results**: View generated code with syntax highlighting
5. **Copy/Download**: Use the action buttons to save your code

### Managing History

1. **View History**: Click the "History" tab to see previous generations
2. **Search**: Use the search bar to find specific generations
3. **Filter**: Results show language, timestamp, and success status
4. **Review**: Click on any history item to see the full prompt and code

### Viewing Statistics

1. **Access Stats**: Click the "Statistics" tab
2. **Overview**: See total generations, success rate, and average execution time
3. **Language Usage**: Track which languages you use most
4. **Performance**: Monitor API response times and error rates

## 🎨 Customization

### Styling

The application uses Tailwind CSS with custom utilities. Key customization points:

- **Colors**: Modify color schemes in `App.css`
- **Typography**: Update font families and sizes
- **Layout**: Adjust responsive breakpoints
- **Dark Mode**: Customize dark theme colors

### Components

- **CodeGenerationForm**: Input form for prompts and language selection
- **CodeDisplay**: Results display with syntax highlighting
- **HistoryPanel**: History management and search
- **StatsPanel**: Statistics dashboard
- **MobileNav**: Mobile navigation drawer

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🏗️ Building for Production

```bash
# Create optimized production build
npm run build

# Serve locally to test
npm install -g serve
serve -s build
```

The build folder will contain optimized files ready for deployment.

## 🚀 Deployment

### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables in Netlify dashboard

### Vercel
1. Import project from GitHub
2. Framework preset: Create React App
3. Build command: `npm run build`
4. Output directory: `build`

### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔍 API Integration

### Request Format
```typescript
interface CodeGenerationRequest {
  prompt: string;
  language: string;
}
```

### Response Format
```typescript
interface CodeGenerationResponse {
  generatedCode: string;
  prompt: string;
  language: string;
  timestamp: string;
  executionTimeMs: number;
  success: boolean;
  errorMessage?: string;
}
```

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if backend server is running
   - Verify `REACT_APP_API_URL` environment variable
   - Check network connectivity and CORS settings

2. **Dark Mode Not Persisting**
   - Ensure localStorage is available
   - Check browser privacy settings

3. **Mobile Layout Issues**
   - Clear browser cache
   - Check viewport meta tag
   - Verify Tailwind CSS is loading

4. **Code Generation Timeout**
   - Check backend API response times
   - Verify request payload size limits
   - Monitor network connectivity

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use React functional components with hooks
- Implement responsive design patterns
- Add proper error handling
- Include unit tests for new features
- Follow accessibility guidelines

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icon library
- **Create React App** for the development toolchain

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Shudhu7/ai-code-generator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Shudhu7/ai-code-generator/discussions)
