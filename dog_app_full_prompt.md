# Full Development Prompt — PawLife: Dog Activity Tracker App

---

## INSTRUCTIONS TO AI

You are building a complete, production-ready mobile app called **"PawLife"** — a subscription-based dog activity tracker and health companion app. Build this as a **React Native (Expo)** app with a **Firebase backend** (Authentication, Firestore, Cloud Functions, Cloud Messaging). The app must be visually polished, emotionally engaging, and optimized for viral social sharing.

Follow every section below precisely. Do not skip any feature, screen, or logic described.

---

## 1. APP OVERVIEW

**App Name:** PawLife — Your Dog's Best Life, Tracked  
**Tagline:** "Every wag, walk, and woof — beautifully tracked."  
**Platform:** iOS and Android (React Native / Expo)  
**Backend:** Firebase (Auth, Firestore, Cloud Functions, Cloud Messaging for push notifications)  
**State Management:** Zustand or React Context  
**Navigation:** React Navigation (bottom tabs + stack navigators)  
**Styling:** Styled Components or NativeWind (Tailwind for React Native)  
**Notifications:** Firebase Cloud Messaging + expo-notifications  
**Social Sharing:** react-native-share + custom image generation via react-native-view-shot  
**Subscription:** RevenueCat for in-app purchases and subscription management  

---

## 2. COLOR PALETTE & DESIGN SYSTEM

Use a warm, friendly, emotionally appealing design language.

- **Primary Color:** #FF8C42 (warm orange — energy, happiness)
- **Secondary Color:** #4A90D9 (calm blue — trust, health)
- **Accent Color:** #6BCB77 (fresh green — nature, walks)
- **Background:** #FFF8F0 (warm cream)
- **Dark Text:** #2D2D2D
- **Light Text:** #8E8E93
- **Error/Alert:** #FF4D4D
- **Card Background:** #FFFFFF with soft shadow (elevation: 2, shadow opacity: 0.08)
- **Border Radius:** 16px for cards, 12px for buttons, 50% for avatars
- **Font:** Use system fonts — San Francisco on iOS, Roboto on Android. Headings bold, body regular.
- **Icons:** Use a consistent icon library like Phosphor Icons or Lucide Icons. Rounded, friendly style.
- **Illustrations:** Use simple, warm illustrations on onboarding screens (Lottie animations preferred).
- **Micro-interactions:** Add subtle haptic feedback on button presses, smooth transitions between screens, and celebratory confetti animation on milestone achievements.

---

## 3. APP ARCHITECTURE & DATA MODEL

### Firestore Collections:

```
users/
  {userId}/
    - email: string
    - displayName: string
    - photoURL: string
    - subscription: { plan: "free" | "premium", trialStartDate, expiryDate }
    - createdAt: timestamp
    
    dogs/
      {dogId}/
        - name: string
        - breed: string
        - photo: string (URL)
        - dateOfBirth: date
        - weight: number
        - gender: "male" | "female"
        - color: string
        - microchipId: string (optional)
        - allergies: string[] (optional)
        - createdAt: timestamp

        activities/
          {activityId}/
            - type: "walk" | "food" | "water" | "play" | "training" | "grooming" | "medicine" | "vet_visit" | "injection" | "custom"
            - timestamp: timestamp
            - duration: number (minutes, for walks/play)
            - distance: number (km, for walks)
            - notes: string
            - photo: string (optional URL)
            - sharedToSocial: boolean

        reminders/
          {reminderId}/
            - type: "food" | "water" | "walk" | "vet" | "injection" | "medicine" | "grooming" | "custom"
            - title: string
            - time: timestamp
            - repeatPattern: "once" | "daily" | "weekly" | "monthly" | "yearly"
            - enabled: boolean
            - quoteCategory: string

        vetAppointments/
          {appointmentId}/
            - vetName: string
            - clinicName: string
            - date: timestamp
            - reason: string
            - notes: string
            - reminderSet: boolean

        injections/
          {injectionId}/
            - vaccineName: string
            - dateGiven: date
            - nextDueDate: date
            - vetName: string
            - notes: string

        milestones/
          {milestoneId}/
            - type: string (e.g., "first_walk", "100_walks", "1_year_anniversary", "vaccination_complete", "weight_goal")
            - achievedAt: timestamp
            - shared: boolean
            - cardImageURL: string

challenges/
  {challengeId}/
    - title: string
    - description: string
    - type: "walk" | "hydration" | "training" | "community"
    - startDate: date
    - endDate: date
    - goal: number
    - participants: { userId: progress }[]

quotes/
  {quoteId}/
    - text: string
    - author: string
    - category: "motivation" | "love" | "health" | "funny" | "wisdom"
```

---

## 4. ONBOARDING FLOW (5 Screens)

Build a smooth, swipeable onboarding flow that appears only on first launch.

### Screen 1 — Welcome
- Lottie animation of a happy dog wagging its tail
- Title: "Welcome to PawLife 🐾"
- Subtitle: "The smartest way to keep your dog healthy, happy, and loved."
- Button: "Get Started"

### Screen 2 — Feature Highlight: Track Everything
- Illustration: Dog walking with owner, food bowl, water drop icons
- Title: "Track Every Moment"
- Subtitle: "Walks, meals, water, vet visits, injections — all in one place."
- Swipe or "Next" button

### Screen 3 — Feature Highlight: Smart Reminders
- Illustration: Phone with notification bubble showing a warm dog quote
- Title: "Never Miss a Thing"
- Subtitle: "Smart reminders with heartwarming quotes that make caring for your dog a joy."
- Swipe or "Next" button

### Screen 4 — Feature Highlight: Share & Celebrate
- Illustration: Instagram-style card showing a dog milestone achievement
- Title: "Celebrate & Share"
- Subtitle: "Beautiful milestone cards and weekly reports you'll actually want to share."
- Swipe or "Next" button

### Screen 5 — Sign Up / Start Trial
- Title: "Start Your Free 30-Day Trial"
- Subtitle: "Full access to every feature. Cancel anytime."
- Bullet points with checkmarks:
  - ✓ Unlimited dog profiles
  - ✓ AI health insights
  - ✓ Shareable milestone cards
  - ✓ Community challenges
  - ✓ Vet health passport
- Button: "Start Free Trial" (triggers sign-up with Google/Apple/Email)
- Small text below: "After trial: $4.99/month or $29.99/year. Cancel anytime."
- Link: "Continue with Free Plan" (limited features)

---

## 5. AUTHENTICATION

- Support: Email/Password, Google Sign-In, Apple Sign-In
- Use Firebase Authentication
- After sign-up, immediately route to "Add Your First Dog" screen
- Store user profile in Firestore upon creation

---

## 6. ADD DOG PROFILE SCREEN

After sign-up (and accessible later from settings), show a form:

- **Dog Photo:** Tap to upload from camera or gallery (circular avatar with camera icon overlay)
- **Name:** Text input
- **Breed:** Searchable dropdown with 300+ breeds (include "Mixed Breed" option)
- **Date of Birth:** Date picker (or "I don't know — estimate age" toggle)
- **Weight:** Number input with kg/lbs toggle
- **Gender:** Male / Female selector
- **Color:** Text input
- **Microchip ID:** Optional text input
- **Allergies:** Optional tags input (add multiple)
- Button: "Add [Dog Name] 🐾"
- Show a celebratory animation (confetti + paw prints) when dog is added
- If premium: allow adding unlimited dogs. If free: limit to 1 dog.

---

## 7. MAIN DASHBOARD (Home Screen)

The home screen is the heart of the app. It should feel warm, personal, and immediately useful.

### Top Section:
- Greeting: "Good morning, [User Name] 🌞" (time-based greeting)
- Dog selector: Horizontal scrollable avatar list if multiple dogs. Tapping switches the dashboard context to that dog.

### Current Dog Card:
- Large card with dog's photo, name, breed, age
- Quick stats row: Total walks this week | Meals today | Water today
- Health score badge (calculated from activity consistency — e.g., "🌟 92% — Great Week!")

### Today's Schedule:
- Timeline view showing today's reminders and completed activities
- Each item shows: icon, title, time, status (done/upcoming/missed)
- Tap to mark as done or log details

### Quick Action Buttons (Floating or Grid):
- 🚶 Log Walk
- 🍖 Log Food
- 💧 Log Water
- 🎾 Log Play
- 💊 Log Medicine
- ➕ Custom Activity

### Weekly Activity Chart:
- Small bar chart showing activity count per day for the current week
- Color-coded by activity type

### Milestone Teaser:
- If a milestone is close: "Luna is 3 walks away from her 100th walk! 🎉"
- Tapping opens the milestones section

---

## 8. ACTIVITY LOGGING SCREENS

When user taps any quick action button, open a bottom sheet or modal:

### Log Walk:
- Start/Stop timer with live duration counter
- Optional: GPS tracking for route and distance (use expo-location)
- Add notes text field
- Add photo button
- "Save Walk" button
- After saving: show share prompt — "Share Luna's walk?" with preview of shareable card

### Log Food:
- Meal type: Breakfast / Lunch / Dinner / Snack
- Food brand/type: Text input
- Portion: Small / Medium / Large or custom amount
- Notes
- Timestamp (auto-filled, editable)
- Save button

### Log Water:
- Amount: visual water bowl graphic that user can "fill" by tapping (small / medium / full)
- Timestamp
- Save button

### Log Play / Training / Grooming:
- Duration
- Type/description
- Notes
- Photo
- Save button

### Log Medicine / Injection:
- Medicine/vaccine name
- Dosage
- Administered by (self / vet)
- Next due date
- Notes
- Save button

**After every activity log:** Show a warm dog-lover quote at the bottom of the confirmation screen. Example: *"The world would be a nicer place if everyone had the ability to love as unconditionally as a dog." — M.K. Clinton*

---

## 9. REMINDERS SYSTEM

### Reminder Creation Screen:
- Reminder type (dropdown): Food, Water, Walk, Vet, Injection, Medicine, Grooming, Custom
- Title: Auto-filled based on type, editable
- Time: Time picker
- Repeat: Once / Daily / Weekly / Monthly / Yearly
- Dog: Select which dog (if multiple)
- Enable/Disable toggle
- Save button

### Notification Behavior:
- Use Firebase Cloud Messaging for push notifications
- Every notification includes:
  - The reminder title (e.g., "Time for Luna's evening walk! 🚶")
  - A random warm dog-lover quote from the quotes database
  - Example: *"Dogs are not our whole life, but they make our lives whole." — Roger Caras*
- Notification tap opens the relevant logging screen

### Pre-built Reminder Templates:
When a user adds a dog, suggest setting up these common reminders:
- Morning food (8:00 AM)
- Evening food (6:00 PM)
- Water check (every 3 hours)
- Morning walk (7:00 AM)
- Evening walk (5:30 PM)

---

## 10. VET APPOINTMENTS SCREEN

- Calendar view showing upcoming and past appointments
- Add appointment form:
  - Vet name
  - Clinic name
  - Date & time
  - Reason (checkup, vaccination, illness, surgery, dental, other)
  - Notes
  - Set reminder toggle (with time-before options: 1 day, 2 hours, 30 min)
- Appointment detail view with all info and option to add post-visit notes
- Export appointment history as part of Health Passport (premium)

---

## 11. INJECTION / VACCINATION TRACKER

- List view of all vaccinations given
- Each entry shows: vaccine name, date given, next due date, vet name
- Visual timeline showing vaccination history
- Overdue vaccinations highlighted in red with alert badge
- Auto-create reminder for next due date when logging an injection
- Common vaccine templates for quick logging:
  - Rabies
  - DHPP (Distemper, Hepatitis, Parainfluenza, Parvovirus)
  - Bordetella
  - Leptospirosis
  - Canine Influenza
  - Lyme Disease

---

## 12. MILESTONE SYSTEM & SHAREABLE CARDS

### Milestone Types (auto-detected):
- First walk logged
- 10th, 50th, 100th, 500th walk
- 7-day walk streak, 30-day walk streak
- 1-month, 6-month, 1-year app anniversary
- Adoption anniversary
- All vaccinations up to date
- Weight goal reached
- 100 activities logged
- First vet visit logged
- Birthday milestone

### Milestone Card Design:
When a milestone is achieved:
1. Show a full-screen celebration animation (confetti + paw prints + sound effect)
2. Generate a beautiful shareable card containing:
   - Dog's photo (circular, centered at top)
   - Dog's name in bold
   - Milestone title (e.g., "🏆 100 Walks Completed!")
   - A warm quote
   - Date achieved
   - PawLife branding (small logo + "Track your dog's best life — pawlife.app")
   - Visually stunning gradient background matching the app's color palette
3. Share buttons: Instagram Stories, Instagram Feed, Facebook, Twitter/X, WhatsApp, Copy Link, Save to Gallery
4. Use react-native-view-shot to capture the card as an image
5. Use react-native-share for native sharing

### CRITICAL FOR VIRALITY:
- The card MUST include the app name and website subtly so every share is free marketing
- Make the design so beautiful that users WANT to share it — this is the #1 viral mechanic
- Allow users to customize card background color/style (premium)

---

## 13. WEEKLY PAW REPORT

Every Sunday at 10:00 AM, generate and push a notification:

**"Luna's Weekly Paw Report is ready! 📊🐾"**

### Report Contents (visual, shareable):
- Dog's photo and name
- Week date range
- Stats summary:
  - Total walks: X (↑ or ↓ vs last week)
  - Total walk distance: X km
  - Total walk time: X hours
  - Meals logged: X/X
  - Water logs: X
  - Activities completed: X
- Health consistency score: X% (based on how consistently reminders were completed)
- Streak count: "12-day walk streak! 🔥"
- Best day of the week
- A motivational quote
- PawLife branding

### Share functionality:
- Same as milestone cards — beautiful image, one-tap share to all platforms
- This weekly report is the second major viral loop

---

## 14. COMMUNITY CHALLENGES (Premium)

### Challenge Feed Screen:
- List of active and upcoming challenges
- Each challenge card shows: title, description, duration, participants count, your progress
- Join button

### Challenge Types:
- "Walk-tober: 30 walks in 30 days"
- "Hydration Hero: Log water 5x daily for a week"
- "Training Pro: 7 training sessions in 7 days"
- "Pawfect Week: Complete all reminders for 7 days straight"

### Challenge Detail Screen:
- Progress bar showing your completion
- Leaderboard of top participants (anonymized or display name)
- Days remaining
- Share progress button (generates shareable progress card)

### On Challenge Completion:
- Special badge added to profile
- Celebratory milestone card generated
- Badge displayed on dog's profile card

---

## 15. BREED BUDDY — SOCIAL MATCHING (Premium)

### Concept:
Connect dog owners with the same breed in their area for playdates and advice.

### Screen:
- List of nearby users with the same breed (using approximate location — city level only, for privacy)
- Each card shows: User's display name, dog's name, dog's photo, breed, distance ("~2 miles away")
- "Wave 🐾" button to send interest
- If mutual wave: open in-app chat or show contact option

### Privacy:
- Location is city-level only, never precise
- Users must opt-in to Breed Buddy
- Can hide profile at any time

---

## 16. AI HEALTH INSIGHTS (Premium)

Use activity data patterns to surface smart insights. These can be rule-based (no AI API needed) or use a lightweight ML model.

### Example Insights:
- "Luna walked 30% less this week compared to her average. Everything okay?"
- "Great job! Luna's meal consistency is at 95% this month."
- "Golden Retrievers are prone to hip dysplasia. Regular walks help — and Luna's doing great!"
- "Luna hasn't had a vet checkup in 8 months. Time to schedule one?"
- "Luna's water intake seems low today. Make sure she's hydrated!"

### Display:
- Insights card on the home dashboard (1-2 per day, rotating)
- Weekly insights included in the Paw Report
- Breed-specific health tips in a dedicated section

---

## 17. HEALTH PASSPORT (Premium)

### Exportable PDF containing:
- Dog's photo, name, breed, DOB, weight, microchip ID
- Complete vaccination history with dates and vet names
- Allergy list
- Recent vet appointments and notes
- Weight history chart
- QR code linking to a web-viewable version (optional)

### Use Cases:
- Visiting a new vet
- Boarding or daycare check-in
- Traveling with your dog
- Emergency situations

### Design:
- Clean, professional PDF layout
- PawLife branding
- Generate using a PDF library (react-native-html-to-pdf or server-side generation)

---

## 18. DOG-LOVER QUOTES DATABASE

Store 200+ quotes in Firestore. Categorized for different notification types:

### Categories & Examples:

**Motivation:**
- "The world would be a nicer place if everyone had the ability to love as unconditionally as a dog." — M.K. Clinton
- "Dogs do speak, but only to those who know how to listen." — Orhan Pamuk

**Walk Time:**
- "An outside dog is a happier dog." — Cesar Millan
- "In every walk with nature, one receives far more than he seeks." — John Muir

**Meal Time:**
- "Happiness is a warm puppy with a full belly."
- "The way to a dog's heart is through their stomach — and back again."

**Health & Vet:**
- "A healthy dog is a happy dog, and a happy dog makes a happy home."
- "Taking care of your dog is taking care of your best friend."

**Love & Bond:**
- "Dogs are not our whole life, but they make our lives whole." — Roger Caras
- "The bond with a true dog is as lasting as the ties of this earth will ever be." — Konrad Lorenz

**Include at least 200 unique quotes across all categories.**

---

## 19. SOCIAL SHARING SYSTEM

### Shareable Content Types:
1. Activity completion cards (walk, play, training)
2. Milestone achievement cards
3. Weekly Paw Reports
4. Challenge progress/completion cards
5. Dog profile cards ("Meet Luna! 🐾")
6. Vaccination completion cards

### Sharing Flow:
1. After any shareable event, show a share preview screen
2. Display the generated card image
3. Offer customization (premium): background color, quote selection, sticker overlays
4. Share buttons: Instagram Stories, Instagram Feed, Facebook, Twitter/X, TikTok, WhatsApp, Snapchat, Copy Link, Save to Gallery
5. After sharing, show: "Thanks for sharing the love! 🐾"

### Technical Implementation:
- Use `react-native-view-shot` to capture card components as images
- Use `react-native-share` for native share sheet
- For Instagram Stories: use Instagram's native story sharing API
- Track shares in analytics to measure viral coefficient

### BRANDING ON EVERY SHARED IMAGE:
- Small PawLife logo in bottom corner
- "pawlife.app" text
- Optional: "Download PawLife — Free" text
- Keep branding subtle but visible — it must not feel like an ad, but must be present for organic growth

---

## 20. SUBSCRIPTION & PAYWALL

### Plans:

**Free Plan:**
- 1 dog profile
- Basic reminders (food, water, walk — max 5 reminders)
- Manual activity logging
- 3 milestone cards per month
- Basic weekly report (text only, not shareable)

**Premium Plan — $4.99/month or $29.99/year:**
- Unlimited dog profiles
- Unlimited smart reminders with custom scheduling
- AI health insights
- Unlimited shareable milestone cards with customization
- Full visual weekly Paw Report (shareable)
- Community challenges
- Breed buddy matching
- Vet health passport export
- Walk GPS tracking with route history
- Custom quote packs
- Priority support
- Ad-free experience

**Lifetime Plan — $79.99 (limited time launch offer):**
- All premium features forever

### Implementation:
- Use RevenueCat SDK for subscription management
- 10-day free trial for premium (all features unlocked)
- Soft paywall: When free user tries a premium feature, show a friendly modal explaining the feature with a "Start Free Trial" button — not a hard block
- Trial reminder notifications: Day 7 — "Your trial ends in 3 days. Keep all your premium features!" Day 9 — "Last day of your trial! Subscribe to keep tracking [Dog Name]'s best life."

---

## 21. SETTINGS SCREEN

- **Account:** Edit name, email, photo, password
- **My Dogs:** Manage dog profiles (add, edit, delete)
- **Subscription:** View current plan, manage subscription, restore purchases
- **Notifications:** Global toggle, per-reminder-type toggles, quiet hours setting
- **Units:** kg/lbs, km/miles
- **Theme:** Light / Dark mode
- **Breed Buddy:** Opt in/out, privacy settings
- **Data Export:** Export all dog data as CSV/JSON
- **Health Passport:** Generate and download
- **About:** App version, terms, privacy policy, credits
- **Support:** Contact email, FAQ link
- **Delete Account:** With confirmation dialog

---

## 22. NOTIFICATION SCHEDULE & LOGIC

### Types of Push Notifications:

| Trigger | Message Format | Quote Included |
|---|---|---|
| Food reminder | "Time for [Dog]'s [meal]! 🍖" | Yes |
| Water reminder | "[Dog] might be thirsty! 💧" | Yes |
| Walk reminder | "Time for [Dog]'s walk! 🚶" | Yes |
| Vet appointment (1 day before) | "[Dog] has a vet appointment tomorrow at [time] 🏥" | Yes |
| Injection due | "[Dog]'s [vaccine] is due soon! 💉" | Yes |
| Medicine reminder | "Time for [Dog]'s medicine 💊" | Yes |
| Missed activity | "Looks like [Dog] missed their [activity] today. There's still time! ❤️" | Yes |
| Milestone achieved | "🎉 [Dog] just hit a milestone! Tap to celebrate!" | No (card has quote) |
| Weekly report ready | "[Dog]'s Weekly Paw Report is ready! 📊" | Yes |
| Challenge update | "You're X% through [Challenge]! Keep going! 💪" | No |
| Trial ending (Day 25) | "Your free trial ends in 5 days ⏰" | No |
| Trial ending (Day 29) | "Last day of your trial! Don't lose your data 🐾" | No |

### Smart Notification Rules:
- Never send more than 6 notifications per day per user
- Respect quiet hours (default 10 PM – 7 AM, customizable)
- If user hasn't opened app in 3 days, send a gentle re-engagement: "We miss you — and so does [Dog]! 🐾"
- If user hasn't opened in 7 days: "[Dog]'s health tracking is paused. Come back and keep the streak alive!"
- After 14 days inactive: Reduce notification frequency to avoid being blocked

---

## 23. ANALYTICS & TRACKING

Integrate Firebase Analytics or Mixpanel to track:

- Daily/Weekly/Monthly active users
- Onboarding completion rate (per screen)
- Trial-to-paid conversion rate
- Feature usage frequency (which activities are logged most)
- Share rate (how many milestones/reports are shared)
- Viral coefficient (new users from shares)
- Retention: Day 1, Day 7, Day 30
- Churn rate
- Revenue metrics: MRR, ARPU, LTV

---

## 24. SCREENS SUMMARY (Navigation Map)

```
App
├── Onboarding (5 screens — first launch only)
├── Auth
│   ├── Sign In
│   ├── Sign Up
│   └── Forgot Password
├── Main (Bottom Tab Navigator)
│   ├── 🏠 Home (Dashboard)
│   ├── 📋 Activities (Activity log & history)
│   ├── ➕ Log Activity (Center FAB — opens action sheet)
│   ├── 🏆 Milestones & Challenges
│   └── 👤 Profile & Settings
├── Modals / Sheets
│   ├── Log Walk (with timer + GPS)
│   ├── Log Food
│   ├── Log Water
│   ├── Log Play / Training / Grooming
│   ├── Log Medicine / Injection
│   ├── Add Reminder
│   ├── Add Vet Appointment
│   ├── Share Card Preview
│   └── Subscription Paywall
├── Detail Screens
│   ├── Dog Profile
│   ├── Activity Detail
│   ├── Vet Appointment Detail
│   ├── Vaccination History
│   ├── Challenge Detail
│   ├── Breed Buddy Profile
│   ├── Weekly Paw Report
│   └── Health Passport Preview
└── Settings
    ├── Account
    ├── My Dogs
    ├── Subscription Management
    ├── Notifications
    ├── Units & Preferences
    ├── Data Export
    └── About & Support
```

---

## 25. TECHNICAL REQUIREMENTS

- **Offline Support:** Cache activities and reminders locally. Sync when online using Firestore offline persistence.
- **Image Storage:** Use Firebase Storage for dog photos and activity photos. Compress images client-side before upload.
- **Performance:** Lazy load screens. Paginate activity history (20 items per load). Cache dog profiles.
- **Accessibility:** Support VoiceOver/TalkBack. Minimum touch target 44x44pt. Sufficient color contrast.
- **Localization-Ready:** Extract all strings to a translation file. Default language: English. Structure for easy addition of Spanish, French, German, Portuguese, Japanese.
- **Deep Linking:** Support deep links for shared milestone cards that open the app or redirect to app store.
- **Error Handling:** Graceful error states with friendly dog illustrations. "Oops! Something went wrong. Even good dogs have bad days. 🐕"

---

## 26. LAUNCH CHECKLIST

- [ ] App Store screenshots (6.5" and 5.5" iPhone, Android phone + tablet)
- [ ] App Store description with keyword optimization (keywords: dog tracker, pet health, dog walk tracker, pet care app, dog reminder, pet activity log)
- [ ] Privacy policy and terms of service
- [ ] App Store review guidelines compliance
- [ ] TestFlight / Google Play internal testing
- [ ] Analytics dashboard setup
- [ ] Push notification testing across devices
- [ ] Subscription flow testing (purchase, restore, cancel)
- [ ] Social sharing testing on all platforms
- [ ] Performance profiling (< 2s cold start, 60fps scrolling)

---

## BUILD INSTRUCTIONS

Build this app step by step:
1. Set up the Expo project with all dependencies
2. Implement Firebase configuration and authentication
3. Build the onboarding flow
4. Build the Add Dog profile screen
5. Build the main dashboard
6. Implement activity logging screens
7. Build the reminder system with push notifications
8. Implement the vet appointment and injection tracker
9. Build the milestone detection and shareable card generation system
10. Implement the weekly Paw Report
11. Build the community challenges system
12. Implement the Breed Buddy feature
13. Add AI health insights
14. Build the health passport export
15. Implement the subscription paywall with RevenueCat
16. Add social sharing across all shareable content
17. Build the settings screen
18. Add analytics tracking
19. Test thoroughly on iOS and Android
20. Optimize performance and polish animations

Start building now. Deliver clean, well-commented, production-ready code.
