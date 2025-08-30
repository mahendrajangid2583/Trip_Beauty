import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App w-full text-center mt-10">
      <h1>Hello World</h1>
      <button onClick={() => setCount((count) => count + 1)} className="p-2 mt-4 bg-black text-white rounded-lg border-1 border-white hover:bg-gray-600 font-bold">
        count is {count}
      </button>
    </div>
  );
}

export default App;
