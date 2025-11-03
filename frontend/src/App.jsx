import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Places from './pages/Places'
import TripPlanner from './pages/TripPlanner'
import Navbar from './components/Navbar'

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/places" element={<Places/>} />
        <Route path="/trip-planner" element={<TripPlanner/>} />
      </Routes>
    </div>
  )
}

export default App;
