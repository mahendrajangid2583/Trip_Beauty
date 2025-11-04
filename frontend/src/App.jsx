import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Places from './pages/Places'
import TripPlanner from './pages/TripPlanner'
import Navbar from './components/Navbar'

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/places" element={<Places/>} />
        <Route path="/trip-planner" element={<TripPlanner/>} />
      </Routes>
    </div>
  )
}

export default App;
