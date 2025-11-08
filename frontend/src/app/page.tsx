export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md text-center space-y-6">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Welcome to <span className="text-blue-600">FileSure</span>
        </h1>
        <p className="text-gray-600">
          Manage referrals, track credits, and earn rewards easily.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <a
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Login
          </a>
          <a
            href="/register"
            className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition"
          >
            Register
          </a>
        </div>
      </div>
    </main>
  );
}
