# TELISIK UI - DESIGN SYSTEM & COMPONENT GUIDE

## 🎨 Quick Start

### Import Components
```jsx
import { Button, Alert, Input, Modal, Card, Badge } from "../components/ui";
// atau individual imports:
import Button from "../components/ui/Button";
```

---

## 📦 COMPONENT REFERENCE

### Button
```jsx
// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>

// States
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>
<Button fullWidth>Full Width</Button>

// Combined
<Button variant="primary" size="lg" fullWidth loading={isLoading}>
  Kirim
</Button>
```

### Input
```jsx
<Input
  type="email"
  label="Email Address"
  placeholder="your@email.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>

// With error
<Input
  type="password"
  label="Password"
  error={!passwordMatch}
  errorMessage="Passwords don't match"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

// With hint
<Input
  type="date"
  label="Birth Date"
  hint="Your birth date will be private"
  value={birthDate}
  onChange={(e) => setBirthDate(e.target.value)}
/>
```

### Alert
```jsx
// Types
<Alert type="info" message="This is informational" />
<Alert type="success" message="Operation successful!" />
<Alert type="warning" message="Be careful" />
<Alert type="danger" message="An error occurred" />

// With actions
<Alert
  type="danger"
  message={error}
  onClose={() => setError("")}
  onRetry={handleRetry}
/>

// With title
<Alert
  type="warning"
  title="Warning"
  message="Something might go wrong"
/>
```

### Modal
```jsx
<Modal
  show={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
>
  <p>Are you sure?</p>
  <footer>
    <Button variant="secondary" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button variant="danger" onClick={handleConfirm}>
      Delete
    </Button>
  </footer>
</Modal>
```

### Card
```jsx
<Card padding="md" shadow="md" hover>
  <h3>Card Title</h3>
  <p>Card content here</p>
</Card>

// Sizes
<Card padding="sm">Small padding</Card>
<Card padding="lg">Large padding</Card>

// Shadows
<Card shadow="none">No shadow</Card>
<Card shadow="lg">Large shadow</Card>

// Hover effect
<Card hover onClick={handleClick}>
  Clickable card
</Card>
```

### Badge
```jsx
// Variants
<Badge variant="default">Default</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>

// Combined
<Badge variant="success" size="md">Approved</Badge>
```

### Skeleton (Loading)
```jsx
// Single line
<Skeleton height="h-4" width="w-full" />

// Multiple lines
<Skeleton count={3} />

// Circular (for avatars)
<Skeleton circle height="h-10" width="w-10" />

// Custom classes
<Skeleton className="mb-4" count={2} />
```

---

## 🎨 TAILWIND DESIGN TOKENS

### Colors
```jsx
// Primary Brand
className="text-telisik"          // #FC6736
className="bg-telisik"            // Brand orange
className="hover:text-telisik-dark" // Darker shade

// Neutral (Grayscale)
className="text-neutral-50"  // #F9FAFB (lightest)
className="text-neutral-500" // #6B7280 (mid-gray)
className="text-neutral-900" // #111827 (darkest)

// Status
className="text-success-700"  // Success state
className="bg-warning-50"     // Warning background
className="border-danger-300" // Danger border
```

### Spacing
```jsx
// All spacing uses consistent scale
className="gap-xs"    // 0.5rem (8px)
className="gap-sm"    // 1rem (16px)
className="gap-md"    // 1.5rem (24px)
className="gap-lg"    // 2rem (32px)
className="gap-xl"    // 3rem (48px)

// Applies to padding, margin, gaps
className="p-md"      // padding
className="m-lg"      // margin
className="gap-sm"    // gap
```

### Typography
```jsx
className="text-xs"   // 0.75rem
className="text-sm"   // 0.875rem
className="text-base" // 1rem (default)
className="text-lg"   // 1.125rem
className="text-xl"   // 1.25rem
className="text-2xl"  // 1.5rem
className="text-3xl"  // 1.875rem
className="text-4xl"  // 2.25rem
```

### Shadows
```jsx
className="shadow-xs"  // Subtle
className="shadow-sm"  // Small
className="shadow-md"  // Medium (default)
className="shadow-lg"  // Large
className="shadow-xl"  // Extra large
```

---

## 📱 RESPONSIVE PATTERNS

### Mobile First
```jsx
// Mobile-first: styles apply to all sizes by default
<div className="p-4 md:p-6 lg:p-8">
  {/* p-4 on mobile, p-6 on medium, p-8 on large */}
</div>

// Common breakpoints
md: 768px   // Medium devices
lg: 1024px  // Large devices
xl: 1280px  // Extra large
2xl: 1536px // 2x large
```

### Layout Examples
```jsx
// Stack on mobile, grid on tablet+
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>

// Full width on mobile, max width on desktop
<div className="w-full max-w-2xl mx-auto px-4">
  <h1>Responsive container</h1>
</div>
```

---

## 🔄 FORM PATTERNS

### Form with Validation
```jsx
const [formData, setFormData] = useState({
  email: "",
  password: "",
  error: "",
});

const handleSubmit = async (e) => {
  e.preventDefault();
  setFormData({ ...formData, error: "" });

  try {
    // API call
    const response = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    const data = await response.json();

    if (!response.ok) {
      setFormData({ ...formData, error: data.error });
      return;
    }
    // Success
  } catch (error) {
    setFormData({ ...formData, error: "An error occurred" });
  }
};

return (
  <form onSubmit={handleSubmit} className="space-y-5">
    {formData.error && (
      <Alert type="danger" message={formData.error} onClose={() => ...} />
    )}

    <Input
      type="email"
      label="Email"
      value={formData.email}
      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
    />

    <Button fullWidth loading={isLoading}>
      Login
    </Button>
  </form>
);
```

---

## 🎯 COMMON PATTERNS

### Page Layout
```jsx
export default function MyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Container with max width */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-6">
          Page Title
        </h1>

        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <Card className="md:col-span-2">
            Main content
          </Card>
          <Card>Sidebar</Card>
        </div>
      </div>
    </div>
  );
}
```

### Loading State
```jsx
const [loading, setLoading] = useState(true);
const [items, setItems] = useState([]);

useEffect(() => {
  fetchItems().finally(() => setLoading(false));
}, []);

return loading ? (
  <div className="space-y-4">
    <Skeleton count={3} />
  </div>
) : (
  <div className="space-y-4">
    {items.map((item) => (
      <Card key={item.id}>{item.name}</Card>
    ))}
  </div>
);
```

---

## ✅ DO's & DON'Ts

### ✅ DO
```jsx
// Use Tailwind classes
<button className="px-4 py-2 bg-telisik text-white rounded-lg">
  Button
</button>

// Use design tokens
<div className="text-telisik-dark gap-md">Content</div>

// Use component variants
<Button variant="outline" size="lg">Submit</Button>

// Mobile first
<div className="grid grid-cols-1 md:grid-cols-2">
  Items
</div>
```

### ❌ DON'T
```jsx
// Don't use inline styles
<button style={{ padding: "8px 16px" }}>
  Button
</button>

// Don't hardcode colors
<div style={{ color: "#FC6736" }}>Text</div>

// Don't mix Bootstrap with Tailwind
<div className="btn btn-primary px-4">
  Button
</div>

// Don't mix spacing
<div style={{ padding: "1rem" }} className="gap-4">
  Mixed spacing
</div>
```

---

## 🧪 TESTING RESPONSIVE DESIGN

Test at these breakpoints:
- **Mobile**: 375px, 425px (phones)
- **Tablet**: 768px, 820px (tablets)
- **Desktop**: 1024px, 1440px, 1920px
- **Ultra-wide**: 2560px

Use Chrome DevTools device emulation for testing.

---

## 📚 RESOURCES

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind Color Palette](https://tailwindcss.com/docs/customizing-colors)
- [Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Component Library](./src/components/ui)
- [Tailwind Config](./tailwind.config.cjs)

---

**Last Updated**: March 17, 2026  
**Maintained By**: Frontend Development Team  
**Version**: 1.0.0
