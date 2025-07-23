import React from "react";

export function DemoInfoCard() {
  return (
    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 shadow-lg backdrop-blur-sm w-full xl:w-80 h-fit xl:flex-shrink-0">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <h4 className="text-lg font-medium font-[family-name:var(--font-roobert)] text-blue-300">
          Demo Information
        </h4>
      </div>

      <div className="space-y-4 text-sm">
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-yellow-300 font-medium mb-2">⚠️ Testing Environment</p>
          <p className="text-yellow-100">
            This is a staging environment. Do not enter real payment information.
          </p>
        </div>

        <div>
          <p className="text-blue-300 font-medium mb-2">Test Card Information:</p>
          <div className="bg-gray-800/50 rounded p-3 font-mono text-xs space-y-1">
            <p><span className="text-gray-400">Cardholder Name:</span> John Doe</p>
            <p><span className="text-gray-400">Card Number:</span> 4242 4242 4242 4242</p>
            <p><span className="text-gray-400">Expiry:</span> Any future date</p>
            <p><span className="text-gray-400">CVC:</span> Any 3 digits</p>
          </div>
        </div>

        <div>
          <p className="text-blue-300 font-medium mb-2">What happens:</p>
          <ul className="text-gray-300 space-y-1 text-xs">
            <li>• Uses Abstract Testnet</li>
            <li>• NFT mints to your connected wallet</li>
            <li>• No real money is charged</li>
            <li>• Transaction is recorded on testnet</li>
          </ul>
        </div>
      </div>
    </div>
  );
}