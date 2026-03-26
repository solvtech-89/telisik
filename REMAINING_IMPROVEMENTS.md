# TELISIK UI - REMAINING IMPROVEMENTS CHECKLIST

## 📋 PRIORITIZED TASK LIST

### PHASE 1: CRITICAL (Auth & Core Pages) - ✅ COMPLETED
- [x] Enhance Tailwind config with design system
- [x] Create core UI components (Alert, Button, Input, Modal)
- [x] Refactor LoginPage - full Tailwind conversion
- [x] Refactor RegisterPage - responsive + validation
- [x] Refactor VerifyOTPPage - inline alerts to components
- [x] Document design system (COMPONENT_GUIDE.md)
- [x] Create comprehensive analysis (FRONTEND_IMPROVEMENTS.md)

**Status**: ✅ COMPLETE - All auth pages now use Tailwind and new components

---

### PHASE 2: HIGH PRIORITY (Main Content Pages) - ⏳ IN PROGRESS

#### HomePage.jsx
**Priority**: HIGH - Landing page first impression matters

**Current Issues**:
- [ ] Using @tabler/core Bootstrap CSS (~50KB)
- [ ] Map initialization using jsvectorMap with external CSS
- [ ] Hardcoded color values in JSX
- [ ] Grid/spacing using inline styles
- [ ] Not responsive on mobile (map takes up full height)
- [ ] Complex state management for markers

**ToDo**:
```
1. Remove @tabler/core import and CSS classes (bg-card, etc.)
2. Create MapContainer component wrapper
3. Convert all inline styles to Tailwind
4. Replace Bootstrap grid with Tailwind grid
5. Create ArticleCardGrid component (extract from JSX)
6. Optimize map re-render with useMemo
7. Test responsive layout on mobile (vertical stack)
8. Add loading skeleton while data fetches
```

**Expected Time**: 2-3 hours  
**Difficulty**: Medium

---

#### ArticleListPage.jsx
**Priority**: HIGH - Core user flow page

**Current Issues**:
- [ ] External CSS file (ArticleListPage.css)
- [ ] Sidebar width hardcoded and not mobile responsive
- [ ] Loading state not visually distinct
- [ ] Infinite scroll trigger not obvious to user
- [ ] Layout breaks on small screens

**ToDo**:
```
1. Delete ArticleListPage.css, convert to Tailwind
2. Create ResponsiveSidebar component with mobile collapse
3. Add visual loading indicator for "load more"
4. Create ArticleCardItem component
5. Improve mobile layout (stack sidebar on mobile)
6. Add empty state when no articles
7. Better category filter UI with Badge component
8. Add Search functionality with Input component
```

**Expected Time**: 2-3 hours  
**Difficulty**: Medium

---

#### ArticlePage.jsx
**Priority**: HIGH - Critical reading experience

**Current Issues**:
- [ ] 600+ lines, too complex (needs breaking down)
- [ ] AlertBox component duplicated (use Alert)
- [ ] Modal styling uses inline styles (use Modal)
- [ ] ArticlePage.css file (convert to Tailwind)
- [ ] Comment section has separate CSS file
- [ ] Edit mode modal not accessible

**ToDo**:
```
1. Extract AlertBox duplicates → use Alert component
2. Extract modal code → use Modal component
3. Delete CSS files, convert styles to Tailwind
4. Create ArticleHeader component
5. Create ArticleBody component (rendering, metadata)
6. Create ArticleActions component (edit, comment buttons)
7. Create CommentItem component
8. Improve responsive layout (narrow on mobile)
9. Add syntax highlighting for code blocks
10. Better spacing/typography hierarchy
```

**Expected Time**: 3-4 hours  
**Difficulty**: Hard (largest component)

---

### PHASE 3: MEDIUM PRIORITY (Supporting Pages) - ⏳ TODO

#### CompleteProfilePage.jsx
**Priority**: MEDIUM - User onboarding flow

**Current Issues**:
- [ ] CompleteProfilePage.css file
- [ ] Avatar upload modal complex logic
- [ ] Form not optimal on mobile
- [ ] Multiple UI state variables scattered

**ToDo**:
```
1. Delete CSS file, use Tailwind
2. Create AvatarUploader component
3. Group related form fields with FormField wrapper
4. Better mobile form layout (stack vertically)
5. Improve profile picture preview
6. Add validation feedback before submit
7. Loading state on submit button
```

**Expected Time**: 1.5-2 hours  
**Difficulty**: Easy-Medium

---

#### StaticPage.jsx
**Priority**: MEDIUM - Static content pages

**Current Issues**:
- [ ] Mixing inline styles + Tailwind
- [ ] Sidebar toggle animation not smooth
- [ ] Layout issues on very small screens

**ToDo**:
```
1. Simplify layout to pure Tailwind
2. Smooth sidebar toggle transition
3. Better mobile responsive (full width on mobile)
4. Add breadcrumb navigation
5. Add table of contents sidebar
```

**Expected Time**: 1 hour  
**Difficulty**: Easy

---

### PHASE 4: LOW PRIORITY (Future Enhancements) - ⏳ TODO

#### Navbar.jsx
**Priority**: LOW - Already functional

**Improvements**:
- [ ] Simplify state management
- [ ] Better mobile menu animation
- [ ] Use design tokens for spacing
- [ ] Add user dropdown menu component

**Expected Time**: 1 hour  
**Difficulty**: Easy

---

#### Additional Components to Create
- [ ] FormField.jsx - Label + input wrapper
- [ ] Card.jsx - ✅ Done
- [ ] Badge.jsx - ✅ Done
- [ ] Skeleton.jsx - ✅ Done
- [ ] Tabs.jsx - Tab navigation
- [ ] Dropdown.jsx - Menu dropdown
- [ ] Avatar.jsx - User avatar display
- [ ] Pagination.jsx - Better pagination UI
- [ ] SearchInput.jsx - Search with suggestions

**Overall Time**: 4-6 hours across all components

---

## 🗂️ CSS FILES TO REMOVE

Track deletion after conversion:
- [ ] HomePage.css → Convert to Tailwind
- [ ] ArticleListPage.css → Convert to Tailwind
- [ ] ArticlePage.css → Convert to Tailwind
- [ ] ArticleCardGrid.css? → Check if still used
- [ ] BlockEditor.css → Coordinate with component
- [ ] CommentSection.css → Extract component
- [ ] SectionEditor.css → Coordinate with component
- [ ] SectionDisplay.css → Check dependencies
- [ ] TimelineEditor.css → Coordinate with component
- [ ] SidebarNav.css → Use Tailwind
- [ ] DiskursusContent.css → Check structure
- [ ] CompleteProfilePage.css → Convert to Tailwind
- [ ] ParagraphEditor.css → Check if still used
- [ ] ProfilePhotoModal.css? → Check dependencies
- [ ] Navbar.css? → Check if still used
- [ ] RightSidebar.css? → Check if still used

**Action**: 
```bash
# Before deleting, search for import statements:
grep -r "ArticleListPage.css" src/
# Then verify no other files import it before deleting
```

---

## 🧪 TESTING CHECKLIST

Before considering each page "complete":

### Responsive Design
- [ ] Mobile (375px) - layouts stack properly
- [ ] Tablet (768px) - intermediate layout
- [ ] Desktop (1024px+) - full layout

### Functionality
- [ ] All interactive elements work
- [ ] Forms submit correctly
- [ ] Links navigate properly
- [ ] Loading states appear

### Visual
- [ ] Colors match design system
- [ ] Spacing is consistent
- [ ] Text is readable (contrast)
- [ ] No layout shifts or jank

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Labels on form inputs
- [ ] ARIA attributes present

### Performance
- [ ] Page loads quickly
- [ ] Smooth animations
- [ ] No console errors
- [ ] Images optimized

---

## 📊 ESTIMATED TIMELINE

| Task | Hours | Status |
|------|-------|--------|
| Phase 1 (Auth Pages) | 8 | ✅ DONE |
| Phase 2 (HomePage) | 2-3 | ⏳ TODO |
| Phase 2 (ArticleListPage) | 2-3 | ⏳ TODO |
| Phase 2 (ArticlePage) | 3-4 | ⏳ TODO |
| Phase 3 (CompleteProfilePage) | 1.5-2 | ⏳ TODO |
| Phase 3 (StaticPage) | 1 | ⏳ TODO |
| Phase 4 (Additional) | 4-6 | ⏳ TODO |
| Testing & QA | 3-4 | ⏳ TODO |
| **TOTAL** | **25-32** | **Ongoing** |

---

## 🚀 DEPLOYMENT STRATEGY

### Before Each Phase
1. Run `npm run build` - verify no errors
2. Check `npm run lint` - fix any warnings
3. Screenshots of key pages
4. Test on multiple browsers

### Testing Order
1. Auth flow (Login → Register → OTP)
2. Homepage + navigation
3. Article listing + reading
4. Profile pages
5. Static content
6. Full responsive test

### Rollback Plan
If issues found:
- Keep git commits small and focused
- Tag release point before starting phase
- Easy to revert if needed

---

## 💡 IMPLEMENTATION NOTES

### Best Practices
1. **Commit Often**: After each component conversion, commit
2. **Component Size**: Keep components under 200 lines
3. **Extract Logic**: Move business logic to hooks
4. **Test Immediately**: Don't wait until end
5. **Ask for Review**: Get feedback on design decisions

### File Naming
```
Components: PascalCase.jsx
Hooks: useHookName.js
Utils: functionName.js
Styles: Gone (use Tailwind!)
```

### Documentation
- Add JSDoc comments for complex components
- Document props with PropTypes or TypeScript
- Include usage examples in comments

---

## 🎯 SUCCESS CRITERIA

Phase will be considered complete when:
- ✅ All pages use Tailwind CSS (no inline styles)
- ✅ Reusable components used consistently
- ✅ Mobile responsive (tested on real devices)
- ✅ No console errors or warnings
- ✅ Lighthouse score > 80
- ✅ Component guide updated
- ✅ PR reviewed and approved

---

**Next Action**: Start Phase 2 with HomePage refactoring  
**Estimated Start Date**: After current iteration  
**Review Point**: After HomePage is complete  
**Stakeholder**: Frontend Team Lead

---

*Created: March 17, 2026*  
*Version: 1.0*  
*Status: ACTIVE*
