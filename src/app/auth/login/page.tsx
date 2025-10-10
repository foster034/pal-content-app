'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Key } from 'lucide-react'
import { setTechSession } from '@/lib/tech-auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [techCode, setTechCode] = useState('')
  const [showTechLogin, setShowTechLogin] = useState(false)
  const [loginSettings, setLoginSettings] = useState<any>(null)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [techPhotos, setTechPhotos] = useState<string[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Fetch login settings
    fetchLoginSettings()

    // Check for saved credentials
    const savedEmail = localStorage.getItem('rememberedEmail')
    const shouldRemember = localStorage.getItem('rememberMe') === 'true'

    if (savedEmail && shouldRemember) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  useEffect(() => {
    // Rotate photos if dynamic mode is enabled
    if (loginSettings?.imageType === 'dynamic' && techPhotos.length > 0) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % techPhotos.length)
      }, 5000) // Change photo every 5 seconds

      return () => clearInterval(interval)
    }
  }, [loginSettings, techPhotos])

  const fetchLoginSettings = async () => {
    try {
      const response = await fetch('/api/login-settings')

      if (!response.ok) {
        console.error('Failed to fetch login settings:', response.status)
        throw new Error(`HTTP ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType)
        throw new Error('Invalid response type')
      }

      const data = await response.json()
      setLoginSettings(data)
      setSettingsLoaded(true)

      // If dynamic photos are enabled, fetch them
      if (data.imageType === 'dynamic') {
        fetchTechPhotos(data.jobPhotoCount || 5)
      }
    } catch (error) {
      console.error('Error fetching login settings:', error)
      // Use defaults
      setLoginSettings({
        imageType: 'static',
        staticImageUrl: '/login-background.png',
        showLatestJobs: false,
        jobPhotoCount: 5,
        headerTitle: 'Welcome back to Pop-A-Lock',
        headerSubtitle: 'Build your business efficiently with our powerful management platform.',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        loginButtonText: 'Log in',
        forgotPasswordText: 'Forgot password?',
        signupText: "Don't have an account?",
        signupLinkText: 'Sign up',
        googleButtonText: 'Continue with Google',
      })
      setSettingsLoaded(true)
    }
  }

  const fetchTechPhotos = async (limit: number) => {
    try {
      const response = await fetch(`/api/tech-photos/latest?limit=${limit}`)
      const data = await response.json()
      if (data.photos && data.photos.length > 0) {
        setTechPhotos(data.photos)
      }
    } catch (error) {
      console.error('Error fetching tech photos:', error)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Attempting to sign in with:', email)

      // Test Supabase connection first
      const { data: testData, error: testError } = await supabase.from('profiles').select('count').limit(1)
      console.log('Supabase connection test:', { testData, testError })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Sign in result:', { data, error })

      if (error) {
        console.error('Authentication error:', error)
        setError(error.message)
        return
      }

      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email)
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberedEmail')
        localStorage.removeItem('rememberMe')
      }

      // Get user profile to determine role and redirect accordingly
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          role_id,
          franchisee_id,
          roles (
            name
          )
        `)
        .eq('id', data.user.id)
        .single()

      if (profile && profile.roles) {
        switch (profile.roles.name) {
          case 'admin':
            router.push('/admin')
            break
          case 'franchisee':
            router.push('/franchisee')
            break
          case 'tech':
            router.push('/tech/dashboard')
            break
          default:
            router.push('/tech/dashboard')
        }
      } else {
        router.push('/tech/dashboard')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          setError('Connection error. Please check your internet connection and try again.')
        } else if (error.message.includes('fetch')) {
          setError('Network error. Please check if the application server is running.')
        } else {
          setError(error.message)
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTechCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!techCode.trim()) {
      setError('Please enter your tech code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/tech-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loginCode: techCode.trim() }),
      })

      const data = await response.json()

      if (data.success && data.technician) {
        // Set tech session in localStorage
        setTechSession({
          id: data.technician.id,
          name: data.technician.name,
          email: data.technician.email,
          phone: data.technician.phone,
          franchisee: data.technician.franchisee,
          loginTime: new Date().toISOString()
        })

        // Set a cookie to help with server-side middleware
        document.cookie = `tech_session=${data.technician.id}; path=/; max-age=86400` // 24 hours

        // Redirect to tech dashboard
        router.push('/tech/dashboard')
      } else {
        setError(data.error || 'Invalid tech code')
      }
    } catch (error) {
      console.error('Tech login error:', error)
      setError('Tech login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col lg:flex-row">
      {/* Background image for mobile */}
      <div className="absolute inset-0 lg:hidden">
        {settingsLoaded && loginSettings?.staticImageUrl && (
          <img
            src={loginSettings.staticImageUrl}
            alt="Pop-A-Lock Services"
            className="w-full h-full object-cover opacity-10"
          />
        )}
      </div>

      {/* Left Side - Image (hidden on mobile, visible on desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-100 relative overflow-hidden">
        {loginSettings?.imageType === 'dynamic' && techPhotos.length > 0 ? (
          <>
            {/* Dynamic Photos Slideshow */}
            {techPhotos.map((photo, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentPhotoIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={photo}
                  alt={`Tech job photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {/* Photo Indicators */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
              {techPhotos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentPhotoIndex
                      ? 'bg-white w-8'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>

            {/* Overlay text */}
            <div className="absolute bottom-16 left-8 right-8 text-white z-10">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm font-medium">Latest work from our technicians</p>
              </div>
            </div>
          </>
        ) : (
          /* Static Image */
          <div className="w-full h-full flex items-center justify-center">
            {settingsLoaded && loginSettings?.staticImageUrl ? (
              <img
                key={`img-${settingsLoaded}-${loginSettings.staticImageUrl.substring(0, 50)}`}
                src={loginSettings.staticImageUrl}
                alt="Pop-A-Lock Services"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Side - Login Form */}
      <div className="relative z-10 w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50 lg:bg-gray-50 bg-opacity-95 lg:bg-opacity-100 min-h-screen lg:min-h-0">
        <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  {loginSettings?.headerTitle || 'Welcome back to Pop-A-Lock'}
                </h2>
                <p className="text-gray-600">
                  {loginSettings?.headerSubtitle || 'Build your business efficiently with our powerful management platform.'}
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Login Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setShowTechLogin(false)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    !showTechLogin
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Login
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setShowTechLogin(true)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    showTechLogin
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Key className="h-4 w-4" />
                    Tech Code
                  </div>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={showTechLogin ? handleTechCodeLogin : handleSignIn} className="space-y-4" autoComplete="on">
                {showTechLogin ? (
                  /* Tech Code Field */
                  <div className="space-y-2">
                    <Label htmlFor="techCode" className="text-sm font-medium text-gray-700">
                      Tech Access Code
                    </Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="techCode"
                        name="techCode"
                        type="text"
                        autoComplete="off"
                        placeholder="8D0LS9"
                        value={techCode}
                        onChange={(e) => setTechCode(e.target.value.toUpperCase())}
                        className="pl-10 h-16 text-center text-2xl tracking-widest font-mono border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        maxLength={10}
                        required
                        autoFocus
                      />
                    </div>
                    <p className="text-xs text-center text-gray-500">
                      Enter your 6-digit tech code (e.g., 8D0LS9)
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        {loginSettings?.emailLabel || 'Email'}
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          placeholder="alex.jordan@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                        {loginSettings?.passwordLabel || 'Password'}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Forgot Password */}
                    <div className="flex items-center justify-between">
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                      >
                        {loginSettings?.forgotPasswordText || 'Forgot password?'}
                      </Link>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={setRememberMe}
                      />
                      <Label htmlFor="remember" className="text-sm text-gray-600 font-normal">
                        Remember sign in details
                      </Label>
                    </div>
                  </>
                )}

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {showTechLogin ? 'Verifying Code...' : 'Signing in...'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {showTechLogin ? 'Enter Dashboard' : (loginSettings?.loginButtonText || 'Log in')}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>

{showTechLogin ? (
                  /* Tech Login Help */
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-2">
                      Quick Access Instructions:
                    </p>
                    <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                      <li>Enter your 6-digit tech code (e.g., 8D0LS9)</li>
                      <li>Press "Enter Dashboard"</li>
                      <li>Start submitting jobs immediately</li>
                    </ol>
                    <p className="text-xs text-blue-600 mt-3">
                      Don't have a tech code? Contact your franchise manager.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-gray-50 px-2 text-gray-500">OR</span>
                      </div>
                    </div>

                    {/* Google Sign In */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        // Add Google sign in logic here
                        console.log('Google sign in clicked')
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        {loginSettings?.googleButtonText || 'Continue with Google'}
                      </div>
                    </Button>
                  </>
                )}
              </form>

              {/* Sign Up Link */}
              <div className="text-center">
                <span className="text-sm text-gray-600">{loginSettings?.signupText || "Don't have an account?"} </span>
                <Link
                  href="/auth/signup"
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  {loginSettings?.signupLinkText || 'Sign up'}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}