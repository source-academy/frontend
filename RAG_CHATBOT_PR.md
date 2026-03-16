# PR: RAG Course Assistant Chatbot — Frontend

## Summary

Adds a floating chatbot widget to all Source Academy course pages that allows students to ask questions about course materials (lectures, tutorials, recitations, past-year exams). The widget appears as a draggable chat icon in the bottom-right corner of every academy page, similar to the existing SICP textbook bot but completely independent from it.

---

## New Features

### 1. Floating Chat Widget (`src/pages/academy/ragChatbot/RagChatbot.tsx`)
- Draggable floating icon using `react-draggable` (existing dependency)
- Fixed to bottom-right corner, can be dragged anywhere on screen
- Click to expand chat panel, click again to collapse
- Hover tooltip: "Course Assistant — Click me to ask about course materials"
- Uses Blueprint.js `chat` icon (blue circular button)
- Position clamping ensures the widget stays within viewport on resize
- Only visible to logged-in users (`useSession().isLoggedIn` check)

### 2. Chat Interface (`src/pages/academy/ragChatbot/RagChatBox.tsx`)
- Scrollable message list with user/assistant message bubbles
- Text input field with character counter (max 1000 chars)
- Send button + Reset button
- Enter key to send
- Loading state with "loading..." indicator
- Auto-scrolls to bottom on new messages
- Expand/shrink toggle button for larger chat area (400px → 700px width)
- Initial welcome message: "Hi! Ask me about lectures, tutorials, recitations, or past exams!"
- Error handling with friendly error message on failure

### 3. API Layer (`src/features/ragChat/api.ts`)
Two API functions communicating with the new backend endpoints:

| Function | Endpoint | Purpose |
|----------|----------|---------|
| `initRagChat(tokens)` | POST `/v2/rag_chat/` | Initialize or resume conversation |
| `sendRagMessage(tokens, message)` | POST `/v2/rag_chat/message` | Send a question to the RAG pipeline |

- Uses the existing `request()` helper from `RequestHelper.tsx`
- Authenticated via JWT tokens (same as all other Source Academy API calls)
- Returns same response format as existing chat: `{ conversationId, messages, maxContentSize }` and `{ conversationId, response }`

### 4. Global Mounting in Academy (`src/pages/academy/Academy.tsx`)
- `<RagChatbot />` component added alongside `<Outlet />` in the Academy layout
- Automatically appears on ALL course pages: assessments, playground, sourcecast, achievements, grading, etc.
- Persists across page navigation within a course (conversation state maintained in React state)
- Does not interfere with the SICP chatbot (which only appears on `/sicpjs` pages)

---

## Files Changed

### New Files
| File | Purpose |
|------|---------|
| `src/pages/academy/ragChatbot/RagChatbot.tsx` | Floating widget wrapper (draggable, expand/collapse) |
| `src/pages/academy/ragChatbot/RagChatBox.tsx` | Chat message area, input, send/reset |
| `src/features/ragChat/api.ts` | API calls to `/v2/rag_chat/` endpoints |
| `src/styles/RagChatbot.module.scss` | Styling for the widget and chat interface |

### Modified Files
| File | Change |
|------|--------|
| `src/pages/academy/Academy.tsx` | Added `import RagChatbot` and `<RagChatbot />` in the render |

### NOT Changed
- `src/pages/sicp/subcomponents/chatbot/` — SICP chatbot completely untouched
- `src/features/sicp/chatCompletion/` — SICP API layer unchanged
- `src/styles/Chatbot.module.scss` — SICP chatbot styles unchanged
- No changes to routing, navigation, or Redux store

---

## UI Design

```
┌─────────────────────────────────────────────┐
│  Source Academy (any course page)            │
│                                             │
│  [Normal page content: assessments,         │
│   playground, grading, etc.]                │
│                                             │
│                          ┌─────────────────┐│
│                          │ Course Assistant ││
│                          │                 ││
│                          │ 🤖 Hi! Ask me   ││
│                          │ about lectures...││
│                          │                 ││
│                          │ You: What was   ││
│                          │ on midterm 2023?││
│                          │                 ││
│                          │ 🤖 Based on the ││
│                          │ Midterm AY22/23 ││
│                          │ solutions...    ││
│                          │                 ││
│                          │ [input] [Send]  ││
│                          └─────────────────┘│
│                                        [💬] │
└─────────────────────────────────────────────┘
```

**Collapsed state**: Blue circular chat icon in bottom-right corner
**Expanded state**: 400×450px chat panel (or 700×80vh in expanded mode)

---

## Component Hierarchy

```
Academy.tsx
  ├── <Outlet />          (page content via react-router)
  └── <RagChatbot />      (floating widget)
        ├── <Draggable>
        │    ├── Bot icon button (AnchorButton + chat icon)
        │    ├── Tooltip (hover message)
        │    └── <RagChatBox />  (when expanded)
        │         ├── Expand/shrink button
        │         ├── "Course Assistant" header
        │         ├── Message list (scrollable)
        │         ├── Text input + character counter
        │         └── Send + Reset buttons
        └── (nothing when collapsed)
```

---

## Styling

- Blue theme (`#4a7fcb`) to visually distinguish from the SICP bot (which uses the SA logo)
- User messages: blue bubbles with white text
- Assistant messages: light gray bubbles with dark text
- Responsive: max-width/height constrained to viewport
- Smooth transitions on expand/collapse (0.2s ease)
- CSS Modules scoping (no global style leaks)

---

## Testing

- TypeScript compilation: `npx tsc --noEmit` passes with 0 errors
- No changes to existing components or tests
- SICP chatbot completely unaffected
- Manual testing: widget appears on course pages, sends messages, receives responses, persists across navigation
