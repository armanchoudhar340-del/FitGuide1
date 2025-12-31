# FitGuide App - Testing & Bug Fixing Plan

## Issues Identified:

### 1. **Critical: API Key Environment Variable Issue**
- **File**: `services/geminiService.ts`
- **Problem**: Using `process.env.API_KEY` which won't work in browser (Vite)
- **Impact**: AI features completely broken
- **Fix**: Use `import.meta.env.VITE_API_KEY` instead

### 2. **Equipment Substitution Logic Missing**
- **File**: `constants.ts`
- **Problem**: Exercises reference replacements but no actual replacement exercises defined
- **Impact**: When equipment not available, no fallback exercises shown
- **Fix**: Add proper replacement exercises for gym machines

### 3. **Profile Page Navigation Bug**
- **File**: `App.tsx` line 76-77
- **Problem**: `case 'profile':` calls `setIsSettingUp(true)` but returns `null`
- **Impact**: Profile page doesn't render properly
- **Fix**: Navigate to onboarding with user data pre-filled

### 4. **Timer Component State Issues**
- **File**: `WorkoutView.tsx` WorkoutTimer component
- **Problem**: Timer might not clear intervals properly, potential memory leaks
- **Impact**: Performance issues, multiple timers running
- **Fix**: Proper cleanup and state management

### 5. **Form Validation Issues**
- **File**: `Onboarding.tsx`
- **Problem**: Limited input validation, could lead to invalid data
- **Impact**: User could save incomplete/invalid profiles
- **Fix**: Add proper validation for all form fields

### 6. **Mobile Navigation Overlay**
- **File**: `Layout.tsx`
- **Problem**: Mobile nav might not handle content overflow properly
- **Impact**: Poor mobile experience
- **Fix**: Better responsive design for mobile nav

### 7. **Error Handling Missing**
- **File**: Multiple components
- **Problem**: Limited error boundaries and error handling
- **Impact**: App crashes on network issues or invalid data
- **Fix**: Add error boundaries and try-catch blocks

### 8. **Memory Leaks in useEffect**
- **File**: Multiple components with async operations
- **Problem**: Some useEffect cleanup functions might not be properly implemented
- **Impact**: Memory leaks over time
- **Fix**: Ensure all async operations are properly cleaned up

### 9. **Missing Loading States**
- **File**: `Dashboard.tsx`
- **Problem**: BMI calculation doesn't show loading state during user profile updates
- **Impact**: Poor user experience
- **Fix**: Add loading states for async operations

### 10. **Type Safety Issues**
- **File**: Multiple components
- **Problem**: Some type assertions might be unsafe
- **Impact**: Potential runtime errors
- **Fix**: Improve type safety throughout the app

## Testing Steps:

1. Test user onboarding flow
2. Test all navigation between pages
3. Test workout filtering and exercise selection
4. Test AI features (requires API key setup)
5. Test mobile responsiveness
6. Test timer functionality
7. Test form validation
8. Test equipment substitution logic
9. Test error handling scenarios
10. Test performance and memory usage

## Priority Fixes:
1. API Key Environment Variable (Critical)
2. Profile Page Navigation (High)
3. Equipment Substitution Logic (High)
4. Timer Component (Medium)
5. Form Validation (Medium)
6. Error Handling (Medium)
7. Mobile Responsiveness (Low)
8. Performance Optimizations (Low)
