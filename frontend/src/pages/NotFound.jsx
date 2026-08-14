import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow-lg">
        <h1 className="text-lg font-black text-gray-900">Page not found</h1>
        <p className="mt-2 text-sm text-gray-600">
          The URL you followed does not point to any screen.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block px-4 py-1.5 bg-gray-800 hover:bg-black text-white rounded-lg text-xs font-bold cursor-pointer"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
