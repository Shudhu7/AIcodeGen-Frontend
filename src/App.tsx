import React, { useState, useCallback } from 'react';
import { Code, Play, History, BarChart3, Copy, Download, RefreshCw, AlertCircle, CheckCircle, Clock, Trash2 } from 'lucide-react';

// Types
interface CodeGenerationRequest {
  prompt: string;
  language: string;
}

interface CodeGenerationResponse {
  generatedCode: string;
  prompt: string;
  language: string;
  timestamp: string;
  executionTimeMs: number;
  success: boolean;
  errorMessage?: string;
}

interface CodeHistory {
  id: number;
  userPrompt: string;
  programmingLanguage: string;
  generatedCode: string;
  createdAt: string;
  executionTimeMs: number;
  success: boolean;
  errorMessage?: string;
}

interface Stats {
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  averageExecutionTimeMs: number;
  successRate: number;
  languageUsage: { [key: string]: number };
}

// API Service
class APIService {
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/codegen';

  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return response.json();
  }

  async getHistory(): Promise<CodeHistory[]> {
    const response = await fetch(`${this.baseUrl}/history`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  }

  async getRecentHistory(limit: number = 10): Promise<CodeHistory[]> {
    const response = await fetch(`${this.baseUrl}/history/recent?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch recent history');
    return response.json();
  }

  async getStats(): Promise<Stats> {
    const response = await fetch(`${this.baseUrl}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  }

  async searchHistory(keyword: string): Promise<CodeHistory[]> {
    const response = await fetch(`${this.baseUrl}/history/search?keyword=${encodeURIComponent(keyword)}`);
    if (!response.ok) throw new Error('Failed to search history');
    return response.json();
  }
}

const apiService = new APIService();

// Components
const CodeGenerationForm: React.FC<{
  onGenerate: (request: CodeGenerationRequest) => void;
  isLoading: boolean;
}> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('javascript');

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 
    'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'html', 'css'
  ];

  const handleSubmit = () => {
    if (prompt.trim() && language) {
      onGenerate({ prompt: prompt.trim(), language });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <Code className="mr-2" />
        Generate Code
      </h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
            Programming Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            Code Requirement (max 1000 characters)
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe what code you want to generate... (Ctrl+Enter to submit)"
            rows={4}
            maxLength={1000}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {prompt.length}/1000 characters
          </div>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={isLoading || !prompt.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <RefreshCw className="animate-spin mr-2 h-4 w-4" />
              Generating...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Generate Code
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const CodeDisplay: React.FC<{
  result: CodeGenerationResponse | null;
  onClear: () => void;
}> = ({ result, onClear }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    if (result?.generatedCode) {
      try {
        await navigator.clipboard.writeText(result.generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  }, [result?.generatedCode]);

  const downloadCode = useCallback(() => {
    if (result?.generatedCode) {
      const blob = new Blob([result.generatedCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-code.${getFileExtension(result.language)}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [result]);

  const getFileExtension = (language: string): string => {
    const extensions: { [key: string]: string } = {
      javascript: 'js', typescript: 'ts', python: 'py', java: 'java',
      cpp: 'cpp', csharp: 'cs', go: 'go', rust: 'rs', php: 'php',
      ruby: 'rb', swift: 'swift', kotlin: 'kt', html: 'html', css: 'css'
    };
    return extensions[language] || 'txt';
  };

  if (!result) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          {result.success ? (
            <CheckCircle className="text-green-500 mr-2" />
          ) : (
            <AlertCircle className="text-red-500 mr-2" />
          )}
          Generated {result.language.charAt(0).toUpperCase() + result.language.slice(1)} Code
        </h3>
        
        <div className="flex items-center space-x-2">
          <span className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            {result.executionTimeMs}ms
          </span>
          {result.success && (
            <>
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center text-sm"
              >
                {copied ? <CheckCircle className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={downloadCode}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center text-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </button>
            </>
          )}
          <button
            onClick={onClear}
            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center text-sm"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </button>
        </div>
      </div>
      
      <div className="mb-3">
        <span className="text-sm font-medium text-gray-600">Prompt: </span>
        <span className="text-sm text-gray-800">{result.prompt}</span>
      </div>
      
      {result.success ? (
        <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto text-sm font-mono">
          <code>{result.generatedCode}</code>
        </pre>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">
            <strong>Error:</strong> {result.errorMessage}
          </p>
        </div>
      )}
    </div>
  );
};

const HistoryPanel: React.FC<{
  history: CodeHistory[];
  onSearchHistory: (keyword: string) => void;
  isVisible: boolean;
}> = ({ history, onSearchHistory, isVisible }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearchHistory(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <History className="mr-2" />
        Generation History
      </h3>
      
      <div className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search history..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {history.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No history found.</p>
        ) : (
          history.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">
                  {item.programmingLanguage.charAt(0).toUpperCase() + item.programmingLanguage.slice(1)}
                </span>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {item.success ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                  <span>{item.executionTimeMs}ms</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">{item.userPrompt}</p>
              {item.success ? (
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-32">
                  <code>{item.generatedCode.substring(0, 200)}...</code>
                </pre>
              ) : (
                <p className="text-red-600 text-sm">{item.errorMessage}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const StatsPanel: React.FC<{ stats: Stats | null; isVisible: boolean }> = ({ stats, isVisible }) => {
  if (!isVisible || !stats) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <BarChart3 className="mr-2" />
        Statistics
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-blue-800">Total</h4>
          <p className="text-2xl font-bold text-blue-600">{stats.totalGenerations}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-green-800">Successful</h4>
          <p className="text-2xl font-bold text-green-600">{stats.successfulGenerations}</p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-red-800">Failed</h4>
          <p className="text-2xl font-bold text-red-600">{stats.failedGenerations}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-purple-800">Success Rate</h4>
          <p className="text-2xl font-bold text-purple-600">{stats.successRate.toFixed(1)}%</p>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">Average Execution Time</h4>
        <p className="text-xl text-gray-600">{stats.averageExecutionTimeMs.toFixed(0)}ms</p>
      </div>
      
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-2">Language Usage</h4>
        <div className="space-y-2">
          {Object.entries(stats.languageUsage).map(([language, count]) => (
            <div key={language} className="flex justify-between items-center">
              <span className="capitalize">{language}</span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const AICodeGenerator: React.FC = () => {
  const [result, setResult] = useState<CodeGenerationResponse | null>(null);
  const [history, setHistory] = useState<CodeHistory[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generator' | 'history' | 'stats'>('generator');

  const handleGenerate = async (request: CodeGenerationRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.generateCode(request);
      setResult(response);
      
      // Refresh history and stats after successful generation
      await loadHistory();
      await loadStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to generate code: ${errorMessage}`);
      console.error('Code generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchHistory = async (keyword: string) => {
    try {
      const searchResults = keyword.trim() 
        ? await apiService.searchHistory(keyword)
        : await apiService.getRecentHistory(20);
      setHistory(searchResults);
    } catch (err) {
      setError('Failed to search history');
    }
  };

  const loadHistory = async () => {
    try {
      const historyData = await apiService.getRecentHistory(20);
      setHistory(historyData);
    } catch (err) {
      console.error('Failed to load history:', err);
      // Don't set error state for background data loading
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await apiService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load statistics:', err);
      // Don't set error state for background data loading
    }
  };

  // Load initial data
  React.useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Code className="mr-3 text-blue-600" />
              AI Code Generator
            </h1>
            
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('generator')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'generator' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Generator
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'history' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'stats' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Statistics
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
              <p className="text-red-800 flex-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-600 hover:text-red-800 font-bold text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {activeTab === 'generator' && (
          <>
            <CodeGenerationForm onGenerate={handleGenerate} isLoading={isLoading} />
            <CodeDisplay result={result} onClear={() => setResult(null)} />
          </>
        )}

        <HistoryPanel
          history={history}
          onSearchHistory={handleSearchHistory}
          isVisible={activeTab === 'history'}
        />

        <StatsPanel stats={stats} isVisible={activeTab === 'stats'} />
      </main>
    </div>
  );
};

export default AICodeGenerator;