import PublicLayout from '@/layouts/PublicLayout';
import Link from 'next/link';
import { FaArrowRight, FaQuestionCircle, FaChartLine, FaClock, FaDollarSign, FaBrain, FaRobot, FaLightbulb } from 'react-icons/fa';

export default function Home() {
  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col bg-gray-950">
        {/* Animated background elements for ALGO feel */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full filter blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Main content area that grows to fill available space */}
        <main className="flex-grow flex flex-col justify-center items-center px-4 py-8 relative z-10">
          {/* ALGO Trading Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-900/80 backdrop-blur-sm border border-blue-500/30 mb-6">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-medium text-blue-200">ALGO-Powered Trading Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-center">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">Intelligent Crypto</span>
            <span className="block mt-2 text-gray-100">Wealth Building</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl text-center leading-relaxed">
            Our advanced ALGO algorithms analyze market trends 24/7 to maximize your cryptocurrency investments automatically.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-16 w-full max极速-md sm:max-w-lg">
            <Link href="/register" className="w-full sm:w-auto group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                <div className="relative px-6 py-3 sm:px-8 sm:py-4 bg-gray-900 rounded-lg flex items-center justify-center w-full border border-blue-500/30">
                  <span className="font-bold text-white group-hover:text-blue-200 transition-colors mr-2">Start Earning Now</span>
                  <FaArrowRight className="text-cyan-400" />
                </div>
              </div>
            </Link>
            
            <Link href="/#how-it-works" className="flex items-center text-gray-400 hover:text-blue-300 group transition-colors w-full sm:w-auto justify-center">
              <FaQuestionCircle className="mr-2 text-purple-400" />
              How It Works
            </Link>
          </div>

          {/* Stats Section - Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl w-full mb-16">
            <div className="bg-gray-900/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-blue-500/30 flex flex-col items-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">99%</div>
              <div className="text-gray-300 text-sm sm:text-base flex items-center">
                <FaChartLine className="mr-2 text-cyan-400" /> Accuracy Rate
              </div>
            </div>
            <div className="bg-gray-900/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-purple-500/30 flex flex-col items-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">24/7</div>
              <div className="text-gray-300 text-sm sm:text-base flex items-center">
                <FaClock className="mr-2 text-blue-400" /> Market Monitoring
              </div>
            </div>
            <div className="bg-gray-900/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-cyan-500/30 flex flex-col items-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">$10B+</div>
              <div className="text-gray-300 text-sm sm:text-base flex items-center">
                <FaDollarSign className="mr-2 text-purple-400" /> Assets Traded
              </div>
            </div>
          </div>

          {/* Additional content to demonstrate flex/grow layout */}
          <div className="w-full max-w-5xl mt-8" id="how-it-works">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-blue-500/30 p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">How Our ALGO Trading Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                    <FaBrain className="text-white text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Market Analysis</h3>
                  <p className="text-gray-300">Our ALGO analyzes thousands of market signals in real-time</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                    <FaRobot className="text-white text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Smart Decisions</h3>
                  <p className="text-gray-300">ALGO makes data-driven trading decisions instantly</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                    <FaLightbulb className="text-white text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Maximize Profits</h3>
                  <p className="text-gray-300">Automated trading executes at optimal times for maximum returns</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PublicLayout>
  );
}