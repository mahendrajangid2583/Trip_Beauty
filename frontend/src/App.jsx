import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Home from "./pages/Home";

const appRouter=createBrowserRouter([
  {
    path:'/',
    element:<Home/>
  }
]);

function App() {
  

  return (<RouterProvider router={appRouter}/>
  );
}

export default App;
