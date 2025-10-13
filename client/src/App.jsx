import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePages from './pages/HomePages.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'

const App = () => {
  return (
    <div className="bg-[url('./src/assets/bgImage.svg')] 
    bg-contain"> 
      <Routes>
        <Route path='/' element={<HomePages />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/profile' element={<ProfilePage />} />
      </Routes>
    </div>
  )
}

export default App