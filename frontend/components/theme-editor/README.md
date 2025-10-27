# Theme Editor Components

Professional "Figma-style" theme editor for UNS-ClaudeJP-5.0

## Components Created

### 1. EditorCanvas (`editor-canvas.tsx`)
- **Purpose**: Main canvas area where the theme preview is rendered
- **Features**:
  - Live theme preview with clickable elements (header, sidebar, main, card, footer)
  - Device mode support (desktop, tablet, mobile)
  - Grid overlay toggle
  - Zoom/scale support
  - Selection indicators (ring around selected element)
  - Preview mode (hides selection indicators)

### 2. SidebarTree (`sidebar-tree.tsx`)
- **Purpose**: Element tree/layers panel for navigation
- **Features**:
  - Hierarchical element list with icons
  - Click to select elements for editing
  - Visual indication of selected element
  - Descriptions for each element

### 3. PropertiesPanel (`properties-panel.tsx`)
- **Purpose**: Properties editor for selected elements
- **Features**:
  - Tabbed interface (Style, Typography, Layout)
  - Live property editing with immediate preview
  - CSS variable support
  - Empty state when no element selected

## Main Theme Editor Page

Located at: `/settings/templates`

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Top Toolbar (Logo | Undo/Redo | Actions)                    │
├───────────┬─────────────────────────────────┬───────────────┤
│           │ Canvas Toolbar                   │               │
│           │ (Device | Zoom | Grid | Preview) │               │
│  Element  ├─────────────────────────────────┤  Properties   │
│   Tree    │                                  │     Panel     │
│  (Layers) │        EditorCanvas              │   (Tabbed)    │
│           │       (Live Preview)             │               │
│           │                                  │               │
└───────────┴─────────────────────────────────┴───────────────┘
```

### Toolbar Actions

**Top Toolbar:**
- **Undo/Redo**: Navigate through history (50 states max)
- **Load Theme**: Dropdown to load saved themes
- **Save**: Save current theme with custom name
- **Export**: Download theme as JSON file
- **Import**: Upload theme JSON file
- **Reset**: Reset to default theme (with confirmation)
- **Unsaved Changes Indicator**: Alert icon when there are unsaved changes

**Canvas Toolbar:**
- **Device Mode**: Toggle between Desktop / Tablet / Mobile views
- **Zoom Slider**: Scale from 50% to 150%
- **Grid Toggle**: Show/hide grid overlay (20px grid)
- **Preview Mode**: Toggle between Edit and Preview modes

### Keyboard Shortcuts

- **Cmd/Ctrl+Z**: Undo last change
- **Cmd/Ctrl+Shift+Z**: Redo last undone change
- **Cmd/Ctrl+S**: Open Save Theme dialog
- **Escape**: Deselect current element

### Dialogs

#### Save Theme Dialog
- Input field for theme name (required)
- Validation: Name cannot be empty
- Enter key to submit
- Success toast notification

#### Import Theme Dialog
- File upload input (accepts .json files)
- Preview of JSON content (first 500 chars)
- Validation: Must be valid ThemeConfig JSON
- Error handling with detailed messages

#### Reset Theme Dialog
- Confirmation dialog before resetting
- Warning about losing unsaved changes

### State Management

**Local State:**
- `deviceMode`: Current device view (desktop/tablet/mobile)
- `showGrid`: Grid visibility toggle
- `scale`: Canvas zoom level (0.5-1.5)
- Dialog states (save, import, reset)

**Theme Store Integration:**
- `undo/redo`: History navigation
- `canUndo/canRedo`: History state checks
- `saveTheme`: Persist theme to localStorage
- `loadTheme`: Load saved theme by ID
- `exportTheme`: Generate JSON string
- `importTheme`: Parse and load JSON
- `resetTheme`: Reset to default
- `hasUnsavedChanges`: Track dirty state
- `selectElement`: Element selection
- `updateThemeProperty`: Live property updates

### Features

1. **Real-time Preview**: All changes reflect immediately in the canvas
2. **Unsaved Changes Warning**: Browser prompt before leaving with unsaved work
3. **Toast Notifications**: User feedback for all actions
4. **Responsive Design**: Adapts to different screen sizes
5. **Keyboard Navigation**: Full keyboard shortcut support
6. **Error Handling**: Graceful error handling with user-friendly messages
7. **Accessibility**: ARIA labels, keyboard navigation, focus management

## Usage

```typescript
import ThemeEditorPage from '@/app/settings/templates/page';

// Navigate to /settings/templates to access the editor
```

## Dependencies

- `@radix-ui/react-toggle-group`: For device mode selector
- `@radix-ui/react-dialog`: For modals
- `@radix-ui/react-dropdown-menu`: For theme selector
- `zustand`: State management (theme store)
- `lucide-react`: Icons
- Shadcn UI components: Button, Slider, Input, Label, ScrollArea, Tabs

## File Structure

```
frontend/
├── components/theme-editor/
│   ├── editor-canvas.tsx        # Canvas with live preview
│   ├── sidebar-tree.tsx         # Element tree panel
│   ├── properties-panel.tsx     # Properties editor
│   └── README.md                # This file
├── app/settings/templates/
│   └── page.tsx                 # Main integration page
├── stores/
│   └── themeStore.ts            # Theme state management
└── components/ui/
    └── toggle-group.tsx         # Custom toggle group component
```

## Technical Notes

- Uses TypeScript with strict mode
- 'use client' directive for all components (client-side rendering)
- Follows Next.js 16 App Router patterns
- Integrated with existing theme system
- Supports HSL color format for theme consistency
- Grid overlay uses CSS background patterns
- Device previews use responsive max-widths
