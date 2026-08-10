
import React from 'react'
import { Routes,Route } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import {AuthLayout, GuestLayout} from './pages/Layout'
import HomePage from './pages/HomePage'
import BuilderPage from './pages/BuilderPage'
import PreviewPage from './pages/PreviewPage'

function App() {
  return (
    <Routes>
      {/*Login Routes*/}
      <Route element={<GuestLayout/>}>
        <Route path='/login' element={<AuthPage mode="login"/>}/>
        <Route path='/register' element={<AuthPage mode="register"/>}/>
      </Route>

      {/*protected Routes*/}
      <Route element={<AuthLayout/>}>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/builder/:id' element={<BuilderPage/>}/>
        <Route path='/preview/:id' element={<PreviewPage/>}/>
      </Route>
    </Routes>
  )
}

export default App