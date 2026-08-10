
import React from 'react'
import { Routes,Route } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import Layout from './pages/Layout'

function App() {
  return (
    <Routes>
      {/*Login Routes*/}
      <Route element={<Layout/>}>
        <Route path='/login' element={<AuthPage mode="login"/>}/>
        <Route path='/register' element={<AuthPage mode="register"/>}/>
      </Route>
    </Routes>
  )
}

export default App