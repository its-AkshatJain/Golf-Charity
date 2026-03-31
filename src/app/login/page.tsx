import { login, signup } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string, message?: string }> }) {
  const params = await searchParams;
  
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#fcf9f2] text-black transition-colors duration-500">
      <div className="w-full max-w-sm space-y-8 bg-white p-8 rounded-2xl shadow-xl shadow-red-900/5">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#e63946]">PLAY FOR PURPOSE</h1>
          <p className="text-gray-500 text-sm">Join the global initiative. Every score creates an impact.</p>
        </div>

        {params?.error && (
          <div className="p-3 border border-red-500/30 bg-red-50 text-red-700 text-sm rounded-lg font-medium">
            {params.error}
          </div>
        )}

        {params?.message && (
          <div className="p-3 border border-green-500/30 bg-green-50 text-green-700 text-sm rounded-lg font-medium">
            {params.message}
          </div>
        )}
        
        <form className="space-y-5 flex flex-col">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#e63946] focus:ring-1 focus:ring-[#e63946] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5 mt-2" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-[#e63946] focus:ring-1 focus:ring-[#e63946] focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-3 mt-8">
            <button
              formAction={login}
              className="w-full rounded-lg bg-[#111] text-white px-4 py-3.5 text-sm font-bold tracking-wide shadow-md hover:bg-[#e63946] hover:shadow-lg hover:shadow-[#e63946]/30 transition-all duration-300"
            >
              Log in
            </button>
            <button
              formAction={signup}
              className="w-full rounded-lg border-2 border-transparent bg-red-50 text-[#e63946] px-4 py-3.5 text-sm font-bold tracking-wide hover:bg-red-100 transition-colors"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
