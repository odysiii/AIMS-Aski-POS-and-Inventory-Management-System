import { Component } from 'react';

/**
 * Route-level error boundary. Without this, one bad render inside a chart or a
 * malformed API response white-screens the entire application.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Kept simple on purpose — real telemetry belongs behind an env-guarded init.
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow-lg">
          <h1 className="text-lg font-black text-gray-900">Something went wrong</h1>
          <p className="mt-2 text-xs text-gray-600 break-words">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-4 px-4 py-1.5 bg-gray-800 hover:bg-black text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}
