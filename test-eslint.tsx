// Test file for ESLint custom rule
export default function TestComponent() {
  return (
    <div>
      <h1>This should trigger ESLint error</h1>
      <p>Another hardcoded string</p>
      <button>Click me</button>
    </div>
  );
}
