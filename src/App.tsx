import React, { useState, useCallback, useEffect } from 'react';
import { Code, Play, History, BarChart3, Copy, Download, RefreshCw, AlertCircle, CheckCircle, Clock, Trash2, Moon, Sun, Menu, X, Search } from 'lucide-react';

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

// Dark Mode Hook
const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return [darkMode, setDarkMode];
};

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

// Mobile Navigation Component
const MobileNav: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: 'generator' | 'history' | 'stats') => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}> = ({ isOpen, onClose, activeTab, onTabChange, darkMode, toggleDarkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
          <button onClick={onClose} className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          <button
            onClick={() => { onTabChange('generator'); onClose(); }}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'generator' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Code className="w-5 h-5 inline mr-3" />
            Generator
          </button>
          
          <button
            onClick={() => { onTabChange('history'); onClose(); }}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'history' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <History className="w-5 h-5 inline mr-3" />
            History
          </button>
          
          <button
            onClick={() => { onTabChange('stats'); onClose(); }}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'stats' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-3" />
            Statistics
          </button>
          
          <div className="border-t dark:border-gray-700 pt-4 mt-4">
            <button
              onClick={toggleDarkMode}
              className="w-full text-left px-4 py-3 rounded-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 inline mr-3" /> : <Moon className="w-5 h-5 inline mr-3" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <Code className="mr-2 w-5 h-5 sm:w-6 sm:h-6" />
        Generate Code
      </h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Programming Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            required
          />
          <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
            {prompt.length}/1000 characters
          </div>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={isLoading || !prompt.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white flex items-center">
          {result.success ? (
            <CheckCircle className="text-green-500 mr-2 w-5 h-5" />
          ) : (
            <AlertCircle className="text-red-500 mr-2 w-5 h-5" />
          )}
          Generated {result.language.charAt(0).toUpperCase() + result.language.slice(1)} Code
        </h3>
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            {result.executionTimeMs}ms
          </span>
          {result.success && (
            <>
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center text-sm transition-colors"
              >
                {copied ? <CheckCircle className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={downloadCode}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center text-sm transition-colors"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </button>
            </>
          )}
          <button
            onClick={onClear}
            className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 flex items-center text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </button>
        </div>
      </div>
      
      <div className="mb-3">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Prompt: </span>
        <span className="text-sm text-gray-800 dark:text-gray-200 break-words">{result.prompt}</span>
      </div>
      
      {result.success ? (
        <div className="relative">
          <pre className="bg-gray-900 dark:bg-gray-950 text-green-400 p-4 rounded-md overflow-x-auto text-xs sm:text-sm font-mono">
            <code>{result.generatedCode}</code>
          </pre>
        </div>
      ) : (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <p className="text-red-800 dark:text-red-300 text-sm">
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <History className="mr-2 w-5 h-5" />
        Generation History
      </h3>
      
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search history..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {history.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No history found.</p>
        ) : (
          history.map((item) => (
            <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 space-y-1 sm:space-y-0">
                <span className="font-medium text-gray-800 dark:text-white">
                  {item.programmingLanguage.charAt(0).toUpperCase() + item.programmingLanguage.slice(1)}
                </span>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  {item.success ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="hidden sm:inline">{new Date(item.createdAt).toLocaleString()}</span>
                  <span className="sm:hidden">{new Date(item.createdAt).toLocaleDateString()}</span>
                  <span>{item.executionTimeMs}ms</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 break-words">{item.userPrompt}</p>
              {item.success ? (
                <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-xs overflow-x-auto max-h-32">
                  <code className="text-gray-800 dark:text-gray-200">{item.generatedCode.substring(0, 200)}...</code>
                </pre>
              ) : (
                <p className="text-red-600 dark:text-red-400 text-sm break-words">{item.errorMessage}</p>
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <BarChart3 className="mr-2 w-5 h-5" />
        Statistics
      </h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg">
          <h4 className="text-sm sm:text-lg font-semibold text-blue-800 dark:text-blue-300">Total</h4>
          <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalGenerations}</p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded-lg">
          <h4 className="text-sm sm:text-lg font-semibold text-green-800 dark:text-green-300">Successful</h4>
          <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{stats.successfulGenerations}</p>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-3 sm:p-4 rounded-lg">
          <h4 className="text-sm sm:text-lg font-semibold text-red-800 dark:text-red-300">Failed</h4>
          <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">{stats.failedGenerations}</p>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 rounded-lg">
          <h4 className="text-sm sm:text-lg font-semibold text-purple-800 dark:text-purple-300">Success Rate</h4>
          <p className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.successRate.toFixed(1)}%</p>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-2">Average Execution Time</h4>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">{stats.averageExecutionTimeMs.toFixed(0)}ms</p>
      </div>
      
      <div>
        <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-2">Language Usage</h4>
        <div className="space-y-2">
          {Object.entries(stats.languageUsage).map(([language, count]) => (
            <div key={language} className="flex justify-between items-center text-sm sm:text-base">
              <span className="capitalize text-gray-700 dark:text-gray-300">{language}</span>
              <span className="font-medium text-gray-900 dark:text-white">{count}</span>
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
  const [darkMode, setDarkMode] = useDarkMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await apiService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  // Load initial data
  useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Code className="mr-2 sm:mr-3 text-blue-600 dark:text-blue-400 w-6 h-6 sm:w-8 sm:h-8" />
              <span className="hidden sm:inline">AI Code Generator</span>
              <span className="sm:hidden">AI CodeGen</span>
            </h1>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('generator')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'generator' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Generator
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'history' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'stats' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Statistics
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </nav>

            {/* Mobile Controls */}
            <div className="flex items-center space-x-2 lg:hidden">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
              <p className="text-red-800 dark:text-red-300 flex-1 text-sm sm:text-base break-words">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 font-bold text-lg leading-none"
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