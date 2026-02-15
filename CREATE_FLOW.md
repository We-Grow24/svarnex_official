# Website Creator Flow (`/create`)

The **Create Flow** is a Typeform-inspired multi-step questionnaire that guides users through creating a new website in Svarnex. It uses AI-powered block assembly to generate a complete website from user preferences.

---

## 📁 File Structure

```
app/(app)/create/
└── page.tsx                    # Main create page with wizard and success screen

components/create/
└── wizard.tsx                  # Multi-step form wizard component
    ├── Wizard                  # Main wizard controller
    ├── StepBrandInfo          # Step 1: Brand name & industry
    └── StepVibe               # Step 2: Vibe selection with slider

lib/
└── assembler.ts               # Website assembly logic and utilities

app/api/projects/
└── route.ts                   # API routes for project CRUD operations
```

---

## 🎯 User Flow

```
1. User clicks "New Project" in sidebar
2. Navigate to /create
3. Step 1: Enter brand name & select industry
4. Step 2: Choose vibe & adjust intensity
5. Submit form → Call assembleWebsite()
6. Save to database → projects table
7. Show success animation
8. Redirect to /dashboard
```

---

## 🧙 Wizard Component

Located: [components/create/wizard.tsx](c:\Users\ingal\Desktop\svarnex2026\components\create\wizard.tsx)

### Features

- **2-step questionnaire** with smooth transitions
- **Progress bar** showing completion percentage
- **Form validation** - can't proceed without required fields
- **Animated background orbs** for visual appeal
- **Glassmorphism design** matching Svarnex aesthetic
- **Responsive layout** - works on mobile and desktop

### Props

```typescript
interface WizardProps {
  onComplete: (data: WizardFormData) => void;
  isSubmitting?: boolean;
}

interface WizardFormData {
  brandName: string;
  industry: string;
  vibe: string;
  vibeIntensity: number;
}
```

### Usage

```tsx
import Wizard from '@/components/create/wizard';

<Wizard 
  onComplete={(data) => console.log(data)}
  isSubmitting={false}
/>
```

---

## 📝 Step 1: Brand & Industry

### Brand Name Input
- **Type**: Text field
- **Auto-focused** for immediate input
- **Placeholder**: "e.g., Acme Corp"
- **Validation**: Required, non-empty

### Industry Selection
- **Type**: Button grid (2-3 columns responsive)
- **Options**: 11 industries
  - SaaS
  - E-commerce
  - Finance
  - Healthcare
  - Education
  - Real Estate
  - Marketing
  - Entertainment
  - Tech Startup
  - Consulting
  - Other

**Visual Design**: 
- Inactive: `bg-white/5` with border
- Active: Purple-to-pink gradient with shadow
- Hover: Scale 1.02, brighter background

---

## 🎨 Step 2: Vibe Selection

### Vibe Cards Grid

6 aesthetic options displayed as colored cards:

| Vibe | Emoji | Description | Gradient |
|------|-------|-------------|----------|
| **Minimal** | ⚪ | Clean, simple, focused | Gray 600 → Gray 800 |
| **Bold** | 🔥 | Large typography, high contrast | Red 600 → Orange 600 |
| **Elegant** | ✨ | Sophisticated and refined | Purple 600 → Blue 600 |
| **Playful** | 🎨 | Fun, colorful, energetic | Pink 500 → Yellow 500 |
| **Professional** | 💼 | Corporate and trustworthy | Blue 700 → Indigo 800 |
| **Cyberpunk** | 🌆 | Futuristic neon aesthetics | Cyan 500 → Purple 600 |

**Interactions**:
- **Hover**: Scale 1.05, translate Y -5px
- **Active**: White ring with `layoutId` animation
- **Click**: Update vibe selection

### Intensity Slider

- **Range**: 0-100%
- **Labels**: Subtle → Medium → Intense
- **Visual**: Custom styled with gradient thumb
- **Purpose**: Controls how strong the aesthetic is applied

**Slider Design**:
- Track: White/10 opacity
- Fill: Purple → Pink gradient up to current value
- Thumb: 20px circle with gradient and shadow
- Hover: Scale 1.1

---

## 🏗️ Website Assembly (`assembler.ts`)

Located: [lib/assembler.ts](c:\Users\ingal\Desktop\svarnex2026\lib\assembler.ts)

### Core Function: `assembleWebsite()`

```typescript
function assembleWebsite(formData: WizardFormData): AssembledProject
```

**Algorithm**:

1. **Define Structure**: Typical landing page pattern
   - Navbar → Hero → Features → Pricing → Footer

2. **Select Blocks**: For each type, find blocks matching the vibe
   - Prefer vibe matches from mock library
   - Fall back to any block of that type
   - If <5 blocks, add random ones (no duplicates)

3. **Generate Configuration**:
   - Color scheme from `VIBE_COLOR_SCHEMES`
   - Meta title: `${brandName} - ${industry} Solutions`
   - Meta description: Generic welcome message
   - Subdomain: Brand name + random 4-char suffix

4. **Return Assembled Project**:
   ```typescript
   {
     name: "Brand Website",
     description: "Vibe Industry website for Brand",
     blocks: [{ blockId, name, type, order }, ...],
     globalConfig: { brandName, industry, vibe, vibeIntensity, colorScheme },
     metaTitle: "...",
     metaDescription: "..."
   }
   ```

### Mock Block Library

**24 blocks** across 8 types:
- 4 Hero blocks (minimal, bold, elegant, cyberpunk)
- 3 Navbar blocks
- 4 Features blocks
- 3 Pricing blocks
- 3 CTA blocks
- 3 Footer blocks
- 2 Testimonials blocks
- 2 Contact blocks

**Structure**:
```typescript
{ 
  id: string,
  name: string,
  type: BlockType,
  vibe: string 
}
```

### Color Schemes

Each vibe has a predefined color palette:

```typescript
{
  minimal: { primary: '#000000', secondary: '#FFFFFF', accent: '#6B7280' },
  bold: { primary: '#DC2626', secondary: '#EA580C', accent: '#F59E0B' },
  elegant: { primary: '#8B5CF6', secondary: '#3B82F6', accent: '#EC4899' },
  playful: { primary: '#EC4899', secondary: '#F59E0B', accent: '#10B981' },
  professional: { primary: '#1E40AF', secondary: '#4338CA', accent: '#6366F1' },
  cyberpunk: { primary: '#06B6D4', secondary: '#A855F7', accent: '#F0ABFC' },
}
```

### Utility Functions

**`generateSubdomain(brandName)`**
- Converts to lowercase, replaces non-alphanumeric with hyphens
- Appends 4-character random string
- Example: "Acme Corp" → "acme-corp-x7k2"

**`getAIRecommendations(formData)`**
- Mock AI recommendations based on industry
- Returns array of recommended block types
- Example: SaaS → ['features', 'pricing', 'testimonials', 'cta']

**`estimateBuildTime(blocks, vibeIntensity)`**
- Calculates estimated assembly time
- Base 5s + 2s per block + 1s per 20% intensity

---

## 💾 API Endpoint (`/api/projects`)

Located: [app/api/projects/route.ts](c:\Users\ingal\Desktop\svarnex2026\app\api\projects\route.ts)

### POST /api/projects

**Create a new project**

**Request Body**:
```json
{
  "formData": {
    "brandName": "Acme Corp",
    "industry": "SaaS",
    "vibe": "elegant",
    "vibeIntensity": 75
  }
}
```

**Process**:
1. Validate authentication (Supabase auth)
2. Call `assembleWebsite(formData)`
3. Generate unique subdomain
4. Insert into `projects` table
5. Return project details

**Response** (201 Created):
```json
{
  "success": true,
  "project": {
    "id": "uuid-here",
    "name": "Acme Corp Website",
    "subdomain": "acme-corp-x7k2",
    "createdAt": "2026-02-16T...",
    "blocks": [...]
  },
  "message": "Website created successfully!"
}
```

**Error Responses**:
- 400: Missing required fields
- 401: Unauthorized (not logged in)
- 500: Database error

### GET /api/projects

**Get all user projects**

**Response**:
```json
{
  "projects": [...],
  "count": 5
}
```

### DELETE /api/projects?id=<project_id>

**Delete a project**

**Query Parameters**:
- `id`: Project UUID

**Response**:
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## 🎉 Success Screen

After project creation, users see an animated success screen:

### Features

- **Large checkmark icon** with spring animation
- **Rotating sparkle effects** around the icon (8 sparkles)
- **Animated background orbs** (purple & pink gradient)
- **Success message**: "Website Created! 🎉"
- **Project name** highlighted in purple
- **Loading dots** animation (3 dots pulsing)
- **Feature highlights** (3 cards):
  - ✨ 5 Blocks Selected
  - ⚡ AI Optimized
  - ✅ Ready to Publish
- **Auto-redirect** to dashboard after 3 seconds

### Animation Timeline

```
0.0s: Icon scales in (spring)
0.2s: Sparkles appear and rotate
0.4s: Success message fades in
0.6s: Loading dots start pulsing
0.8s: Feature cards fade in
3.0s: Redirect to /dashboard
```

---

## 🎨 Styling & Design

### Glassmorphism Effect

```css
backdrop-blur-xl
bg-white/5
border border-white/10
shadow-2xl
```

### Gradient Buttons

```css
bg-gradient-to-r from-purple-600 to-pink-600
hover:from-purple-500 hover:to-pink-500
shadow-lg shadow-purple-500/25
```

### Progress Bar

```css
/* Track */
h-1 bg-white/10 rounded-full backdrop-blur-xl

/* Fill */
h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600
```

### Range Slider (Custom CSS)

```css
/* Added to globals.css */
input[type="range"].slider {
  -webkit-appearance: none;
  height: 8px;
  border-radius: 4px;
}

input[type="range"].slider::-webkit-slider-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  box-shadow: 0 2px 10px rgba(168, 85, 247, 0.5);
}
```

---

## 🔄 Integration with Dashboard

### Sidebar Navigation

The "New Project" button in the sidebar links to `/create`:

```tsx
<Link href="/create">
  <button className="...">
    <Plus /> New Project
  </button>
</Link>
```

### After Creation

1. Success screen shows for 3 seconds
2. `router.push('/dashboard')` redirects
3. Dashboard should display the new project
4. User can see project in "My Projects" section

---

## 🧪 Testing the Flow

### Manual Test Steps

1. **Start dev server**: `npm run dev`
2. **Navigate to dashboard**: `/dashboard`
3. **Click "New Project"** in sidebar
4. **Fill Step 1**:
   - Brand Name: "Test Brand"
   - Industry: "SaaS"
   - Click "Continue"
5. **Fill Step 2**:
   - Select vibe: "Elegant"
   - Adjust slider: 75%
   - Click "Create My Website"
6. **Verify**:
   - Loading spinner appears
   - Success screen shows after creation
   - Redirects to dashboard after 3s
7. **Check database**: Query `projects` table for new entry

### API Test (Postman/cURL)

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "formData": {
      "brandName": "Test Corp",
      "industry": "Tech Startup",
      "vibe": "cyberpunk",
      "vibeIntensity": 80
    }
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "project": {
    "id": "...",
    "name": "Test Corp Website",
    "subdomain": "test-corp-...",
    "blocks": [...]
  }
}
```

---

## 🚀 Future Enhancements

### Phase 1 (Current)
- ✅ Basic 2-step wizard
- ✅ Mock block assembly
- ✅ Database integration
- ✅ Success animation

### Phase 2 (Planned)
- [ ] **Step 3**: Additional customization (logo upload, color overrides)
- [ ] **Real-time preview** of selected vibe
- [ ] **Undo/Redo** in wizard steps
- [ ] **Save draft** before completing

### Phase 3 (Advanced)
- [ ] **AI-powered block selection** from real generated blocks
- [ ] **Industry-specific templates** with pre-configured vibes
- [ ] **Multi-page websites** (add About, Contact pages)
- [ ] **Custom domain** configuration during creation
- [ ] **Collaboration**: Share wizard link with team

### Phase 4 (Pro Features)
- [ ] **A/B testing**: Generate multiple variants
- [ ] **Import from Figma**: Upload design mockups
- [ ] **Voice input**: Describe website verbally
- [ ] **White-label**: Custom branding for agencies

---

## 📊 Database Schema

### Projects Table

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  subdomain TEXT UNIQUE,
  custom_domain TEXT,
  blocks JSONB DEFAULT '[]',         -- Array of selected blocks
  global_config JSONB DEFAULT '{}',  -- Brand, vibe, colors
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Example `blocks` JSONB

```json
[
  { "blockId": "1", "name": "Minimal Hero", "type": "hero", "order": 0 },
  { "blockId": "5", "name": "Clean Navbar", "type": "navbar", "order": 1 },
  { "blockId": "8", "name": "Grid Features", "type": "features", "order": 2 },
  { "blockId": "12", "name": "Simple Pricing", "type": "pricing", "order": 3 },
  { "blockId": "18", "name": "Simple Footer", "type": "footer", "order": 4 }
]
```

### Example `global_config` JSONB

```json
{
  "brandName": "Acme Corp",
  "industry": "SaaS",
  "vibe": "elegant",
  "vibeIntensity": 75,
  "colorScheme": {
    "primary": "#8B5CF6",
    "secondary": "#3B82F6",
    "accent": "#EC4899"
  }
}
```

---

## 🐛 Troubleshooting

### Issue: "Unauthorized" error

**Solution**: Ensure user is logged in. Check Supabase authentication:
```typescript
const { data: { user } } = await supabase.auth.getUser();
```

### Issue: Wizard won't proceed to next step

**Solution**: Check validation. Both brand name and industry must be filled in Step 1.

### Issue: Success screen doesn't redirect

**Solution**: Check router push timing. Default is 3 seconds:
```typescript
setTimeout(() => {
  router.push('/dashboard');
}, 3000);
```

### Issue: API returns 500 error

**Solution**: Check:
1. Supabase connection (`.env.local` keys)
2. Database schema is applied
3. Console logs for specific error

---

## 📚 Related Documentation

- [Dashboard Components](c:\Users\ingal\Desktop\svarnex2026\DASHBOARD.md)
- [Block Generator System](c:\Users\ingal\Desktop\svarnex2026\lib\factory\README.md)
- [Supabase Setup Guide](c:\Users\ingal\Desktop\svarnex2026\supabase\SETUP.md)
- [Database Schema](c:\Users\ingal\Desktop\svarnex2026\supabase\schema.sql)

---

**Created**: February 16, 2026  
**Status**: ✅ Complete and functional  
**Next Step**: Connect to real generated blocks from AI system
