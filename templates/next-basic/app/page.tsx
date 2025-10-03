export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">
          🚀 __PROJECT_NAME__
        </h1>
        <p className="text-xl mb-8">
          Welcome to your Next.js application!
        </p>
        <div className="bg-gray-100 p-6 rounded-lg mb-8">
          <p><strong>Framework:</strong> Next.js</p>
          <p><strong>Port:</strong> __PORT__</p>
          <p><strong>Created with:</strong> Nova</p>
        </div>
        <p className="text-gray-600">
          Edit <code className="bg-gray-200 px-2 py-1 rounded">app/page.tsx</code> to get started.
        </p>
      </div>
    </main>
  )
}