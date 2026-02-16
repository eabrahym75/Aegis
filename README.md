# Aegis Shield — Protect Your Images from Manipulation

**Aegis Shield** is a gamified, warm-hearted image protection platform that helps individuals and creators safeguard photos from unauthorized manipulation and misuse. With a delightful user experience powered by animated characters and accessible design, Aegis makes privacy protection feel intuitive and reassuring.

## 🎯 Mission

Transform image security from intimidating to *delightful*. Protect personal photos and sensitive content from unauthorized alteration and AI-driven misuse with a platform that feels safe, fun, and human-centered.

## ✨ Key Features

### 🎮 **Gamified User Experience**
- **Cute Data-Blob Character**: Nervous character animates as an AI scanner tries to peek at your data
- **3-Tier Protection Armor**: Choose between Standard, Stealth, or Ultra protection levels with animated character cards
- **Rotating Upload Portal**: Drag images into a magical rotating portal that responds to interaction
- **Character Toast Notifications**: Receive encouraging messages from your animated shield character
- **Smooth Animations**: All interactions powered by Framer Motion with reduced-motion support

### 🔒 **Image Protection**
- **📸 Metadata Embedding**: Embed copyright/creator info + "Do Not AI Train" tags
- **🛡️ Adversarial Shielding**: Structured Adversarial Perturbation (SAP) and chroma jitter to reduce inpainting/matching
- **👻 Stealth Mode**: Invisible digital signatures embedded in pixels that survive screenshots
- **⚡ Instant Download**: Receive protected images immediately — no persistent storage by default
- **🔐 Privacy-Focused**: Processing happens server-side with ephemeral handling

### 🎨 **Design System: "Sunset Protection" Theme**
- **Warm Cream Background**: `bg-[#FFFBF0]` — No harsh whites
- **Vibrant Tangerine Primary**: `bg-[#FF8C42]` — Soft, reassuring orange
- **Minty Teal Success**: `bg-[#00C897]` — Not hacker-green
- **Soft Charcoal Text**: `text-[#2D3436]` — Easy on the eyes
- **Softly Rounded Everything**: `rounded-3xl` for touchable, inviting design

## 📱 **Responsive & Accessible**
- Mobile-first responsive design
- Full keyboard navigation support
- ARIA labels and screen reader optimization
- Reduced-motion preference detection and support
- Accessible color contrasts throughout

## 🚀 The 3-Step "Armoring" Process

### **Step 1: Meet Your Data** — The Hook
- Introduces the nervous "Data-Blob" character
- Shows an animated AI scanner trying to peek
- Displays an orange protective barrier bouncing the scan away
- Sets the warm, reassuring tone

### **Step 2: Choose Your Armor** — Tier Selection
- **Standard Shield**: Basic protection with metadata tagging
  - Character holds a wooden shield
  - Shield wiggles on hover
- **Stealth Mode**: Invisible signature embedding
  - Ninja character with headband, partially transparent
  - Vanishes and reappears on hover
- **Ultra Armor**: Maximum protection with C2PA certification
  - Character in golden plate armor
  - Gleaming sheen effect on hover

### **Step 3: Forge Your Protection** — Upload & Process
- Circular rotating portal that slowly spins
- Drag state: Portal glows warm yellow and scales up 1.1x
- Processing state: Character jumps into the portal while anvil strikes animate
- Real-time progress bar with hammer emojis bouncing
- Encouraging toast messages from your character

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS + Framer Motion
- **Animations**: Framer Motion (10.18.4+) with spring physics
- **UI Components**: shadcn/ui + custom designed components
- **Icons**: Lucide React
- **Language**: TypeScript (strict mode)
- **Build Tool**: Next.js with Webpack optimization

### Backend
- **API**: Next.js API Routes (Node.js)
- **Image Processing**: Python (Pillow, NumPy)
- **Storage**: Ephemeral (configurable)
- **C2PA Support**: Optional manifest generation
- **FGSM Attacks**: Adversarial perturbation library integration

### Development & Quality
- **Testing**: Playwright + Axe for accessibility audits
- **Linting**: ESLint + TypeScript strict checking
- **Package Manager**: npm (Node 18+)

## 📦 Project Structure

```
Aegis/
├── app/
│   ├── aegis/
│   │   └── page.tsx           # 🎮 Main gamified protection interface
│   ├── api/
│   │   ├── protect/           # Image protection endpoint
│   │   └── verify/            # Image verification endpoint
│   ├── layout.tsx             # Root layout with header/footer
│   ├── page.tsx               # Home landing page
│   ├── globals.css            # Global Tailwind styles
│   └── sitemap.ts             # SEO sitemap
│
├── components/
│   ├── ShieldHero.tsx         # 🎬 Data-Blob hero animation
│   ├── ShieldCharacter.tsx    # 🎨 3-tier character cards with animations
│   ├── DropZonePortal.tsx     # 🌀 Rotating portal upload interface
│   ├── ForgingProgress.tsx    # ⚒️ Progress bar with anvil strikes
│   ├── CharacterToast.tsx     # 💬 Chat bubble notifications
│   ├── protection-form.tsx    # Legacy protection interface
│   ├── verification-form.tsx  # Image verification interface
│   ├── shared/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── logo.tsx
│   └── ui/                    # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── (others)
│
├── backend/
│   ├── aegis_shield.py        # Core protection algorithm
│   ├── basic_image_pipeline.py
│   ├── fgsm_image_test.py     # FGSM adversarial testing
│   ├── masked_protection.py   # Region-based protection
│   ├── project_image.py       # Image projection utilities
│   ├── verify_optional_features.py
│   ├── test_aegis.py
│   ├── requirements.txt
│   └── c2pa_manifest.json     # C2PA certificate template
│
├── lib/
│   ├── utils/
│   │   ├── cn.ts              # Class name utilities
│   │   └── index.ts
│   └── storage/               # File handling
│
├── tests/
│   ├── test_aegis_shield.py
│   └── __pycache__/
│
├── public/
│   └── robots.txt
│
├── tsconfig.json              # TypeScript strict mode enabled
├── tailwind.config.ts         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS plugins
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies + scripts
└── README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js**: 18+ (or Bun v1.0+)
- **npm**: 9+ or yarn/pnpm
- **Python**: 3.9+ (for backend image processing)

### Installation & Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd Aegis

# 2. Install Node dependencies
npm install

# 3. Set up Python virtual environment (optional but recommended)
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# 4. Install Python dependencies (optional for backend testing)
pip install -r backend/requirements.txt
```

### Development Server

```bash
# Start the development server with hot reload
npm run dev

# Open in browser
# http://localhost:3000 → Home page
# http://localhost:3000/aegis → 🎮 Gamified protection interface
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start

# Or use a process manager like PM2
pm2 start "npm start" --name "aegis"
```

## 🎮 Using the Gamified Interface

### The Main Flow: `/aegis`

1. **See the Hero** (Data-Blob Character)
   - Watch the nervous blob get scanned by an AI eye
   - See the protective orange barrier block the scan
   - This sets the playful, reassuring tone

2. **Choose Your Armor** (Tier Selection)
   - **Standard**: Basic metadata protection
   - **Stealth**: Invisible pixel-level protection
   - **Ultra**: Maximum protection + C2PA certification
   - Hover to see character animations

3. **Upload & Forge**
   - Drag & drop an image into the rotating portal
   - Portal glows and reacts to interaction
   - Character jumps into the portal during processing
   - Watch the progress bar with animated anvil strikes (⚒️)

4. **Chat Bubble Feedback**
   - Character sends encouraging messages
   - Tier-specific tips and confirmations
   - Auto-dismisses with smooth animation

## 🔌 API Endpoints

### `POST /api/protect`

Protect an image with adversarial shielding and metadata.

**Request:**
```javascript
const formData = new FormData();
formData.append("file", imageFile);
formData.append("level", "standard"); // "standard" | "stealth" | "ultra"
formData.append("creator", "Your Name"); // Optional
formData.append("fgsm", "true");  // Optional: Enable FGSM attacks
formData.append("c2pa", "true");  // Optional: Enable C2PA manifest
```

**Response:**
- Status 200: Protected image blob (PNG or JPG)
- Status 400: Invalid file/parameters
- Status 500: Processing error

### `POST /api/verify`

Verify if an image has Aegis protection.

**Request:**
```javascript
const formData = new FormData();
formData.append("file", imageFile);
```

**Response:**
```json
{
  "protected": true,
  "level": "ultra",
  "creator": "User Name",
  "timestamp": "2026-02-14T10:30:00Z"
}
```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file (not committed to git):

```env
# Backend Python path (if using external Python for processing)
PYTHON_PATH=/usr/bin/python3

# Storage configuration (optional)
STORAGE_TYPE=memory  # "memory" | "disk" | "s3"

# C2PA configuration (optional)
C2PA_ENABLED=false
C2PA_SIGNER_URL=https://your-c2pa-service.com
```

### Tailwind Configuration

The design system is in `tailwind.config.ts`:

```typescript
// Sunset Protection Theme Colors
'[#FFFBF0]' // Warm Cream background
'[#FF8C42]' // Vibrant Tangerine primary
'[#00C897]' // Minty Teal success
'[#2D3436]' // Soft Charcoal text
```

## 🔐 Privacy & Security

- **Zero Persistence**: Images are NOT stored by default
- **Memory Processing**: All operations happen in RAM
- **Server-Side Only**: No client-side image uploads to third parties
- **Open Source**: Full transparency in protection methods
- **No Telemetry**: We don't track user behavior or images
- **Ephemeral Downloads**: Protected images are served once then discarded

### Security Best Practices

✅ **DO:**
- Use the "Ultra" tier for sensitive images
- Enable C2PA certification for authenticity
- Keep your images' metadata private
- Use a VPN if uploading over public WiFi

❌ **DON'T:**
- Upload unrelated images to test (use throwaway images)
- Share protected images publicly without consent
- Assume protection = 100% immunity (no solution is foolproof)
- Upload images with personal identifiers visible

## 🎨 Design & Animation Details

### Animation Library: Framer Motion

All animations use Framer Motion 10.18.4+ with:
- **Spring Physics**: Responsive, natural movement
- **Stagger Effects**: Coordinated multi-element animations
- **Reduced Motion**: Respects user's `prefers-reduced-motion` setting

### Component Animations

| Component | Animation | Trigger |
|-----------|-----------|---------|
| **ShieldHero** | Data-Blob floats; AI scanner moves; barrier pops | Auto-loop (2.4s) |
| **ShieldCharacter (Standard)** | Shield wiggles | On hover |
| **ShieldCharacter (Stealth)** | Character vanishes/reappears | On hover |
| **ShieldCharacter (Ultra)** | Armor shines with sweep effect | On hover & auto |
| **DropZonePortal** | Portal rings rotate; portal scales on drag | Continuous & interaction |
| **ForgingProgress** | Progress bar fills; hammer emojis bounce | During upload |
| **CharacterToast** | Chat bubble slides in/out | On event |

### Accessibility Features

✅ **Keyboard Navigation**
- Tab through tier cards
- Arrow keys to switch tiers
- Enter/Space to select

✅ **Screen Readers**
- All images have `role="img"` and `aria-label`
- Live regions announce progress
- Status messages use `aria-live="polite"`

✅ **Motion Preferences**
- Respects `prefers-reduced-motion`
- Disables animations for users who prefer it
- All functionality works without animation

✅ **Color Contrast**
- WCAG AA compliant throughout
- No color-only indicators
- Icons + text for all messages

## 🧪 Testing & Quality Assurance

### Automated Testing

```bash
# Run accessibility audits with Axe + Playwright
npm run test:a11y

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Manual Testing Checklist

- [ ] Upload works on desktop and mobile
- [ ] Animations play smoothly without jank
- [ ] All tier cards are clickable and responsive
- [ ] Portal drag-and-drop works
- [ ] Toast notifications appear and dismiss
- [ ] Keyboard navigation works end-to-end
- [ ] Screen reader announces all key elements
- [ ] Works with reduced-motion enabled
- [ ] Works with browser dark mode

## 💻 Backend: Python Image Protection

### Using `aegis_shield.py`

```bash
python3 backend/aegis_shield.py input.png \
  --output protected.png \
  --level ultra \
  --mask mask.png
```

### Options

```
--level {standard|stealth|ultra}
  - standard: Metadata only
  - stealth: Invisible pixel-level protection
  - ultra: Maximum adversarial shielding + C2PA

--mask <path>
  - Grayscale image where white = protect, black = ignore
  - Useful for region-specific protection

--force-skin-detect
  - Auto-detect skin regions using YCbCr colorspace
  - Applies protection intelligently to faces/skin

--fgsm-alpha <float>
  - Strength of FGSM adversarial perturbation (default: 0.02)
  - Higher = more aggressive (0.0 - 1.0)
```

### Protection Methods

**Standard Tier:**
- Embeds metadata (creator, timestamp, "Do Not Train")
- No image modification
- Best for: Personal photos, social media

**Stealth Tier:**
- Invisible digital signature embedded in pixels
- Survives lossy compression and screenshots
- Better for: Sensitive content, image provenance

**Ultra Tier:**
- Structured Adversarial Perturbation (SAP)
- Chroma jitter in Cb/Cr channels
- C2PA manifest generation
- Best for: Maximum protection, legal proof

## 📚 Examples & Use Cases

### Personal Photo Protection
```javascript
// Protect before sharing on Instagram
const level = "stealth"; // Invisible but survivable
// Character: 🥷 Ninja in stealth mode
```

### Content Creator Watermarking
```javascript
// Protect creative work
const level = "ultra"; // Maximum armor
// Character: 🛡️ Golden armor with gleaming effect
```

### Legal Documentation
```javascript
// Prove authenticity with C2PA
const c2pa = true;
const level = "ultra";
// Generates verifiable certificate of authenticity
```

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript strictly (no `any` types)
- Add accessibility labels to new components
- Test animations with `prefers-reduced-motion`
- Include unit/integration tests for new features
- Update this README with new features

## 📋 Roadmap

- [ ] Browser extension for one-click protection
- [ ] Mobile app (React Native)
- [ ] AI detection verification tool
- [ ] Blockchain-based authenticity ledger
- [ ] Marketplace for protected content
- [ ] Advanced analytics dashboard

## ⚠️ Disclaimer & Legal

**Aegis provides technical measures to help protect your images, but no solution is 100% foolproof.** The tools here add layers of protection, making manipulation more difficult and traceable, but determined adversaries may still attempt to bypass protections.

### Best Practices
- Be mindful of what you share online
- Use watermarking for visible protection
- Combine multiple safety practices
- Review privacy settings on social platforms
- Understand that no technical solution replaces common sense

### Terms of Use
- Images are processed server-side and not stored by default
- We take no responsibility for misuse of protected images
- Aegis is provided "as-is" without warranties
- Comply with all local laws when protecting/sharing images

## 📞 Support & Community

- **Issues & Bug Reports**: GitHub Issues
- **Discussions**: GitHub Discussions

## 📄 License

This project is licensed under the MIT License — see LICENSE file for details.

---

## 🎉 Thank You

Built with ❤️ by the Aegis team. We believe image protection should be delightful, not scary.

**Aegis Shield** — *Protect Your Story*

---

**Last Updated**: February 14, 2026
**Version**: 0.1.0
**Status**: Active Development 🚀
