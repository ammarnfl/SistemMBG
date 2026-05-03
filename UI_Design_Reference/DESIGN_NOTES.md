# Sistem Evaluasi Layanan MBG - Design Documentation

## Design System

### Color Palette
- **Primary Green**: `#16a34a` - Trust, health, freshness
- **Warm Orange Accent**: `#f97316` - Friendly, warm, attention
- **Background**: `#fafafa` - Clean, spacious off-white
- **Card**: `#ffffff` - Pure white for contrast

### Typography
- Uses system default fonts for accessibility and performance
- Strong heading hierarchy (h1-h4 with medium weight)
- Readable body text with neutral weight

### Component Design
- **Cards**: White with soft shadows, medium border radius (0.625rem)
- **Badges**: Color-coded for status (green=success, orange=warning, red=error)
- **Buttons**: Primary green, clear hierarchy with outline variants
- **Icons**: Simple outline style from Lucide React
- **Spacing**: Generous padding and margins for mobile usability

## Role-Based Flows

### 1. Admin
**Purpose**: Master data management and system oversight

**Key Screens**:
- Dashboard: System-wide statistics, charts, recent activities
- Users: CRUD operations for all user accounts
- Kitchens: Manage kitchen facilities and capacities
- Schools: School registry and student counts
- Classes: Class/group management
- Beneficiaries: Student beneficiary management
- Mapping: Kitchen-to-school distribution mapping with utilization metrics

**Design Focus**: Efficient data management, clear status indicators, searchable lists

### 2. Kitchen Team
**Purpose**: Menu planning, distribution, and evaluation monitoring

**Key Screens**:
- Dashboard: Today's distribution stats, rating trends, pending confirmations
- Menus: Weekly menu planning with historical ratings
- Composition: Detailed nutritional breakdown per menu
- Distribution: Real-time delivery tracking and status
- Confirmations: School delivery confirmation monitoring
- Evaluations: Overall and per-component rating analysis
- Feedback: Review feedback with validation flags and photos
- Reports: Weekly/monthly analytics and insights

**Design Focus**: Real-time monitoring, actionable insights, anomaly detection

### 3. Teacher
**Purpose**: Delivery confirmation and student participation monitoring

**Key Screens**:
- Dashboard: Quick status overview, pending tasks
- Confirmation: Simple delivery confirmation with optional issue reporting
- Monitoring: Student participation tracking with real-time progress
- Notes: School-level feedback to kitchen team

**Design Focus**: Quick actions, clear CTAs, minimal friction

### 4. Beneficiary
**Purpose**: Meal evaluation submission with validation logic

**Key Screens**:
- Dashboard: Today's menu, submission status, recent history
- Attendance: Simple yes/no consumed question
- Rating: Overall satisfaction rating (1-5 stars) with emoji feedback
- Component Rating: Per-component consumption rating (1-5 stars)
- Feedback: Optional or required feedback and photo upload
- History: Submission history with success confirmation

**Design Focus**: Child-friendly, step-by-step flow, clear progress indicators

## Key Features

### Validation Logic (Beneficiary Flow)
The system implements smart validation requirements:

**Triggers for Required Validation**:
1. Overall rating ≤ 2 (very low satisfaction)
2. Any component rating ≤ 2 (low consumption)
3. Food not consumed (attendance = no)
4. (Future: Random sampling, anomaly detection)

**When Triggered**:
- Feedback text becomes **required**
- Photo upload becomes **required**
- Clear messaging explains why validation is needed
- Orange warning cards highlight validation requirements

**Normal Flow** (high ratings):
- Feedback is **optional**
- Photo is **optional**
- Green success messaging
- Quick submission process

### Two-Type Rating System
**A. Overall Food Rating (Satisfaction)**
- Question: "How did you like the food?"
- Scale: 1 (really dislike) → 5 (really like)
- Uses yellow star icons
- Emoji feedback for each level
- Measures general satisfaction

**B. Per-Component Consumption Rating**
- Question: "How much did you eat?"
- Scale: 1 (barely eaten) → 5 (finished all)
- Uses blue star icons
- Separate rating for each menu component
- Measures actual consumption

**Clear Separation**: Different icons, colors, and labels prevent confusion

### Mobile-First Navigation
- Sticky header with app logo and hamburger menu
- Sheet-based side navigation for all menu items
- Clear current page highlighting
- Logout option in navigation drawer
- Consistent across all roles

### State Management
**Loading States**: Skeleton screens and spinners
**Empty States**: Friendly messages with illustrations
**Error States**: Clear error messages with retry options
**Success States**: Animated confirmations with confetti/checkmarks

### Accessibility
- High contrast text and backgrounds
- Touch-friendly button sizes (min 44x44px)
- Clear labels and descriptions
- Logical tab order and focus states
- Screen reader friendly markup

### Responsive Design
**Mobile (Default)**:
- Single column layouts
- Full-width cards
- Bottom-aligned CTAs
- Touch-optimized controls
- Collapsible sections

**Tablet/Desktop**:
- Multi-column grids
- Side-by-side forms
- More data density
- Hover states
- Wider charts

## Technical Implementation

### Tech Stack
- React 18 with TypeScript
- React Router 7 for navigation
- Tailwind CSS v4 for styling
- Recharts for data visualization
- Lucide React for icons
- Motion (Framer Motion) for animations
- Sonner for toast notifications
- Radix UI for accessible components

### File Structure
```
/src/app/
  ├── components/
  │   ├── MobileNav.tsx (shared navigation)
  │   └── ui/ (Radix UI components)
  ├── layouts/
  │   ├── AdminLayout.tsx
  │   ├── KitchenLayout.tsx
  │   ├── TeacherLayout.tsx
  │   └── BeneficiaryLayout.tsx
  ├── pages/
  │   ├── admin/
  │   ├── kitchen/
  │   ├── teacher/
  │   └── beneficiary/
  ├── routes.tsx
  └── App.tsx
```

### Key Patterns
- Route-based code splitting
- Component composition with cards
- Consistent form patterns
- Reusable badge components
- State passed via route location state
- Toast notifications for feedback

## Usage Guidelines

### For Designers
1. Follow the green/orange/white color scheme
2. Maintain card-based layouts
3. Use consistent spacing (px-4, py-6 pattern)
4. Keep CTAs prominent and clear
5. Always show progress for multi-step flows

### For Developers
1. All new screens should use the layout wrappers
2. Toast notifications for all user actions
3. Validate forms before navigation
4. Pass state via route location for flow continuity
5. Use motion for success animations

### For Content Writers
1. Keep labels short and clear
2. Use friendly, encouraging tone for beneficiaries
3. Professional tone for admin/kitchen
4. Always explain why validation is needed
5. Provide helpful examples in placeholders

## Future Enhancements

### Phase 2 Features
- Real-time notifications
- Push reminders for submissions
- Bulk import for beneficiaries
- Advanced filtering and search
- Export to PDF/Excel
- Multi-language support (Bahasa + regional)

### Phase 3 Features
- Offline support with service workers
- Photo compression and optimization
- AI-powered anomaly detection
- Predictive analytics dashboard
- Parent portal for feedback
- Integration with school systems

## Usability Principles Applied

1. **Consistency**: Same patterns across all roles
2. **Error Prevention**: Validation before submission, clear requirements
3. **Visibility of Status**: Progress bars, status badges, clear feedback
4. **User Control**: Back buttons, cancel options, edit capabilities
5. **Efficiency**: Quick actions, smart defaults, minimal steps
6. **Minimalist Design**: Only essential information, no clutter
7. **Recognition Over Recall**: Icons with labels, clear navigation
8. **Flexibility**: Works for various screen sizes and abilities
9. **Error Recovery**: Clear error messages, easy to retry
10. **Help & Documentation**: Inline tips, contextual help cards

---

**Last Updated**: April 20, 2026
**Version**: 1.0.0
**Status**: Production Ready
