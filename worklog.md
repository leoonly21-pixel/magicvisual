---
Task ID: 1
Agent: main
Task: Rebuild MagicVisual complete app from scratch

Work Log:
- Initialized Next.js 16 project with fullstack skill
- Created Prisma schema with User (isAdmin, plan, photosUsed/Limit, billingCycle) and Payment models
- Set up NextAuth with credentials provider and JWT session
- Created auth API routes (register, login, session)
- Created payment API routes (create, verify/approve, list)
- Created users API route for admin
- Built complete single-page app with sections: Landing, Editor, Pricing, Admin
- Landing: particles canvas, hero with gradient text, 3 branch cards (Vanilla/Versátil/Fetish), features section, CTA
- Editor: photo upload (drag&drop), branch selector, 18 backgrounds (6 per branch), custom scenario/outfit inputs, result dialog with watermark overlay
- Pricing: weekly/monthly toggle, 3 plan cards (Free/Pro/Premium), payment dialog with crypto QR + Mercado Pago tabs
- Admin: stats cards, payments table with approve/reject, users table
- Auth modals: login/register with NextAuth
- Navbar with glassmorphism, mobile menu, session state
- Footer with sticky layout
- Added PWA support: manifest.json, sw.js, icon-512.png, icon-192.png
- Added NEXT_PUBLIC_BINANCE_WALLET env var for client-side QR
- Fixed themeColor viewport warning
- Verified all features with Agent Browser: landing, login, editor, pricing, admin

Stage Summary:
- MagicVisual is fully rebuilt and running on localhost:3000
- Admin credentials: admin@magicvisual.com / MagicAdmin2024!
- All API endpoints working (auth, payments, users)
- Payment flow: Binance USDT (BSC) + Mercado Pago
- Screenshots saved to /home/z/my-project/download/
