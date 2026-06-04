'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Upload, Image as ImageIcon, Crown, Zap, Shield, ChevronRight,
  Download, X, Check, Loader2, Menu, LogOut, User, DollarSign, Users,
  CreditCard, Eye, Trash2, CheckCircle, XCircle, Clock, Camera,
  Palette, Wand2, Star, ArrowRight, Copy, ExternalLink, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────
type ViewType = 'landing' | 'editor' | 'pricing' | 'admin'

interface BackgroundOption {
  id: string
  name: string
  emoji: string
  gradient: string
}

interface BranchData {
  id: string
  name: string
  description: string
  color: string
  gradient: string
  icon: string
  backgrounds: BackgroundOption[]
}

// ─── Data ────────────────────────────────────────────────────────────
const BRANCHES: BranchData[] = [
  {
    id: 'vanilla',
    name: 'Vanilla',
    description: 'Elegante y romántico. Estilos suaves y sofisticados para fotos artísticas.',
    color: '#f472b6',
    gradient: 'from-pink-500 to-rose-400',
    icon: '🌸',
    backgrounds: [
      { id: 'v1', name: 'Romántico Sunset', emoji: '🌅', gradient: 'from-orange-400 to-pink-500' },
      { id: 'v2', name: 'Garden Dreams', emoji: '🌺', gradient: 'from-green-400 to-pink-400' },
      { id: 'v3', name: 'Soft Bokeh', emoji: '✨', gradient: 'from-purple-300 to-pink-300' },
      { id: 'v4', name: 'Elegant Interior', emoji: '🏛️', gradient: 'from-amber-300 to-stone-400' },
      { id: 'v5', name: 'Beach Paradise', emoji: '🏖️', gradient: 'from-cyan-400 to-yellow-300' },
      { id: 'v6', name: 'Cherry Blossom', emoji: '🌸', gradient: 'from-pink-300 to-rose-200' },
    ]
  },
  {
    id: 'versatil',
    name: 'Versátil',
    description: 'Moderno y dinámico. Estilos urbanos y profesionales para contenido premium.',
    color: '#a78bfa',
    gradient: 'from-violet-500 to-purple-400',
    icon: '⚡',
    backgrounds: [
      { id: 'vs1', name: 'Neon City', emoji: '🌃', gradient: 'from-violet-600 to-blue-500' },
      { id: 'vs2', name: 'Studio Pro', emoji: '📸', gradient: 'from-gray-700 to-gray-500' },
      { id: 'vs3', name: 'Urban Vibes', emoji: '🏙️', gradient: 'from-slate-600 to-zinc-500' },
      { id: 'vs4', name: 'Rooftop Night', emoji: '🌙', gradient: 'from-indigo-700 to-purple-600' },
      { id: 'vs5', name: 'Art Gallery', emoji: '🎨', gradient: 'from-fuchsia-500 to-violet-500' },
      { id: 'vs6', name: 'Cyberpunk', emoji: '🤖', gradient: 'from-cyan-500 to-purple-600' },
    ]
  },
  {
    id: 'fetish',
    name: 'Fetish',
    description: 'Oscuro y atrevido. Estilos provocativos y misteriosos para contenido audaz.',
    color: '#dc2626',
    gradient: 'from-red-600 to-red-800',
    icon: '🔥',
    backgrounds: [
      { id: 'f1', name: 'Dark Dungeon', emoji: '⛓️', gradient: 'from-gray-900 to-red-950' },
      { id: 'f2', name: 'Red Room', emoji: '🔴', gradient: 'from-red-700 to-red-900' },
      { id: 'f3', name: 'Leather & Chains', emoji: '🖤', gradient: 'from-zinc-800 to-red-800' },
      { id: 'f4', name: 'Candle Shadows', emoji: '🕯️', gradient: 'from-amber-800 to-red-950' },
      { id: 'f5', name: 'Velvet Dreams', emoji: '🎭', gradient: 'from-purple-900 to-red-800' },
      { id: 'f6', name: 'Gothic Cathedral', emoji: '🏰', gradient: 'from-slate-900 to-purple-900' },
    ]
  }
]

// ─── Particle Background Component ──────────────────────────────────
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const colors = ['#dc2626', '#f59e0b', '#8b5cf6', '#dc2626', '#f59e0b']
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()
      })

      // Draw connections
      ctx.globalAlpha = 0.05
      ctx.strokeStyle = '#dc2626'
      ctx.lineWidth = 0.5
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.globalAlpha = 0.05 * (1 - dist / 150)
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1
      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    />
  )
}

// ─── Auth Dialog Component ──────────────────────────────────────────
function AuthDialog({ mode, open, onClose, onSwitch }: {
  mode: 'login' | 'register'
  open: boolean
  onClose: () => void
  onSwitch: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name })
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Error al registrarse')
          return
        }
        toast.success('Cuenta creada. Ahora inicia sesión.')
        onSwitch()
      } else {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })
        if (result?.error) {
          toast.error('Email o contraseña incorrectos')
        } else {
          toast.success('Sesión iniciada')
          onClose()
        }
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-strong sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gradient-crimson text-2xl font-bold">
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === 'login'
              ? 'Accede a tu cuenta de MagicVisual'
              : 'Regístrate para empezar a editar fotos con IA'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tu nombre"
                className="bg-secondary/50 border-white/10 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="bg-secondary/50 border-white/10 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-secondary/50 border-white/10 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-crimson hover:bg-crimson-dark text-white glow-crimson"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                ¿No tienes cuenta?{' '}
                <button type="button" onClick={onSwitch} className="text-crimson hover:underline">
                  Regístrate
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{' '}
                <button type="button" onClick={onSwitch} className="text-crimson hover:underline">
                  Inicia sesión
                </button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Payment Dialog Component ───────────────────────────────────────
function PaymentDialog({ open, onClose, plan, billingCycle, userId }: {
  open: boolean
  onClose: () => void
  plan: 'pro' | 'premium'
  billingCycle: 'weekly' | 'monthly'
  userId: string
}) {
  const [paymentTab, setPaymentTab] = useState('crypto')
  const [txHash, setTxHash] = useState('')
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const amounts: Record<string, Record<string, number>> = {
    pro: { weekly: 5.99, monthly: 12.99 },
    premium: { weekly: 6.99, monthly: 25.00 },
  }
  const amount = amounts[plan][billingCycle]

  const handleCreatePayment = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount,
          currency: paymentTab === 'crypto' ? 'USDT' : 'ARS',
          plan,
          billingCycle,
          method: paymentTab === 'crypto' ? 'crypto' : 'mercadopago',
        })
      })
      const data = await res.json()
      if (res.ok) {
        setPaymentId(data.id)
        setSubmitted(true)
        toast.success('Pago registrado. Completa el pago para activar tu plan.')
      } else {
        toast.error(data.error || 'Error al crear pago')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyPayment = async () => {
    if (!paymentId || !txHash) return
    setLoading(true)
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, txHash })
      })
      if (res.ok) {
        toast.success('Hash de transacción enviado. Verificaremos tu pago pronto.')
        onClose()
      } else {
        toast.error('Error al verificar pago')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const walletAddress = process.env.NEXT_PUBLIC_BINANCE_WALLET || '0x0000000000000000000000000000000000000000'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-strong sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-gradient-gold text-2xl font-bold">
            Activar Plan {plan === 'pro' ? 'Pro' : 'Premium'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            ${amount} {billingCycle === 'weekly' ? '/ semana' : '/ mes'} • {billingCycle === 'weekly' ? 'Semanal' : 'Mensual'}
          </DialogDescription>
        </DialogHeader>

        {!submitted ? (
          <div className="space-y-4">
            <Tabs value={paymentTab} onValueChange={setPaymentTab}>
              <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                <TabsTrigger value="crypto" className="data-[state=active]:bg-crimson data-[state=active]:text-white">
                  Cripto (USDT)
                </TabsTrigger>
                <TabsTrigger value="mercadopago" className="data-[state=active]:bg-crimson data-[state=active]:text-white">
                  Mercado Pago
                </TabsTrigger>
              </TabsList>

              <TabsContent value="crypto" className="space-y-4 mt-4">
                <div className="rounded-lg bg-secondary/30 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-gold">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Red BSC (BEP-20)</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Wallet de pago:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-background/50 p-2 rounded break-all">{walletAddress}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(walletAddress)
                          toast.success('Dirección copiada')
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-center py-2">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${walletAddress}`}
                      alt="QR Code"
                      className="rounded-lg bg-white p-2"
                      width={160}
                      height={160}
                    />
                  </div>
                  <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Abre tu wallet (Binance, Trust Wallet, etc.)</li>
                    <li>Envía <strong className="text-foreground">{amount} USDT</strong> por red <strong className="text-gold">BSC (BEP-20)</strong></li>
                    <li>Copia el hash de la transacción</li>
                    <li>Pégalo abajo para verificar tu pago</li>
                  </ol>
                </div>
              </TabsContent>

              <TabsContent value="mercadopago" className="space-y-4 mt-4">
                <div className="rounded-lg bg-secondary/30 p-4 space-y-3 text-center">
                  <div className="text-4xl mb-2">💳</div>
                  <p className="text-sm text-muted-foreground">
                    Paga con Mercado Pago en pesos argentinos
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    ${(amount * 1200).toLocaleString('es-AR')} ARS
                  </p>
                  <Button
                    variant="outline"
                    className="border-gold/50 text-gold hover:bg-gold/10"
                    onClick={() => window.open('#', '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ir a Mercado Pago
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Después de pagar, vuelve y registra tu pago
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <Button
              className="w-full bg-gold hover:bg-gold-dark text-background font-bold glow-gold"
              onClick={handleCreatePayment}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Registrar Pago
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-secondary/30 p-4 space-y-3">
              <div className="flex items-center gap-2 text-gold">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Pago registrado</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Ingresa el hash de tu transacción para verificar el pago:
              </p>
              <div className="space-y-2">
                <Input
                  value={txHash}
                  onChange={e => setTxHash(e.target.value)}
                  placeholder="0x... (Hash de transacción)"
                  className="bg-secondary/50 border-white/10 text-foreground placeholder:text-muted-foreground text-sm"
                />
                <Button
                  className="w-full bg-crimson hover:bg-crimson-dark text-white glow-crimson"
                  onClick={handleVerifyPayment}
                  disabled={loading || !txHash}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Verificar Pago
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Tu plan se activará automáticamente una vez verificado el pago.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Image Result Dialog ────────────────────────────────────────────
function ImageResultDialog({ open, onClose, imageUrl, hasWatermark }: {
  open: boolean
  onClose: () => void
  imageUrl: string | null
  hasWatermark: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (!open || !imageUrl || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      if (hasWatermark) {
        ctx.save()
        ctx.globalAlpha = 0.12
        ctx.font = `bold ${Math.max(20, img.width * 0.05)}px Arial, sans-serif`
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.translate(img.width / 2, img.height / 2)
        ctx.rotate(-Math.PI / 6)
        for (let y = -img.height; y < img.height; y += 100) {
          for (let x = -img.width; x < img.width; x += 350) {
            ctx.fillText('MagicVisual', x, y)
          }
        }
        ctx.restore()
      }
    }
    img.onerror = () => {
      console.error('Failed to load result image')
    }
    img.src = imageUrl
  }, [open, imageUrl, hasWatermark])

  const handleDownload = () => {
    if (!canvasRef.current) return
    setIsDownloading(true)
    try {
      const link = document.createElement('a')
      link.download = `magicvisual-ia-${Date.now()}.png`
      link.href = canvasRef.current.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error('Download error:', e)
      // Fallback: open image in new tab
      if (imageUrl) {
        window.open(imageUrl, '_blank')
      }
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-strong sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gradient-crimson text-2xl font-bold">
            Resultado IA Hiperrealista
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {hasWatermark ? 'Imagen con marca de agua (plan gratuito) - Actualiza a Pro para sin marca' : 'Tu imagen generada con IA hiperrealista - Sin marca de agua'}
          </DialogDescription>
        </DialogHeader>
        <div className="relative overflow-hidden rounded-lg">
          <canvas ref={canvasRef} className="w-full h-auto rounded-lg" />
          {hasWatermark && (
            <Badge className="absolute top-3 right-3 bg-gold/90 text-background">
              <Crown className="mr-1 h-3 w-3" /> Marca de agua
            </Badge>
          )}
        </div>
        <DialogFooter>
          <Button
            className="bg-crimson hover:bg-crimson-dark text-white glow-crimson"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Descargar HD
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-2 mt-2">{children}</div>
}

// ─── Landing Section ────────────────────────────────────────────────
function LandingSection({ onNavigate }: { onNavigate: (view: ViewType) => void }) {
  return (
    <div className="relative min-h-screen">
      <ParticleBackground />

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-gradient-crimson">
              MagicVisual
            </h1>
          </motion.div>
          <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground font-light max-w-2xl mx-auto">
            Transforma tus fotos con <span className="text-gold font-semibold">IA</span>
          </p>
          <p className="text-sm sm:text-base text-muted-foreground/70 max-w-lg mx-auto">
            Editor de fotos potenciado con inteligencia artificial.
            Estilos profesionales en segundos.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              className="bg-crimson hover:bg-crimson-dark text-white glow-crimson text-lg px-8 py-6"
              onClick={() => onNavigate('editor')}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Comenzar
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Branch Cards */}
      <section className="relative z-10 px-4 pb-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold text-center mb-12"
        >
          Elige tu <span className="text-gradient-crimson">Estilo</span>
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {BRANCHES.map((branch, i) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card className="glass overflow-hidden cursor-pointer group h-full" onClick={() => onNavigate('editor')}>
                <div className={`h-2 bg-gradient-to-r ${branch.gradient}`} />
                <CardHeader className="pb-2">
                  <div className="text-4xl mb-2">{branch.icon}</div>
                  <CardTitle className="text-xl" style={{ color: branch.color }}>{branch.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{branch.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {branch.backgrounds.slice(0, 4).map(bg => (
                      <Badge key={bg.id} variant="secondary" className="text-xs bg-secondary/50">
                        {bg.emoji} {bg.name}
                      </Badge>
                    ))}
                    {branch.backgrounds.length > 4 && (
                      <Badge variant="secondary" className="text-xs bg-secondary/50">
                        +{branch.backgrounds.length - 4} más
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full group-hover:bg-crimson/10 group-hover:text-crimson transition-colors">
                    Explorar <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-4 pb-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold text-center mb-12"
        >
          ¿Por qué <span className="text-gradient-gold">MagicVisual</span>?
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Wand2, title: 'IA Avanzada', desc: 'Transformación inteligente de imágenes en segundos', color: 'text-crimson' },
            { icon: Palette, title: '18+ Estilos', desc: 'Backgrounds y escenarios para cada estilo', color: 'text-gold' },
            { icon: Camera, title: 'Alta Calidad', desc: 'Resultados profesionales sin marca de agua', color: 'text-purple-400' },
            { icon: Shield, title: 'Privacidad', desc: 'Tus imágenes son privadas y seguras', color: 'text-cyan-400' },
          ].map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass text-center p-6 h-full">
                <feat.icon className={`h-10 w-10 mx-auto mb-4 ${feat.color}`} />
                <h3 className="font-semibold mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground">{feat.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 sm:p-12 text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Empieza a <span className="text-gradient-crimson">crear</span> ahora
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            3 fotos gratuitas para probar. Sin tarjeta de crédito.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-crimson hover:bg-crimson-dark text-white glow-crimson"
              onClick={() => onNavigate('editor')}
            >
              <Sparkles className="mr-2 h-4 w-4" /> Probar Gratis
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gold/50 text-gold hover:bg-gold/10"
              onClick={() => onNavigate('pricing')}
            >
              <Crown className="mr-2 h-4 w-4" /> Ver Planes
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

// ─── Editor Section ─────────────────────────────────────────────────
function EditorSection({ userPlan, photosUsed, photosLimit, userId, onPlanUpdate }: {
  userPlan: string
  photosUsed: number
  photosLimit: number
  userId: string
  onPlanUpdate: () => void
}) {
  const [selectedBranch, setSelectedBranch] = useState<string>('vanilla')
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null)
  const [customScenario, setCustomScenario] = useState('')
  const [customOutfit, setCustomOutfit] = useState('')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [processingStep, setProcessingStep] = useState<string>('')
  const [processingProgress, setProcessingProgress] = useState(0)
  const [localPhotosUsed, setLocalPhotosUsed] = useState(photosUsed)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentBranch = BRANCHES.find(b => b.id === selectedBranch)!
  const isFree = userPlan === 'free'
  const canEdit = photosUsed < photosLimit

  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen no puede superar 10MB')
      return
    }
    // Resize image for faster upload while keeping quality
    const reader = new FileReader()
    reader.onload = e => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_SIZE = 1024
        let { width, height } = img
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = (height / width) * MAX_SIZE
            width = MAX_SIZE
          } else {
            width = (width / height) * MAX_SIZE
            height = MAX_SIZE
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        const resized = canvas.toDataURL('image/jpeg', 0.85)
        setUploadedImage(resized)
        setResultImage(null)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }, [handleFileUpload])

  const handleProcess = async () => {
    if (!uploadedImage) {
      toast.error('Sube una foto primero')
      return
    }
    if (!selectedBackground && !customScenario) {
      toast.error('Selecciona un background o escribe un escenario')
      return
    }
    if (localPhotosUsed >= photosLimit) {
      toast.error('Límite de fotos alcanzado. Actualiza tu plan.')
      return
    }

    setIsProcessing(true)
    setProcessingStep('Analizando tu foto con IA...')
    setProcessingProgress(10)

    try {
      // Step 1: Analyze image with VLM
      setProcessingStep('La IA está analizando tu foto...')
      setProcessingProgress(20)

      // Simulate progress while waiting
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) { clearInterval(progressInterval); return 90 }
          return prev + Math.random() * 8
        })
      }, 2000)

      setProcessingStep('Generando imagen hiperrealista con IA...')
      setProcessingProgress(35)

      const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || '/api/edit'

      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: uploadedImage,
          branch: selectedBranch,
          backgroundId: selectedBackground,
          customScenario,
          customOutfit
        })
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Error al procesar la imagen')
      }

      setProcessingStep('Finalizando...')
      setProcessingProgress(95)

      const data = await response.json()

      if (data.resultImage) {
        setResultImage(data.resultImage)
        setShowResult(true)
        setProcessingProgress(100)

        // Increment photo usage
        try {
          const usageRes = await fetch('/api/user/usage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
          })
          if (usageRes.ok) {
            const usageData = await usageRes.json()
            setLocalPhotosUsed(usageData.photosUsed)
          }
        } catch {
          // Non-critical: usage update failed
        }

        toast.success('Imagen generada con IA hiperrealista')
      } else {
        throw new Error('No se recibió imagen del servidor')
      }

    } catch (error: any) {
      console.error('Edit error:', error)
      toast.error(error.message || 'Error al procesar la imagen. Intenta de nuevo.')
    } finally {
      setIsProcessing(false)
      setProcessingStep('')
      setProcessingProgress(0)
    }
  }

  return (
    <div className="min-h-screen pt-4 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient-crimson">Editor</h1>
          <p className="text-muted-foreground mt-1">
            Sube tu foto, elige un estilo y deja que la IA haga la magia
          </p>
          <div className="flex items-center gap-3 mt-3">
            <Badge variant="secondary" className="bg-secondary/50">
              <ImageIcon className="mr-1 h-3 w-3" />
              {localPhotosUsed}/{photosLimit} fotos usadas
            </Badge>
            <Badge className={isFree ? 'bg-muted text-muted-foreground' : 'bg-gold/20 text-gold'}>
              <Crown className="mr-1 h-3 w-3" />
              {userPlan === 'free' ? 'Gratis' : userPlan === 'pro' ? 'Pro' : 'Premium'}
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Upload & Options */}
          <div className="space-y-6">
            {/* Upload Area */}
            <Card className="glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="h-5 w-5 text-crimson" />
                  Subir Foto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                    ${isDragging ? 'border-crimson bg-crimson/10' : 'border-white/10 hover:border-crimson/50'}
                    ${uploadedImage ? 'p-2' : ''}`}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file)
                    }}
                  />
                  {uploadedImage ? (
                    <div className="relative">
                      <img src={uploadedImage} alt="Preview" className="rounded-lg max-h-64 mx-auto object-contain" />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={e => { e.stopPropagation(); setUploadedImage(null); setResultImage(null) }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">Arrastra tu foto aquí o haz clic</p>
                      <p className="text-xs text-muted-foreground/60">PNG, JPG, WEBP hasta 10MB</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Branch Selector */}
            <Card className="glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="h-5 w-5 text-gold" />
                  Estilo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {BRANCHES.map(branch => (
                    <motion.button
                      key={branch.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`rounded-lg p-3 text-center transition-all border
                        ${selectedBranch === branch.id
                          ? 'border-current bg-white/5'
                          : 'border-white/5 bg-secondary/30 hover:bg-secondary/50'}`}
                      style={selectedBranch === branch.id ? { borderColor: branch.color } : {}}
                      onClick={() => { setSelectedBranch(branch.id); setSelectedBackground(null) }}
                    >
                      <div className="text-2xl mb-1">{branch.icon}</div>
                      <div className="text-sm font-medium" style={{ color: selectedBranch === branch.id ? branch.color : undefined }}>
                        {branch.name}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Background Grid */}
            <Card className="glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-purple-400" />
                  Background
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currentBranch.backgrounds.map(bg => (
                    <motion.button
                      key={bg.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`rounded-lg p-3 text-center transition-all border
                        ${selectedBackground === bg.id
                          ? 'border-gold bg-gold/10'
                          : 'border-white/5 bg-secondary/30 hover:bg-secondary/50'}`}
                      onClick={() => setSelectedBackground(bg.id)}
                    >
                      <div className="h-8 rounded bg-gradient-to-r ${bg.gradient} mb-2 flex items-center justify-center text-lg"
                        style={{ background: 'var(--secondary)' }}
                      >
                        {bg.emoji}
                      </div>
                      <p className="text-xs font-medium truncate">{bg.name}</p>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Custom Inputs */}
            <Card className="glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-cyan-400" />
                  Personalización
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  {isFree ? 'Disponible solo en planes Pro y Premium' : 'Describe tu escenario y outfit ideal'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Escenario personalizado</Label>
                  <Textarea
                    placeholder={isFree ? 'Actualiza a Pro para usar...' : 'Ej: Una terraza al atardecer en Barcelona...'}
                    value={customScenario}
                    onChange={e => setCustomScenario(e.target.value)}
                    disabled={isFree}
                    className="bg-secondary/50 border-white/10 text-foreground placeholder:text-muted-foreground resize-none"
                    rows={2}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Outfit personalizado</Label>
                  <Textarea
                    placeholder={isFree ? 'Actualiza a Pro para usar...' : 'Ej: Vestido rojo elegante con tacones...'}
                    value={customOutfit}
                    onChange={e => setCustomOutfit(e.target.value)}
                    disabled={isFree}
                    className="bg-secondary/50 border-white/10 text-foreground placeholder:text-muted-foreground resize-none"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Preview & Action */}
          <div className="space-y-6">
            {/* Preview */}
            <Card className="glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5 text-crimson" />
                  Vista Previa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[3/4] rounded-xl bg-secondary/30 border border-white/5 flex items-center justify-center overflow-hidden">
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Camera className="h-16 w-16 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Sube una foto para ver la vista previa</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Button */}
            <motion.div whileHover={{ scale: isProcessing ? 1 : 1.02 }} whileTap={{ scale: isProcessing ? 1 : 0.98 }}>
              <Button
                size="lg"
                className="w-full bg-crimson hover:bg-crimson-dark text-white glow-crimson py-6 text-lg"
                onClick={handleProcess}
                disabled={!uploadedImage || isProcessing || localPhotosUsed >= photosLimit}
              >
                {isProcessing ? (
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{processingStep || 'Procesando con IA...'}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-white h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(processingProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                ) : localPhotosUsed >= photosLimit ? (
                  <>
                    <Crown className="mr-2 h-5 w-5" />
                    Límite alcanzado - Actualiza tu plan
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Mejorar Foto con IA
                  </>
                )}
              </Button>
            </motion.div>

            {isProcessing && (
              <Card className="glass border-crimson/30">
                <CardContent className="py-4">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground animate-pulse">
                      {processingStep || 'Procesando...'}
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      La IA genera imágenes hiperrealistas - puede tardar 20-40 segundos
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {localPhotosUsed >= photosLimit && !isProcessing && (
              <Card className="glass border-gold/30">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <Crown className="h-8 w-8 text-gold" />
                    <div>
                      <p className="font-semibold">Has alcanzado tu límite de fotos</p>
                      <p className="text-sm text-muted-foreground">Actualiza tu plan para seguir editando</p>
                    </div>
                    <Button
                      variant="outline"
                      className="ml-auto border-gold/50 text-gold hover:bg-gold/10"
                      onClick={onPlanUpdate}
                    >
                      Ver Planes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Selected Options Summary */}
            {(selectedBackground || customScenario || customOutfit) && (
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Opciones seleccionadas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {selectedBackground && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Background:</span>{' '}
                      {currentBranch.backgrounds.find(b => b.id === selectedBackground)?.emoji}{' '}
                      {currentBranch.backgrounds.find(b => b.id === selectedBackground)?.name}
                    </p>
                  )}
                  {customScenario && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Escenario:</span> {customScenario}
                    </p>
                  )}
                  {customOutfit && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Outfit:</span> {customOutfit}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ImageResultDialog
        open={showResult}
        onClose={() => setShowResult(false)}
        imageUrl={resultImage}
        hasWatermark={isFree}
      />
    </div>
  )
}

// ─── Pricing Section ────────────────────────────────────────────────
function PricingSection({ userId, userPlan }: { userId: string; userPlan: string }) {
  const [isMonthly, setIsMonthly] = useState(true)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'premium'>('pro')

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '',
      features: [
        { text: '3 fotos por mes', included: true },
        { text: 'Backgrounds limitados', included: true },
        { text: 'Marca de agua', included: true },
        { text: 'Sin personalización', included: false },
        { text: 'Sin descarga HD', included: false },
      ],
      gradient: '',
      color: 'text-muted-foreground',
      buttonVariant: 'outline' as const,
      popular: false,
    },
    {
      name: 'Pro',
      price: isMonthly ? '$12.99' : '$5.99',
      period: isMonthly ? '/mes' : '/semana',
      features: [
        { text: '50 fotos por mes', included: true },
        { text: 'Todos los backgrounds', included: true },
        { text: 'Sin marca de agua', included: true },
        { text: 'Personalización', included: true },
        { text: 'Descarga HD', included: false },
      ],
      gradient: 'from-violet-600 to-purple-500',
      color: 'text-purple-400',
      buttonVariant: 'default' as const,
      popular: true,
    },
    {
      name: 'Premium',
      price: '$25',
      period: '/mes',
      features: [
        { text: 'Fotos ilimitadas', included: true },
        { text: 'Todos los backgrounds', included: true },
        { text: 'Sin marca de agua', included: true },
        { text: 'Personalización completa', included: true },
        { text: 'Prioridad + Descarga HD', included: true },
      ],
      gradient: 'from-gold to-amber-400',
      color: 'text-gold',
      buttonVariant: 'default' as const,
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen pt-4 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-5xl font-bold text-gradient-crimson mb-4">Planes</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Elige el plan que mejor se adapte a tus necesidades
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-sm ${!isMonthly ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>Semanal</span>
            <Switch checked={isMonthly} onCheckedChange={setIsMonthly} />
            <span className={`text-sm ${isMonthly ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>Mensual</span>
            {isMonthly && (
              <Badge className="bg-gold/20 text-gold text-xs">Ahorra 50%</Badge>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-crimson text-white glow-crimson">
                    <Star className="mr-1 h-3 w-3" /> Más Popular
                  </Badge>
                </div>
              )}
              <Card className={`glass h-full ${plan.popular ? 'border-crimson/30' : ''}`}>
                {plan.gradient && <div className={`h-1.5 bg-gradient-to-r ${plan.gradient}`} />}
                <CardHeader className="text-center pb-2">
                  <CardTitle className={`text-xl ${plan.color}`}>{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {plan.features.map(feat => (
                    <div key={feat.text} className="flex items-center gap-2 text-sm">
                      {feat.included ? (
                        <Check className="h-4 w-4 text-green-400 shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      )}
                      <span className={feat.included ? '' : 'text-muted-foreground/50'}>{feat.text}</span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  {plan.name === 'Free' ? (
                    <Button variant="outline" className="w-full" disabled={userPlan === 'free'}>
                      {userPlan === 'free' ? 'Plan Actual' : 'Plan Gratuito'}
                    </Button>
                  ) : (
                    <Button
                      className={`w-full ${
                        plan.name === 'Premium'
                          ? 'bg-gold hover:bg-gold-dark text-background glow-gold'
                          : 'bg-crimson hover:bg-crimson-dark text-white glow-crimson'
                      }`}
                      disabled={userPlan === plan.name.toLowerCase()}
                      onClick={() => {
                        setSelectedPlan(plan.name.toLowerCase() as 'pro' | 'premium')
                        setPaymentOpen(true)
                      }}
                    >
                      {userPlan === plan.name.toLowerCase() ? 'Plan Actual' : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Activar {plan.name}
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {userId && (
        <PaymentDialog
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          plan={selectedPlan}
          billingCycle={isMonthly ? 'monthly' : 'weekly'}
          userId={userId}
        />
      )}
    </div>
  )
}

// ─── Admin Section ──────────────────────────────────────────────────
function AdminSection() {
  const [users, setUsers] = useState<Array<{
    id: string; email: string; name: string | null; plan: string;
    isAdmin: boolean; photosUsed: number; photosLimit: number;
    billingCycle: string | null; createdAt: string;
  }>>([])
  const [payments, setPayments] = useState<Array<{
    id: string; userId: string; amount: number; currency: string;
    plan: string; billingCycle: string; method: string; txHash: string | null;
    status: string; createdAt: string; user: { email: string; name: string | null };
  }>>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, paymentsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/payments'),
      ])
      if (usersRes.ok) setUsers(await usersRes.json())
      if (paymentsRes.ok) setPayments(await paymentsRes.json())
    } catch {
      toast.error('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handlePaymentAction = async (paymentId: string, status: string) => {
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, status }),
      })
      if (res.ok) {
        toast.success(`Pago ${status === 'APPROVED' ? 'aprobado' : 'rechazado'}`)
        fetchData()
      }
    } catch {
      toast.error('Error al actualizar pago')
    }
  }

  const totalRevenue = payments.filter(p => p.status === 'APPROVED').reduce((s, p) => s + p.amount, 0)
  const pendingPayments = payments.filter(p => p.status === 'PENDING')
  const proUsers = users.filter(u => u.plan === 'pro').length
  const premiumUsers = users.filter(u => u.plan === 'premium').length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-crimson" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-4 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient-gold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Gestiona usuarios y pagos</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Usuarios', value: users.length, icon: Users, color: 'text-crimson', bg: 'bg-crimson/10' },
            { label: 'Suscripciones', value: proUsers + premiumUsers, icon: Crown, color: 'text-gold', bg: 'bg-gold/10' },
            { label: 'Ingresos', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10' },
            { label: 'Pagos Pendientes', value: pendingPayments.length, icon: CreditCard, color: 'text-orange-400', bg: 'bg-orange-400/10' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass">
                <CardContent className="p-4">
                  <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-2`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Payments Table */}
        <Card className="glass mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gold" />
              Pagos
              {pendingPayments.length > 0 && (
                <Badge className="bg-orange-500/20 text-orange-400">{pendingPayments.length} pendientes</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Usuario</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Plan</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Monto</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Método</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Estado</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">{p.user.name || 'Sin nombre'}</p>
                          <p className="text-xs text-muted-foreground">{p.user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={p.plan === 'premium' ? 'bg-gold/20 text-gold' : 'bg-purple-500/20 text-purple-400'}>
                          {p.plan}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">{p.amount} {p.currency}</td>
                      <td className="py-3 px-2 capitalize">{p.method}</td>
                      <td className="py-3 px-2">
                        <Badge className={
                          p.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                          p.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                          'bg-orange-500/20 text-orange-400'
                        }>
                          {p.status === 'APPROVED' ? <CheckCircle className="mr-1 h-3 w-3" /> :
                           p.status === 'REJECTED' ? <XCircle className="mr-1 h-3 w-3" /> :
                           <Clock className="mr-1 h-3 w-3" />}
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        {p.status === 'PENDING' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-green-400 hover:text-green-300 hover:bg-green-400/10"
                              onClick={() => handlePaymentAction(p.id, 'APPROVED')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                              onClick={() => handlePaymentAction(p.id, 'REJECTED')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {p.txHash && (
                          <p className="text-xs text-muted-foreground max-w-[120px] truncate" title={p.txHash}>
                            {p.txHash.slice(0, 10)}...
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No hay pagos</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-crimson" />
              Usuarios ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Nombre</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Email</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Plan</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Fotos</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-2 font-medium">{u.name || '-'}</td>
                      <td className="py-3 px-2 text-muted-foreground">{u.email}</td>
                      <td className="py-3 px-2">
                        <Badge className={
                          u.plan === 'premium' ? 'bg-gold/20 text-gold' :
                          u.plan === 'pro' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-secondary text-muted-foreground'
                        }>
                          {u.plan}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">{u.photosUsed}/{u.photosLimit}</td>
                      <td className="py-3 px-2">
                        {u.isAdmin && <Badge className="bg-crimson/20 text-crimson">Admin</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No hay usuarios</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Navbar Component ───────────────────────────────────────────────
function Navbar({
  currentView,
  onNavigate,
  onAuthOpen,
}: {
  currentView: ViewType
  onNavigate: (view: ViewType) => void
  onAuthOpen: (mode: 'login' | 'register') => void
}) {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems: { label: string; view: ViewType; icon: React.ReactNode }[] = [
    { label: 'Inicio', view: 'landing', icon: <Sparkles className="h-4 w-4" /> },
    { label: 'Editor', view: 'editor', icon: <Camera className="h-4 w-4" /> },
    { label: 'Planes', view: 'pricing', icon: <Crown className="h-4 w-4" /> },
    ...(session?.user?.isAdmin
      ? [{ label: 'Admin', view: 'admin' as ViewType, icon: <Shield className="h-4 w-4" /> }]
      : []),
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onNavigate('landing')}
          className="text-xl font-black text-gradient-crimson hover:opacity-80 transition-opacity"
        >
          ✦ MagicVisual
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <Button
              key={item.view}
              variant="ghost"
              size="sm"
              className={`${currentView === item.view ? 'bg-crimson/10 text-crimson' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => onNavigate(item.view)}
            >
              {item.icon}
              <span className="ml-1.5">{item.label}</span>
            </Button>
          ))}
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-2">
          {session?.user ? (
            <div className="flex items-center gap-2">
              <Badge className={
                session.user.plan === 'premium' ? 'bg-gold/20 text-gold' :
                session.user.plan === 'pro' ? 'bg-purple-500/20 text-purple-400' :
                'bg-secondary text-muted-foreground'
              }>
                <Crown className="mr-1 h-3 w-3" />
                {session.user.plan}
              </Badge>
              <span className="text-sm text-muted-foreground max-w-[150px] truncate">
                {session.user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-muted-foreground hover:text-crimson">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => onAuthOpen('login')} className="text-muted-foreground">
                Iniciar Sesión
              </Button>
              <Button size="sm" className="bg-crimson hover:bg-crimson-dark text-white" onClick={() => onAuthOpen('register')}>
                Registrarse
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-white/5"
          >
            <div className="p-4 space-y-2">
              {navItems.map(item => (
                <Button
                  key={item.view}
                  variant="ghost"
                  className={`w-full justify-start ${currentView === item.view ? 'bg-crimson/10 text-crimson' : 'text-muted-foreground'}`}
                  onClick={() => { onNavigate(item.view); setMobileMenuOpen(false) }}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Button>
              ))}
              <Separator className="bg-white/5" />
              {session?.user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground truncate">{session.user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-crimson"
                    onClick={() => { signOut(); setMobileMenuOpen(false) }}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground"
                    onClick={() => { onAuthOpen('login'); setMobileMenuOpen(false) }}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    className="w-full bg-crimson hover:bg-crimson-dark text-white"
                    onClick={() => { onAuthOpen('register'); setMobileMenuOpen(false) }}
                  >
                    Registrarse
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

// ─── Footer ─────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-gradient-crimson">✦ MagicVisual</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} MagicVisual. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Privacidad</span>
            <span>Términos</span>
            <span>Soporte</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Main Page Component ────────────────────────────────────────────
export default function MagicVisualPage() {
  const { data: session, status } = useSession()
  const [currentView, setCurrentView] = useState<ViewType>('landing')
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  const userPlan = session?.user?.plan ?? 'free'
  const userId = session?.user?.id ?? ''
  const isAdmin = session?.user?.isAdmin ?? false
  const photosLimit = userPlan === 'premium' ? 999 : userPlan === 'pro' ? 50 : 3
  const photosUsed = 0

  const handleAuthOpen = (mode: 'login' | 'register') => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  const handleNavigate = (view: ViewType) => {
    if ((view === 'editor' || view === 'admin') && !session) {
      handleAuthOpen('login')
      return
    }
    if (view === 'admin' && !isAdmin) {
      toast.error('Acceso denegado')
      return
    }
    setCurrentView(view)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onAuthOpen={handleAuthOpen}
      />

      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentView === 'landing' && (
              <LandingSection onNavigate={handleNavigate} />
            )}
            {currentView === 'editor' && (
              <EditorSection
                userPlan={userPlan}
                photosUsed={photosUsed}
                photosLimit={photosLimit}
                userId={userId}
                onPlanUpdate={() => setCurrentView('pricing')}
              />
            )}
            {currentView === 'pricing' && (
              <PricingSection userId={userId} userPlan={userPlan} />
            )}
            {currentView === 'admin' && isAdmin && (
              <AdminSection />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />

      <AuthDialog
        mode={authMode}
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSwitch={() => setAuthMode(prev => prev === 'login' ? 'register' : 'login')}
      />
    </div>
  )
}
