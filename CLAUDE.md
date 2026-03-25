# Save the Date — Design System

## Overview
This is a wedding save-the-date website for Elisa & Arden. The design language is **warm editorial** — elegant, intimate, and understated. Think luxury wedding stationery brought to life on screen.

---

## Fonts

| Role | Family | Weight | Style |
|------|--------|--------|-------|
| Display (SAVE, DATE, RSVP, day numbers) | Cormorant Garamond | 300 | Normal |
| Names & event titles (ELISA & ARDEN) | Cormorant Garamond | 600 | Normal, Uppercase |
| Labels (VENUE, SCHEDULE, date line) | Jost | 400 | Normal, Uppercase |
| Body / italic text / captions | Cormorant Garamond | 500 | Italic |
| Script accent ("the") | Great Vibes | 400 | Normal |

CSS variables:
```css
--font-serif:  'Cormorant Garamond', serif;
--font-sans:   'Jost', sans-serif;
--font-script: 'Great Vibes', cursive;
```

---

## Typography Classes

Use these existing classes — do not create new ones unless necessary.

| Class | Used for | Font | Size |
|-------|----------|------|------|
| `.t-display` | SAVE, DATE, RSVP, day headings | Serif 300 | `clamp(3.5rem, 13vw, 11rem)` |
| `.t-names` | ELISA & ARDEN, event titles | Serif 600 Uppercase | `clamp(1.6rem, 5.2vw, 3.6rem)` |
| `.t-label` | VENUE, SCHEDULE, date line, radio labels | Sans 400 Uppercase | `clamp(1rem, 2.6vw, 1.4rem)` |
| `.t-body` | Italic captions, location, body copy | Serif 500 Italic | `clamp(1rem, 2.4vw, 1.5rem)` |

---

## Colors

| Name | Hex | Used for |
|------|-----|----------|
| Brown (primary) | `#c8967a` | Display text, accents, buttons, borders |
| Brown dark | `#b07858` | Hover states, body italic text, labels |
| Black | `#1e1e1e` | Main text, venue name, event titles |
| Background | `#fdfbf9` | Page background, RSVP section |
| Border | `#d4b8a8` | Input borders, radio borders |
| Placeholder | `#c8b8b0` | Input placeholder text, inactive states |
| Inactive | `#e0d0c8` | Inactive radio borders |
| Error | `#c0504a` | Error messages, field highlights |

CSS variables:
```css
--color-brown:       #c8967a;
--color-brown-dark:  #b07858;
--color-black:       #1e1e1e;
--color-bg:          #fdfbf9;
--color-border:      #d4b8a8;
--color-placeholder: #c8b8b0;
--color-inactive:    #e0d0c8;
--color-pastel-red:  #c0504a;
```

---

## Spacing & Layout

- Page side padding (desktop): `4rem`
- Page side padding (mobile): `1.5rem`
- Section padding (RSVP): `4rem 15% 5rem` desktop, `3rem 1.5rem 4rem` mobile
- Itinerary padding: `0 15%`
- Hero card: full viewport height (`100svh`), content pinned to bottom via `justify-content: flex-end`

---

## Shadows & Radius

```css
--radius-sm:       4px;
--shadow-card:     0 4px 24px rgba(0, 0, 0, 0.18);
--shadow-dropdown: 0 4px 16px rgba(0, 0, 0, 0.10);
--focus-ring:      0 0 0 2px rgba(200, 150, 122, 0.15);
```

---

## Component Rules

### Buttons
- Background: `--color-brown`
- Hover: `--color-brown-dark`
- Text: `--color-bg` (off-white)
- Font: Jost 600, uppercase, `letter-spacing: 0.2em`
- Shape: `border-radius: 4px`, fixed width `16rem`, height `3rem`

### Form Fields
- Labels: `.t-body` style (Cormorant italic, `--color-brown-dark`)
- Inputs: Jost 400, uppercase, `--color-black`, border `0.75px solid --color-border`
- Focus: border becomes `1.5px solid --color-brown` + focus ring
- Error state: background `#fdf0ee`, border `--color-pastel-red`

### Radio Buttons
- Custom styled circles, `16px` diameter
- Selected: filled dot in `--color-brown`
- Inactive: label color `--color-placeholder`, border `--color-inactive`

---

## Sections

| Section | Background | Notes |
|---------|------------|-------|
| Hero (Save the Date) | Hero.webp image | Full viewport height, content bottom-aligned |
| Venue + Map | Balibackground.png | Absolutely positioned overlay content |
| Sunset (Day 1) | Sunset.png | Full-bleed with text overlay |
| Fountain (Day 2) | Fountain.png | Full-bleed with text overlay |
| RSVP | `--color-bg` (#fdfbf9) | Form section |

---

## Rules

- **Only modify the section you're asked to work on.** Do not add "improvements" or preventive fixes to other sections. If you're editing RSVP, don't touch the hero, venue, or itinerary.
- **Never override CSS with JS** unless there is a confirmed, reproducible bug. CSS viewport units (`svh`, `dvh`) work correctly — do not replace them with `window.innerHeight` or similar JS hacks.
- **Do not add code that "might help later."** Every addition must solve a specific, currently-broken problem.

---

## Tone & Copy Style
- Elegant, warm, personal
- Mix of uppercase labels and italic serif body text
- Example radio labels: "Joyfully accepts", "Regretfully declines", "Bringing a guest", "Attending solo"
- Error messages are warm, not clinical: *"We couldn't find your name on the guest list. Please check your entry."*
