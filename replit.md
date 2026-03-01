# S.T. Progress (S.T. ก้าวหน้า)

Digital Student Council System for schools in Thailand.

## Optimization Notes
- **Firestore Persistence**: Enabled offline persistence in `js/data.js` to allow the app to load data from local cache first, significantly improving page transition speed.
- **In-Memory Caching**: Implemented a simple cache for `getUserData` and `getAnnouncements` to reduce redundant network requests during a single session.

## Structure
- `index.html`: Dashboard
- `js/data.js`: Core Firebase logic and optimization
- `js/firebase-config.js`: Configuration
- `admin-*.html`: Administrative tools
