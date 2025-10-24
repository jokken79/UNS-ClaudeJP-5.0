# Dashboard Quick Start Guide

## 🚀 How to See the New Dashboard

### 1. Start the Application

**Windows:**
```bash
cd /home/user/UNS-ClaudeJP-4.2
scripts\START.bat
```

**Linux/macOS:**
```bash
cd /home/user/UNS-ClaudeJP-4.2
docker compose up -d
```

### 2. Access the Dashboard

1. Open your browser to: **http://localhost:3000**
2. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`
3. You'll be redirected to the **new dashboard** automatically!

---

## 🎨 What You'll See

### Dashboard Sections (Top to Bottom):

1. **Header Bar**
   - Date range display
   - Quick period filters (Week, Month, Quarter, Year)
   - Refresh, Export, and Print buttons

2. **Hero Section**
   - Personalized welcome message
   - Quick stats summary

3. **Quick Actions** (4 buttons)
   - Add Employee
   - View Timecards
   - Approve Candidates
   - Process Payroll

4. **Metrics Grid** (Bento-style)
   - Total Candidates (info theme)
   - **Employees Active (LARGE card, success theme)**
   - Factories Active
   - Timecards (compact)

5. **Trend Cards** (4 sparkline cards)
   - Employee Trend
   - Hours Worked Trend
   - Salary Trend
   - Candidates Trend

6. **Main Charts**
   - Large Stats Chart (with tabs: General, Employees, Salary)
   - Employee Status Donut Chart

7. **Secondary Charts**
   - Nationality Distribution Donut
   - Monthly Salary Bar Chart

8. **Activity & Alerts**
   - Recent Activity Timeline (left)
   - Upcoming Items/Alerts (right)

9. **Recent Candidates List**

---

## 🎯 Key Features to Try

### Interactive Elements:
- ✨ **Hover over cards** - They lift with shadow effect
- 📊 **Hover over chart lines/bars** - See detailed tooltips
- 🔄 **Click Refresh** - Watch the spinning icon and data reload
- 📅 **Click period buttons** - Change the time range (7D, 30D, 90D, 1A)
- 🔢 **Watch the numbers** - Animated counting when page loads

### Visual Effects:
- Cards appear with staggered animation
- Numbers count up from 0
- Chart lines "draw" onto the screen
- Bars "grow" from bottom
- Smooth hover and click feedback

### Theme Testing:
- 🌙 **Toggle Dark Mode** - All charts adapt
- 📱 **Resize Window** - Fully responsive (mobile, tablet, desktop)
- ♿ **Enable Reduced Motion** - Animations disable automatically

---

## 📊 Chart Interactions

### Stats Chart (Main Chart):
- **3 Tabs**: Click "General", "Empleados & Horas", or "Nómina"
- **Period Selector**: Change time range
- **Tooltip**: Hover over any data point

### Donut Charts:
- **Hover segments**: See percentage and value
- **Legend**: Click items in legend (future enhancement)
- **Center value**: Shows total count

### Trend Cards:
- **Sparkline**: Quick visual trend
- **Arrow indicator**: Up/down trend
- **Percentage**: Change vs previous period

---

## 🎨 Card Variants Demo

The dashboard shows all MetricCard variants:

| Card | Variant | Theme | Location |
|------|---------|-------|----------|
| Total Candidates | `default` | `info` | Top left |
| **Employees Active** | `large` | `success` | **Top center (spans 2 cols)** |
| Factories Active | `default` | `default` | Top right |
| Timecards | `compact` | `warning` | Bottom right |

---

## 🔧 Customization Examples

### Change Card Theme:
```tsx
// In /frontend-nextjs/app/(dashboard)/dashboard/page.tsx
<MetricCard
  theme="danger"  // Try: default, success, warning, danger, info
/>
```

### Change Chart Colors:
```tsx
// In chart components
series={[
  { dataKey: 'value', name: 'My Data', color: '#FF5733' }
]}
```

### Add Custom Data:
```tsx
// In /frontend-nextjs/lib/dashboard-data.ts
// Modify generateTimeSeriesData() function
```

---

## 🐛 Troubleshooting

### Dashboard Not Loading?
1. Check if containers are running: `docker ps`
2. Check frontend logs: `docker logs uns-claudejp-frontend`
3. Try hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
4. Clear browser cache and localStorage

### No Data Showing?
- The dashboard uses **mock data** by default
- Check console for errors: `F12` → Console tab
- Verify API is running: http://localhost:8000/api/health

### Animations Not Working?
- Check if browser supports CSS animations
- Check if reduced motion is enabled in OS
- Try different browser (Chrome, Firefox, Edge)

### Charts Not Rendering?
- Verify recharts library: `npm list recharts`
- Check browser console for errors
- Ensure JavaScript is enabled

---

## 📱 Responsive Breakpoints

### Mobile (< 640px):
- 1 column layout
- Stacked cards
- Simplified charts
- Compact spacing

### Tablet (640px - 1024px):
- 2 column grid
- Medium cards
- Full chart features
- Balanced layout

### Desktop (> 1024px):
- 4 column grid
- Bento layout
- Large charts
- Spacious design

---

## 🎯 Next Steps

### For Developers:
1. Review `/DASHBOARD_REDESIGN_COMPLETE.md` for full details
2. Check component files for inline documentation
3. Explore TypeScript types for customization
4. Read chart component props for options

### For Users:
1. Explore all sections of the dashboard
2. Try different period filters
3. Hover over charts for details
4. Use quick action buttons
5. Monitor recent activity and alerts

---

## 📚 File Locations

### Main Dashboard:
- `/frontend-nextjs/app/(dashboard)/dashboard/page.tsx`

### Components:
- `/frontend-nextjs/components/dashboard/metric-card.tsx`
- `/frontend-nextjs/components/dashboard/stats-chart.tsx`
- `/frontend-nextjs/components/dashboard/dashboard-header.tsx`

### Charts:
- `/frontend-nextjs/components/dashboard/charts/AreaChartCard.tsx`
- `/frontend-nextjs/components/dashboard/charts/BarChartCard.tsx`
- `/frontend-nextjs/components/dashboard/charts/DonutChartCard.tsx`
- `/frontend-nextjs/components/dashboard/charts/TrendCard.tsx`

### Data:
- `/frontend-nextjs/lib/dashboard-data.ts`
- `/frontend-nextjs/app/(dashboard)/dashboard/dashboard-context.tsx`

---

## 🎉 Enjoy Your New Dashboard!

The dashboard has been redesigned with modern best practices:
- ✅ Beautiful visualizations
- ✅ Smooth animations
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Accessible
- ✅ Production-ready

**Questions?** Check `/DASHBOARD_REDESIGN_COMPLETE.md` for comprehensive documentation!
