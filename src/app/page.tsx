import PublicLayout from '@/layouts/PublicLayout';
import Link from 'next/link';
import { FaArrowRight, FaQuestionCircle, FaChartLine, FaClock, FaDollarSign } from 'react-icons/fa';

export default function Home() {
  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-black">
        {/* Main content area that grows to fill available space */}
        <main className="flex-grow flex flex-col justify-center items-center px-4 py-8">
          {/* AI Trading Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-800 border border-gray-700 mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-300">AI-Powered Trading Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-center">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent">Intelligent Crypto</span>
            <span className="block mt-2 text-gray-100">Wealth Building</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl text-center leading-relaxed">
            Our advanced AI algorithms analyze market trends 24/7 to maximize your cryptocurrency investments automatically.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-16 w-full max-w-md sm:max-w-lg">
            <Link href="/register" className="w-full sm:w-auto group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                <div className="relative px-6 py-3 sm:px-8 sm:py-4 bg-gray-900 rounded-lg flex items-center justify-center w-full">
                  <span className="font-bold text-white group-hover:text-yellow-200 transition-colors mr-2">Start Earning Now</span>
                  <FaArrowRight className="text-yellow-400" />
                </div>
              </div>
            </Link>
            
            <Link href="/about" className="flex items-center text-gray-400 hover:text-gray-200 group transition-colors w-full sm:w-auto justify-center">
              <FaQuestionCircle className="mr-2 text-yellow-500" />
              How It Works
            </Link>
          </div>

          {/* Stats Section - Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl w-full mb-16">
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-700/50 flex flex-col items-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">99%</div>
              <div className="text-gray-400 text-sm sm:text-base flex items-center">
                <FaChartLine className="mr-2 text-green-400" /> Accuracy Rate
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-700/50 flex flex-col items-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">24/7</div>
              <div className="text-gray-400 text-sm sm:text-base flex items-center">
                <FaClock className="mr-2 text-blue-400" /> Market Monitoring
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-700/50 flex flex-col items-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">$10B+</div>
              <div className="text-gray-400 text-sm sm:text-base flex items-center">
                <FaDollarSign className="mr-2 text-yellow-400" /> Assets Traded
              </div>
            </div>
          </div>

          {/* Additional content to demonstrate flex/grow layout */}
          <div className="w-full max-w-5xl mt-8">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">How Our AI Trading Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-gray-900">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Market Analysis</h3>
                  <p className="text-gray-400">Our AI analyzes thousands of market signals in real-time</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-gray-900">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Smart Decisions</h3>
                  <p className="text-gray-400">AI makes data-driven trading decisions instantly</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-gray-900">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Maximize Profits</h3>
                  <p className="text-gray-400">Automated trading executes at optimal times for maximum returns</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PublicLayout>
  );
}