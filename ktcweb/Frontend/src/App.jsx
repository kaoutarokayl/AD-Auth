import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">KTC Web</h1>
        <p className="text-gray-600 mb-8">Frontend Project</p>
        
        <div className="bg-indigo-50 rounded-lg p-6 mb-8">
          <p className="text-center text-gray-700 mb-4">
            Count: <span className="text-2xl font-bold text-indigo-600">{count}</span>
          </p>
          <button
            onClick={() => setCount(count + 1)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Click me
          </button>
        </div>

        <div className="text-sm text-gray-500 space-y-2">
          <p>✓ React 18</p>
          <p>✓ Vite</p>
          <p>✓ Tailwind CSS</p>
        </div>
      </div>
    </div>
  )
}
