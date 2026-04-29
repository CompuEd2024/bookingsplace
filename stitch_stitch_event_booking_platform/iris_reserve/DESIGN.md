# Design System Documentation

## 1. Overview & Creative North Star: "The Luminous Concierge"

This design system is built to transcend the transactional nature of event booking. Our Creative North Star is **"The Luminous Concierge"**—an editorial-inspired framework that prioritizes breathability, light-play, and sophisticated curation. 

Instead of a rigid, boxed-in interface, we utilize intentional asymmetry and layered transparency to guide the user. We move away from the "template" look by treating the screen as a gallery space. Elements don't just sit on a grid; they float, overlap, and breathe. By leveraging the Iris Purple (`primary`) against a high-key palette of off-whites and soft lavenders, we create a high-fidelity environment that feels both premium and effortless.

---

## 2. Colors: Tonal Depth & The No-Line Rule

The color palette is anchored by the depth of **Iris Purple (#5D3FD3)**. This is not just a brand mark; it is a functional tool for focus.

### The "No-Line" Rule
To maintain a high-end editorial feel, **1px solid borders are strictly prohibited** for sectioning or containment. Boundaries must be established through:
*   **Tonal Shifts:** Transitioning from `surface` to `surface-container-low` to define a new content area.
*   **White Space:** Using aggressive margins to separate thoughts rather than physical barriers.
*   **Soft Shadows:** Using the designated ambient shadow to lift cards from the background.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, physical layers.
*   **Background (`#fdf8ff`):** The base canvas.
*   **Surface-Container-Low:** Used for secondary sections or background "islands" that house groups of cards.
*   **Surface-Container-Lowest (`#ffffff`):** Reserved for primary cards or interactive elements to make them pop against the tinted background.
*   **Surface-Container-High/Highest:** Used for navigation bars or drawers that need to feel "closer" to the user.

### The Glass & Gradient Rule
For hero sections and primary CTAs, avoid flat color. Use a **Signature Texture**: a subtle linear gradient from `primary` (#451ebb) to `primary-container` (#5d3fd3) at a 135-degree angle. Floating elements (like navigation overlays) should utilize **Glassmorphism**: apply `surface` colors at 80% opacity with a `20px` backdrop-blur to allow the vibrant brand colors to bleed through softly.

---

## 3. Typography: Editorial Authority

The system utilizes **Inter** for English and **Cairo** for Arabic. The hierarchy is designed to feel like a high-end magazine.

*   **Display & Headlines:** Use `display-lg` and `headline-lg` with tight letter-spacing (-0.02em) to create an authoritative, "branded" look for event titles and hero headers.
*   **Title Scale:** `title-lg` and `title-md` act as the primary anchors for card titles and section headers.
*   **Body Text:** `body-lg` is the workhorse. We prioritize line height (1.5x) to ensure the "Clean White Space" mandate is met even within dense text.
*   **Labels:** `label-md` should be used sparingly, often in all-caps with increased letter-spacing (+0.05em) for category tags or metadata.

---

## 4. Elevation & Depth: The Layering Principle

We convey hierarchy through **Tonal Layering** rather than traditional structural lines.

*   **Ambient Shadows:** For floating cards, use the signature shadow: `0 10px 30px rgba(0,0,0,0.05)`. To enhance this, ensure the shadow color is slightly tinted with the `on-surface` hue to prevent a "dirty" grey look.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in high-contrast modes), use the `outline-variant` token at **15% opacity**. Never use 100% opaque lines.
*   **Depth through Blur:** Use `surface-tint` overlays with backdrop filters to create a sense of height. When a modal opens, the background should not just darken, but blur significantly (8px-12px) to keep the focus on the "Luminous" top layer.

---

## 5. Components

### Buttons
*   **Primary:** Uses the Iris Gradient (Primary to Primary-Container). Roundedness set to `full` for a modern, approachable feel.
*   **Secondary:** `surface-container-high` background with `on-secondary-container` text. No border.
*   **Tertiary:** Ghost style. No background/border. Uses `primary` text weight `600`.

### Cards & Lists
*   **Cards:** Must use `surface-container-lowest` (#ffffff) on top of `background` (#fdf8ff).
*   **No Dividers:** Lists must never use horizontal lines. Separate list items using `8px` to `16px` of vertical white space or by alternating very subtle background tints (`surface` vs `surface-container-low`).

### Input Fields
*   **Soft Focus:** Inputs use `surface-container-low` as a base. Upon focus, they transition to a `1px` "Ghost Border" of `primary` and a soft glow using the signature shadow.
*   **Roundedness:** All inputs follow the `md` (0.75rem) scale for a soft, modern touch.

### Special Event Components
*   **Booking Stepper:** A horizontal "progress glow"—a thin `primary` line with a `10px` blur-glow underneath it.
*   **Availability Chips:** Use `tertiary-container` for "Limited Spots" to provide a sophisticated, warm warning color that isn't as aggressive as standard red.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts (e.g., a headline offset to the left with an image overlapping the right margin).
*   **Do** favor `surface-container` shifts over shadows for 90% of the UI. Save shadows for the most important "Actionable" cards.
*   **Do** ensure Cairo (Arabic) line-heights are 20% taller than Inter (English) to account for script descenders.

### Don’t:
*   **Don’t** use pure black (#000000). Use `on-surface` (#1c1a23) for all high-contrast text.
*   **Don’t** place a card on a background of the same color. There must always be a tonal step-up or step-down.
*   **Don’t** use standard "Material Blue" or "Success Green." Stick to the refined `primary`, `secondary`, and `tertiary` tokens provided to maintain the signature aesthetic.