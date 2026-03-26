# 🚀 QUICK REFERENCE - TELISIK UI REFACTORING

## One-Minute Component Cheat Sheet

### Import Any Component
```jsx
import { Button, Alert, Input, Modal, Card, Badge, Skeleton } 
  from "../components/ui";

// OR individual
import Button from "../components/ui/Button";
```

### Most Used Patterns

#### Form (Copy This)
```jsx
const [data, setData] = useState({...});
const [error, setError] = useState("");

<form onSubmit={handleSubmit} className="space-y-5 max-w-md">
  {error && <Alert type="danger" message={error} onClose={() => setError("")} />}
  
  <Input type="text" label="Name" value={data.name} 
    onChange={(e) => setData({...data, name: e.target.value})} required />
  
  <Button fullWidth loading={loading}>Submit</Button>
</form>
```

#### Content Card
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-md">
  <Card padding="md" shadow="md">
    <h3 className="text-lg font-semibold mb-2">Title</h3>
    <p className="text-neutral-600">Content here</p>
  </Card>
</div>
```

#### Loading State
```jsx
{isLoading ? (
  <Skeleton count={3} />
) : (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
    {items.map(item => <Card key={item.id}>{item.name}</Card>)}
  </div>
)}
```

---

## Colors Reference

| Use | Class |
|-----|-------|
| Danger text | `text-danger-600` |
| Warning bg | `bg-warning-50` |
| Success badge | `text-success-700` |
| Link color | `text-cyan-600` |
| Brand | `text-telisik` |

---

## Spacing Reference

| Value | Size |
|-------|------|
| xs | 8px |
| sm | 16px |
| md | 24px |
| lg | 32px |
| xl | 48px |

Use: `p-md`, `gap-lg`, `mb-sm`, etc.

---

## Mobile First Pattern
```jsx
// Default mobile, then tablet, then desktop
<div className="
  grid grid-cols-1      // mobile: 1 column
  md:grid-cols-2        // tablet+: 2 columns  
  lg:grid-cols-3        // desktop+: 3 columns
  gap-md
">
```

---

## NO More Bootstrap in New Code
❌ `<div className="btn btn-primary">`  
✅ `<Button variant="primary">`

❌ `<div className="alert alert-danger">`  
✅ `<Alert type="danger" />`

❌ `<div style={{padding: "1rem"}}>`  
✅ `<div className="p-md">`

---

## Component Props Quick Ref

**Button**
```jsx
<Button variant="primary|secondary|outline|danger|ghost" 
  size="sm|md|lg" disabled loading fullWidth onClic>
```

**Input**
```jsx
<Input type="text|email|password|date" label="Text" 
  error={bool} errorMessage="Msg" hint="Help text" />
```

**Alert**
```jsx
<Alert type="info|success|warning|danger" message="Text" 
  onClose={fn} onRetry={fn} title="Optional" />
```

---

## Before/After Comparison

**BEFORE** (Don't do this)
```jsx
<input style={{
  padding: "0.75rem 1rem",
  border: "1px solid #C5C4BB",
  borderRadius: "0.375rem",
  fontSize: "1rem"
}} />
```

**AFTER** (Do this)
```jsx
<Input label="Email" type="email" />
```

---

## 3-Step Refactoring Checklist

### 1️⃣ Replace Components
```
❌ Custom Alert boxes → ✅ <Alert />
❌ Custom Buttons → ✅ <Button />
❌ Custom inputs → ✅ <Input />
❌ Custom modals → ✅ <Modal />
```

### 2️⃣ Convert Inline Styles
```
❌ style={{padding: "1rem"}} → ✅ className="p-md"
❌ style={{color: "#FC6736"}} → ✅ className="text-telisik"
❌ style={{marginBottom: "1.5rem"}} → ✅ className="mb-md"
```

### 3️⃣ Verify & Test
```
✓ No console errors
✓ Responsive on mobile
✓ All interactions work
✓ No hardcoded colors visible
```

---

## File Structure
```
src/
├── components/
│   ├── ui/              <- NEW COMPONENTS HERE
│   │   ├── Alert.jsx
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   ├── Skeleton.jsx
│   │   └── index.js     <- Import from here
│   ├── [other components]
├── pages/
│   ├── LoginPage.jsx    (✅ DONE - reference)
│   ├── RegisterPage.jsx (✅ DONE - reference)
│   ├── VerifyOTPPage.jsx (✅ DONE - reference)
│   ├── HomePage.jsx     (⏳ TODO)
│   └── [other pages]
├── index.css
└── App.jsx

tailwind.config.cjs       <- Design tokens
```

---

## Git Workflow

```bash
# Start new page refactor
git checkout -b refactor/article-page

# Make changes
git add .
git commit -m "refactor: convert ArticlePage to Tailwind"

# Test thoroughly
npm run dev

# Push and create PR
git push origin refactor/article-page
```

---

## Common Mistakes to Avoid

❌ **Mistake 1**: Using both Bootstrap + Tailwind  
✅ **Solution**: Use ONLY Tailwind for new code

❌ **Mistake 2**: Hardcoding colors  
✅ **Solution**: Use class names: `text-telisik`, `bg-neutral-50`

❌ **Mistake 3**: Not using components  
✅ **Solution**: Every input/button/alert uses components

❌ **Mistake 4**: Ignoring mobile layout  
✅ **Solution**: Test on mobile, use responsive classes

❌ **Mistake 5**: Forgetting labels on inputs  
✅ **Solution**: Always add label prop to Input

---

## Performance Tips

✅ Use `React.memo()` for cards that rerender  
✅ Use `useMemo()` for expensive calculations  
✅ Lazy load heavy components with `React.lazy()`  
✅ Optimize images with WebP  
✅ Remove unused CSS classes  

---

## Testing Checklist

Before committing code:
- [ ] Works on mobile (375px)
- [ ] Works on tablet (768px)
- [ ] Works on desktop (1024px)
- [ ] All inputs focusable (keyboard)
- [ ] No console errors/warnings
- [ ] Loading states work
- [ ] Error states look good
- [ ] Images load properly

---

## Useful Links

📖 **Docs**
- Tailwind: https://tailwindcss.com/docs
- React: https://react.dev
- Our Components: See COMPONENT_GUIDE.md

🎨 **Tools**
- Tailwind Playground: https://play.tailwindcss.com
- Color Tool: https://www.tinycolor.com

---

## When Stuck

1. Check **COMPONENT_GUIDE.md** for examples
2. Look at reference pages (Login, Register, OTP)
3. Search existing code for similar pattern
4. Check **FRONTEND_IMPROVEMENTS.md** for details
5. Ask team or check git history

---

## One-Page Summary

| What | How |
|------|-----|
| **Component** | `import { Button } from "../components/ui"` |
| **Color** | `className="text-telisik"` |
| **Spacing** | `className="p-md gap-lg"` |
| **Responsive** | `className="md:grid-cols-2 lg:grid-cols-3"` |
| **Form** | Use `<Input>` + `<Button>` |
| **Alerts** | Use `<Alert type="">` |
| **Loading** | Use `<Skeleton />` |
| **Modals** | Use `<Modal show={}>` |

---

**Print this page and keep it at your desk!** 📌

Last updated: March 17, 2026
