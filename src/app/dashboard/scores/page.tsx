import { addScore } from "./actions";

export default function EnterScorePage() {
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Enter Score</h1>
        <p className="text-gray-400 mt-1">Submit your latest golf score in Stableford format (1 - 45). The system automatically retains your latest 5 rounds.</p>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <form action={addScore} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300" htmlFor="score">
              Stableford Score
            </label>
            <input
              id="score"
              name="score"
              type="number"
              min="1"
              max="45"
              required
              className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-white focus:border-[#ff3c00] focus:outline-none focus:ring-1 focus:ring-[#ff3c00]"
              placeholder="e.g. 36"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300" htmlFor="date">
              Round Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-white focus:border-[#ff3c00] focus:outline-none focus:ring-1 focus:ring-[#ff3c00]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-white text-black px-4 py-2 font-bold hover:bg-gray-200 transition-colors"
          >
            Submit Score
          </button>
        </form>
      </div>
    </div>
  );
}
