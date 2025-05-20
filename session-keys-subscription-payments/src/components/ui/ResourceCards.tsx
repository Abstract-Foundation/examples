import React from 'react';

export function ResourceCards() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl mx-auto mt-8 font-[family-name:var(--font-roobert)]">
            <a
                href="https://docs.abs.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all h-full text-center backdrop-blur-sm"
            >
                <svg
                    className="w-6 h-6 mb-2 opacity-70"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z" />
                </svg>
                <h3 className="text-lg font-semibold mb-2 opacity-90">
                    Documentation
                </h3>
                <p className="text-sm opacity-70">Explore our developer docs.</p>
            </a>

            <a
                href="https://github.com/Abstract-Foundation/examples"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all h-full text-center backdrop-blur-sm"
            >
                <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24" fill="currentColor">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.42 22 12c0-5.523-4.477-10-10-10z"
                    />
                </svg>
                <h3 className="text-lg font-semibold mb-2 opacity-90">
                    GitHub Examples
                </h3>
                <p className="text-sm opacity-70">
                    View our example repos on GitHub.
                </p>
            </a>

            <a
                href="https://youtube.com/@AbstractBlockchain"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all h-full text-center backdrop-blur-sm"
            >
                <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <h3 className="text-lg font-semibold mb-2 opacity-90">
                    YouTube Channel
                </h3>
                <p className="text-sm opacity-70">
                    Watch our video tutorials on YouTube.
                </p>
            </a>
        </div>
    );
} 