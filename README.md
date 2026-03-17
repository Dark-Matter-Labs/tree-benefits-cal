## Community Canopy Benefits Tool – Workshop Prototype

This is a lightweight Next.js prototype used to demonstrate the **Community Canopy Benefits Tool** concept in a workshop setting. It focuses on the **simulation flow for municipalities** and a **portfolio-style overview for FCM**, not on final calculation methodology.

### What’s Included

- **Municipal “Simulation Mode”**
  - Multi-step input flow (context, trees, benefit categories)
  - Simplified Canadian-style benefit engine (carbon, stormwater, health, heat, property value)
  - Per-capita and per-household views to highlight **small municipality impact**
  - Basic **EN/FR** toggle for main labels
  - Print/export-friendly summary section (use browser print to save as PDF)

- **FCM Portfolio Demo View**
  - Mock portfolio metrics (projects, trees, carbon, stormwater)
  - Symbolic regional distribution chart
  - Scrollable list of demo projects for storytelling about aggregation and equity

### Tech Stack

- Next.js 14 (app router)
- React 18
- TypeScript
- Tailwind CSS for rapid UI styling

### Running the App

From `/Users/gurden/Documents/code/tree-benefits-cal`:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

### Workshop Talking Points

- This prototype uses **simplified coefficients** – the production tool would plug in:
  - NRCan-aligned GHG methods
  - Peer-reviewed, species-specific equations
  - Regularly updated regional datasets (census, climate, stormwater)
- Show how:
  - Municipalities can quickly get **grant-ready visuals** with minimal data.
  - FCM could aggregate impacts nationally (and feed **PowerBI** dashboards).
  - Per-capita / per-household metrics help avoid undervaluing **small projects**.

### Next Steps for a Full Build

- Replace placeholder coefficients with real, peer-reviewed Canadian data.
- Wire up project and portfolio data to FCM’s existing systems (e.g., PowerBI feeds).
- Extend i18n for full bilingual content (English/French).
- Add scenarios (turf vs. trees, pre/post restoration) and richer reporting.

