'use client';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            TechMate Hunt
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 md:mb-8">
            Find your technical match and win exciting prizes!
          </p>
          <p className="text-base md:text-lg text-gray-400">
            Join our unique tech community event where knowledge meets connection
          </p>
        </div>

        <div className="mt-12 md:mt-24">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-gray-100">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 max-w-5xl mx-auto">
            <div className="p-6 md:p-8 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700 hover:border-blue-500 transition-all duration-300">
              <div className="text-blue-400 text-3xl md:text-4xl font-bold mb-3 md:mb-4">01</div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Register</h3>
              <p className="text-sm md:text-base text-gray-400">Create your account and begin your journey to find your technical counterpart</p>
            </div>
            
            <div className="p-6 md:p-8 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700 hover:border-purple-500 transition-all duration-300">
              <div className="text-purple-400 text-3xl md:text-4xl font-bold mb-3 md:mb-4">02</div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Get Your Clue</h3>
              <p className="text-sm md:text-base text-gray-400">Receive a unique technical question or answer that will lead you to your match</p>
            </div>
            
            <div className="p-6 md:p-8 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700 hover:border-pink-500 transition-all duration-300">
              <div className="text-pink-400 text-3xl md:text-4xl font-bold mb-3 md:mb-4">03</div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Find & Win</h3>
              <p className="text-sm md:text-base text-gray-400">Connect with your technical match and claim exciting prizes together</p>
            </div>
          </div>
        </div>

        <div className="mt-12 md:mt-24 text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-gray-100">Ready to Begin?</h2>
          <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto">
            Join hundreds of tech enthusiasts in this exciting hunt for knowledge and connection. 
            Use the navigation above to get started!
          </p>
        </div>
      </div>
    </div>
  );
}
