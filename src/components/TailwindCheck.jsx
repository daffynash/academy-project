export default function TailwindCheck() {
  return (
    <div className="p-6 bg-green-500 text-white rounded-lg shadow-md">
      <p className="font-medium text-lg">Tailwind check — utilities applied</p>
      <div className="mt-3 flex gap-2">
        <span className="px-3 py-1 bg-white/20 rounded">badge</span>
        <span className="px-3 py-1 bg-white/30 rounded">badge</span>
      </div>
    </div>
  )
}
