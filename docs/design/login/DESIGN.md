```markdown
# Design System Document: The Culinary Editorial

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Sensory Sommelier."** This is not a standard utility-first interface; it is a digital translation of high-end hospitality. We move beyond the "template" look by treating the screen like a premium editorial spread—think heavy-stock paper, copper-leaf detailing, and the soft glow of a professional hearth.

To achieve this, the design system rejects rigid, boxed-in layouts in favor of **Intentional Asymmetry** and **Tonal Depth**. Elements should breathe; white space is not "empty," it is "luxury." We use overlapping images and typography to create a sense of tactile layering, moving away from flat, centered web patterns toward a curated, boutique experience.

## 2. Colors & Surface Philosophy
The palette is a sophisticated blend of heat and cream, designed to evoke the warmth of a kitchen and the precision of copper tools.

### The "No-Line" Rule
**Traditional 1px solid borders are strictly prohibited.** Boundaries between sections must be defined solely through background color shifts or subtle tonal transitions. For example, a `surface-container-low` section should sit against a `surface` background to define its territory. This creates a "soft" interface that feels organic rather than mechanical.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use the Material "Surface Container" tiers to create depth through nesting:
*   **Base:** `surface` (#fff8ef) — The primary canvas.
*   **Submerged:** `surface-container-lowest` (#ffffff) — Used for high-contrast "pop-out" cards.
*   **Elevated:** `surface-container-high` (#efe7d9) — Used for secondary sidebars or inset content.

### The "Glass & Gradient" Rule
To add "soul" to the digital interface:
*   **CTAs & Heroes:** Use subtle linear gradients from `primary` (#9d3f00) to `primary-container` (#be561a) at a 135-degree angle. This mimics the way light hits polished copper.
*   **Floating Elements:** Use Glassmorphism. Apply `surface` at 70% opacity with a `24px` backdrop blur. This allows the warmth of the background to bleed through, softening the overall aesthetic.

## 3. Typography
Our typography pairing balances heritage with modern precision.

*   **Display & Headline (Noto Serif):** These are our "Statement" pieces. Use `display-lg` and `headline-md` for editorial titles. The serif evokes the history of culinary arts and fine dining menus.
*   **Body & Title (Manrope):** Our "Workhorse." Manrope provides a clean, modern contrast to the serif. It ensures that recipe instructions and technical details remain hyper-legible and professional.
*   **Label (Manrope):** Used for metadata (e.g., "Prep Time"). These should always be in `on-surface-variant` (#594238) to keep them secondary to the content.

## 4. Elevation & Depth
In this system, depth is a feeling, not a shadow.

*   **The Layering Principle:** Avoid shadows for standard cards. Instead, place a `surface-container-lowest` card on a `surface-container-low` background. The subtle shift in "creaminess" provides enough visual distinction for the eye.
*   **Ambient Shadows:** If a floating element (like a modal or FAB) is required, use a "Hearth Shadow": `0px 20px 40px rgba(30, 27, 19, 0.06)`. This uses a tinted version of `on-surface` rather than grey, mimicking natural, warm ambient light.
*   **The "Ghost Border" Fallback:** If accessibility requires a container edge, use a "Ghost Border": `outline-variant` (#e0c0b2) at **15% opacity**. Never use a 100% opaque border.

## 5. Components

### Buttons
*   **Primary:** A gradient of `primary` to `primary-container`. Corner radius: `xl` (1.5rem). No border. Label: `on-primary` (#ffffff).
*   **Secondary:** `surface-container-highest` background with `primary` text. This feels integrated into the page.
*   **Tertiary:** Text-only in `primary`, using a `0.25rem` bottom-aligned copper accent bar on hover.

### Input Fields
*   **The Editorial Style:** Forgo the four-sided box. Use a "Soft Underline" approach: a `surface-container` background with a slightly thicker `outline` (#8c7166) on the bottom edge only.
*   **Corner Radius:** `md` (0.75rem) on the top corners to maintain the "organic" vibe.

### Cards & Lists
*   **Forbid Dividers:** Never use a horizontal line to separate list items. Use vertical white space from the Spacing Scale (minimum `2rem`) or alternating backgrounds between `surface` and `surface-container-low`.
*   **Image Treatment:** Images in cards should use `lg` (1rem) corner radius and, where possible, break the container's grid (e.g., a dish bleeding off the edge of a card).

### Featured Recipe Chips
*   **Style:** `surface-container-lowest` background with a `sm` (0.25rem) radius. They should feel like small, hand-cut labels.

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical margins. A hero image might have a 10% left margin but a 0% right margin to create editorial energy.
*   **Do** use `on-surface-variant` for long-form body text to reduce eye strain against the creamy background.
*   **Do** lean into the `xl` (1.5rem) roundness for large containers to emphasize the "organic" kitchen feel.

### Don't:
*   **Don't** use pure black (#000000). Use `on-surface` (#1e1b13) for all "black" text to maintain the warm, high-end tonal range.
*   **Don't** stack more than three levels of surface containers. It breaks the "Physicality" rule and makes the UI feel cluttered.
*   **Don't** use standard "Material Design" blue for links. Use `secondary` (#8c4f10) or `primary`.

### Accessibility Note:
While we use soft contrast for layering, always ensure that text-to-background ratios for `body-md` and `label-md` meet WCAG AA standards using the `on-surface` and `primary` tokens. Color should never be the only indicator of a state change.```