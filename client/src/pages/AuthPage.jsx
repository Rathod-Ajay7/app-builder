import React, { useState } from 'react'
import LoginLeft from '../components/LoginLeft'
import { Link, useNavigate } from 'react-router-dom'
import { EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

function AuthPage({ mode }) {

  const navigate = useNavigate()
  const { login, register } = useAppContext()
  const [error, seterror] = useState("")
  const [loading, setloading] = useState(false)
  const isLogin = mode == "login"
  const [name, setname] = useState("")
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")
  const [showpassword, setshowpassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    seterror("")
    setloading(true)
    try {
      if (mode === "login") {
        await login(email, password)
      }
      else {
        await register(name, email, password)
      }
      navigate("/")
    } catch (err) {
      seterror(err.message || (mode === "login" ? "Invalide email or Password" : "Registraion failed"))
    } finally {
      setloading(false)
    }
  }
  return (
    <div className="min-h-screen bg-white flex text-zinc-900 font-sans">
      {/*left panel -branding*/}
      <LoginLeft />

      {/*right panel -form*/}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          <div className="mb-10">
            <h1 className="text-3xl tracking-tight text-zinc-900 mb-1.5 font-sans">
              {isLogin ? "sign in" : "create an account"}
            </h1>
            <p className="text-zinc-400 text-sm mb-4 ">
              {isLogin ? "Enter your credentials to access your website builder." : "Get started by entering your registration details."}
            </p>

            {error && <div className="mb-6 p-3 border border-red-200 bg-red-50 text-red-700 text-xs rounded">{error}</div>}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking mb-2">
                    Full Name
                  </label>
                  <input type="text" value={name} onChange={(e) => setname(e.target.value)} required className="w-full pl-2 py-2 border-b border-zinc-200 focus:outline-none focus:border-zinc-950 text-sm text-zinc-900 bg-transparent placeholder-zinc-300 transition-colors" placeholder='walter white' />
                </div>
              )}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking mb-2">
                  Email Address
                </label>
                <input type="email" value={email} onChange={(e) => setemail(e.target.value)} required className="w-full pl-2 py-2 border-b border-zinc-200 focus:outline-none focus:border-zinc-950 text-sm text-zinc-900 bg-transparent placeholder-zinc-300 transition-colors" placeholder='walterwhite123@exmaple.com' />

              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking mb-2">
                  password
                </label>
                <div className='relative'>
                  <input type={showpassword ? "text" : "password"} value={password} onChange={(e) => setpassword(e.target.value)} required className="w-full pl-2 py-2 border-b border-zinc-200 focus:outline-none focus:border-zinc-950 text-sm text-zinc-900 bg-transparent placeholder-zinc-300 pr-8" placeholder='********' />
                  <button type='button' onClick={() => setshowpassword(!showpassword)} className='absolute right-2 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600 flex items-center justify-center cursor-pointer transition-colors'>
                    {showpassword ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className='w-full py-2.5 bg-gradient-to-br from-red-600 to-amber-600 text-white font-semibold hover:scale-105 disabled:opacity-40 flex items-center justify-center cursor-pointer mt-2 rounded-lg transition-all'>
                {loading && <Loader2Icon className='animate-spin h-3.5 w-3.5 mr-2' />}
                {isLogin ? "sign in" : "sign up"}

              </button>
            </form>
            <p className='text-sm text-zinc-400 mt-8 pt-6 border-t border-zinc-100 font-sans'>
              {isLogin ? (
                <>
                  New to builderAI?{" "}
                  <Link to="/register" className="text-zinc-900 font-medium hover:underline">
                    Create an account
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link to="/login" className="text-zinc-900 font-medium hover:underline">
                    sign in here
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage