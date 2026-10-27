# Moksh CAD — Premium AI + Human Collaboration Popup
## Production Integration & Deployment Guide

This guide details the architecture, design tokens, files, and step-by-step instructions for integrating the AI + Human Collaboration modal popup into the live [Moksh CAD website](https://www.mokshcad.com/).

---

### 1. File Structure in Repository

```
/Users/ashishpatel/popup/
├── index.html                   # Moksh CAD homepage with popup markup & scripts integrated
├── popup.css                    # Scoped, high-specificity styles & responsive rules
├── popup.js                     # Accessible JavaScript controller (timer, sessionStorage, focus trapping)
├── assets/
│   ├── mokshcad-logo.svg        # Official Moksh CAD vector logo
│   └── cad_ai_collaboration.jpg # High-resolution photorealistic engineering visual
└── MOKSH_CAD_POPUP_INTEGRATION_GUIDE.md
```

---

### 2. Design Specifications & Brand Alignment

| Token / Spec | Value | Rationale |
| :--- | :--- | :--- |
| **Modal Format** | Portrait 3D Card (`470px` width) | Modern portrait stage with 3D cursor tilt & depth |
| **Primary Brand Blue** | `#2868ad` (hover: `#1c528f`) | Official Moksh CAD corporate brand blue |
| **Headline Weight** | Semibold (`600`) | Clean, modern, and easily readable |
| **Typography** | `'Inter', ui-sans-serif, system-ui, sans-serif` | Clean B2B engineering typography |
| **Surface** | `#ffffff` with subtle depth | Conveys precision without clutter |
| **Background Backdrop** | `rgba(9, 22, 48, 0.52)` + `blur(10px)` | Focuses visitor attention while preserving page context |
| **Visual Art Direction** | CAD Engineer & Collaborative AI Cutout | Clean transparent subject cutout with blue arc & Moksh medallion |

---

### 3. Copy & Links

- **Eyebrow**: `HUMAN EXPERTISE · SMARTER TECHNOLOGY`
- **Headline**:
  ```
  AI SPEED.
  HUMAN PRECISION.
  ```
  *(Font weight: Semibold 600, with `AI SPEED.` in `#31a92f` green and `HUMAN PRECISION.` in `#2868ad` blue)*
- **Supporting Body**:
  > *Combine the power of AI with human expertise to simplify workflows, improve accuracy, and get more done.*
- **Primary CTA**: `Speak to our AI Expert →`  
  Target URL: `https://www.mokshcad.com/contact-us/`
- **Secondary CTA**: `Explore Our CAD Services` *(Styled in crisp black `#111827`)*  
  Target URL: `https://www.mokshcad.com/cad-2d-3d/`

---

### 4. Behavioral & Accessibility Features

1. **5-Second Auto-Trigger**: Counts down from initial page readiness and triggers smoothly.
2. **Session Storage (`sessionStorage`)**: Uses the key `moksh_ai_collaboration_popup_seen` so visitors only see the modal **once per browsing session**. Navigating across pages or refreshing does not re-trigger it.
3. **Multi-Method Dismissal**:
   - High-contrast upper-right circular close button.
   - Clicking the blurred backdrop outside the modal container.
   - Pressing the <kbd>Escape</kbd> keyboard key.
4. **Accessible Semantics**:
   - `role="dialog"`, `aria-modal="true"`, `aria-labelledby="mokshModalTitle"`, `aria-describedby="mokshModalDesc"`.
   - Complete focus trapping (<kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> cycles inside modal elements).
   - Restores focus to the triggering element upon closure.
5. **Body Scroll Lock**: Adds `moksh-modal-open` class to `<body>` preventing background page scrolling and interaction.
6. **Reduced Motion**: Disables transforms and animations when the user has `prefers-reduced-motion: reduce` enabled.

---

### 5. Production WordPress / Elementor Deployment Steps

#### Method A: Via Child Theme (`functions.php` or `footer.php`)
1. Upload `popup.css`, `popup.js`, and `assets/cad_ai_collaboration.jpg` to your theme directory (e.g. `wp-content/themes/mokshcad/popup/`).
2. Add the following to your child theme's `functions.php`:
```php
function moksh_enqueue_collaboration_popup() {
    if ( is_front_page() ) {
        wp_enqueue_style( 'moksh-popup-css', get_stylesheet_directory_uri() . '/popup/popup.css', array(), '1.0.0' );
        wp_enqueue_script( 'moksh-popup-js', get_stylesheet_directory_uri() . '/popup/popup.js', array(), '1.0.0', true );
    }
}
add_action( 'wp_enqueue_scripts', 'moksh_enqueue_collaboration_popup' );

function moksh_render_popup_markup() {
    if ( is_front_page() ) {
        ?>
        <!-- Paste the modal HTML block here -->
        <?php
    }
}
add_action( 'wp_footer', 'moksh_render_popup_markup' );
```

#### Method B: Via Elementor Theme Builder (Global Footer)
1. Open the **Header, Footer & Blocks Template** or **Elementor Theme Builder > Footer**.
2. Add an **HTML Widget** right before the closing footer container.
3. Paste `<link rel="stylesheet" href="...">`, the modal HTML, and `<script src="..."></script>`.

---

### 6. Developer Console Helpers
For staging and QA verification:
- `window.MokshPopup.show()`: Instantly opens the modal.
- `window.MokshPopup.close()`: Closes the modal.
- `window.MokshPopup.reset()`: Clears the `sessionStorage` token so the 5s timer will fire on the next page reload.
