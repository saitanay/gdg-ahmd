# Smart Notes App: Adding Chrome AI Features

This workshop will guide you through adding AI-powered features to a note-taking app using Chrome's built-in AI APIs.

## Prerequisites

- Basic knowledge of React and JavaScript
- Chrome browser (version 131+ recommended)
- Node.js and npm installed
- A code editor
- Experimental flags enabled on your browser + good hardware on laptop (Check [https://browser-check.x2u.in/](https://browser-check.x2u.in/) to verify your browser is ready)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/saitanay/gdg-ahmd-smart-notes
cd gdg-ahmd-smart-notes
```

### 2. Open the Base App

```bash
cd note-app-base
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

The app will start on `http://localhost:5173` (or another port if 5173 is busy).

### 5. Enable Chrome AI Features

Before we begin coding, we need to enable Chrome's experimental AI features:

1. Open Chrome and navigate to `chrome://flags`
2. Search for and enable the following flags:
   - **Prompt API for Gemini Nano**
   - **Summarization API for Gemini Nano**
   - **Writer API for Gemini Nano**
   - **Rewriter API for Gemini Nano**
   - **Proofreader API for Gemini Nano**
3. **Restart Chrome** after enabling the flags

**Note:** These APIs require Chrome to be running on supported hardware. If an API shows as "unavailable," check Chrome's hardware requirements.

---

## Step-by-Step Implementation

Follow these steps to add AI features to your note-taking app.

### Step 1: Create the AI Utility Library (Writer API)

**See Slide 19**

**CREATE a new file: `src/lib/ai.js`**

Copy and paste this complete code:

```javascript
// Checks if all required AI APIs are available
export function isAIAvailable() {
  return typeof window !== 'undefined' && ('Summarizer' in window && 'Proofreader' in window && 'Rewriter' in window && 'LanguageModel' in window && 'Writer' in window);
}

// Wrapper for the Writer API
export async function generateBody(title) {
  if (!('Writer' in window)) throw new Error('Writer API not supported.');
  
  const options = {
    format: 'plain-text',
  };
  
  const availability = await window.Writer.availability();
  if (availability === 'unavailable') throw new Error('Writer not available.');
  
  let writer;
  if (availability === 'available') {
    writer = await window.Writer.create(options);
  } else if (availability === 'downloadable') {
    if (!navigator.userActivation.isActive) {
      throw new Error('User activation required to download model.');
    }
    writer = await window.Writer.create(options);
  }
  
  const prompt = `Write a short note about: ${title}. Give plain-text only. Don't use markdown.`;
  const result = await writer.write(prompt);
  writer.destroy();
  return result;
}
```

---

### Step 2: Integrate Writer into the App

**See Slide 20**

**OPEN the existing file: `src/App.jsx`**

**Step 2.1: INSERT these imports at the top of the file (after existing imports):**

```javascript
import { isAIAvailable, generateBody } from './lib/ai';
import AIWarning from './components/AIWarning'; // We will create this next
```

**Step 2.2: INSERT these state variables inside the App function (after existing state):**

```javascript
const [loading, setLoading] = useState(false);
const [aiAvailable, setAiAvailable] = useState(false);
```

**Step 2.3: REPLACE the existing useEffect with this updated version:**

```javascript
useEffect(() => {
  setAiAvailable(isAIAvailable());
  loadNotes();
}, []);
```

**Step 2.4: INSERT this handler function inside the App function (before the return statement):**

```javascript
async function handleGenerateBody() {
  if (!currentNote.title) return;
  setLoading(true);
  try {
    const content = await generateBody(currentNote.title);
    setCurrentNote({ ...currentNote, content });
  } catch (error) {
    alert(error.message);
  }
  setLoading(false);
}
```

**Step 2.5: REPLACE the existing action-bar div with this complete version:**

```javascript
<div className="action-bar">
  <button className="button button-primary" onClick={handleSave}>
    Save
  </button>
  {aiAvailable && (
    <button className="button" onClick={handleGenerateBody} disabled={loading || !currentNote.title}>
      {loading ? 'Writing...' : 'Write For Me'}
    </button>
  )}
</div>
{!aiAvailable && <AIWarning />}
```

---

### Step 3: Create the AIWarning Component

**See Slide 21**

**CREATE a new file: `src/components/AIWarning.jsx`**

Copy and paste this complete code:

```javascript
function AIWarning() {
  return (
    <div className="ai-warning">
      <strong>Enable Chrome AI flags:</strong> Go to chrome://flags and enable 
      "Prompt API for Gemini Nano", "Summarization API for Gemini Nano", 
      "Writer API for Gemini Nano", "Rewriter API for Gemini Nano", and 
      "Proofreader API for Gemini Nano", then restart Chrome.
    </div>
  );
}
export default AIWarning;
```

---

### Step 4: Add the Summarize Wrapper

**See Slide 23**

**OPEN the existing file: `src/lib/ai.js`**

**ADD this function at the end of the file:**

```javascript
// Wrapper for the Summarizer API
export async function summarize(text) {
  if (!('Summarizer' in window)) throw new Error('Summarizer API not supported.');
  
  const availability = await window.Summarizer.availability();
  if (availability === 'unavailable') throw new Error('Summarizer not available.');
  if (availability === 'downloadable' && !navigator.userActivation.isActive) {
    throw new Error('User activation required to download model.');
  }
  
  const summarizer = await window.Summarizer.create();
  return await summarizer.summarize(text);
}
```

---

### Step 5: Integrate Summarize into the App

**See Slide 24**

**OPEN the existing file: `src/App.jsx`**

**Step 5.1: UPDATE the import line to include `summarize`:**

```javascript
import { isAIAvailable, generateBody, summarize } from './lib/ai';
```

**Step 5.2: INSERT this handler function inside the App function (after `handleGenerateBody`):**

```javascript
async function handleSummarize() {
  if (!currentNote.content) return;
  setLoading(true);
  try {
    const summary = await summarize(currentNote.content);
    setCurrentNote({ ...currentNote, content: summary });
  } catch (error) {
    alert(error.message);
  }
  setLoading(false);
}
```

**Step 5.3: REPLACE the action-bar div with this updated version:**

```javascript
<div className="action-bar">
  <button className="button button-primary" onClick={handleSave}>
    Save
  </button>
  {aiAvailable && (
    <>
      <button className="button" onClick={handleGenerateBody} disabled={loading || !currentNote.title}>
        {loading ? 'Writing...' : 'Write For Me'}
      </button>
      <button className="button" onClick={handleSummarize} disabled={loading || !currentNote.content}>
        {loading ? 'Summarizing...' : 'Summarize'}
      </button>
    </>
  )}
</div>
{!aiAvailable && <AIWarning />}
```

---

### Step 6: Add Remaining AI Wrappers

**See Slide 27**

**OPEN the existing file: `src/lib/ai.js`**

**ADD these three functions at the end of the file:**

```javascript
export async function proofread(text) {
  if (!('Proofreader' in window)) throw new Error('Proofreader API not supported.');
  
  const availability = await window.Proofreader.availability();
  if (availability === 'unavailable') throw new Error('Proofreader not available.');
  if (availability === 'downloadable' && !navigator.userActivation.isActive) {
    throw new Error('User activation required to download model.');
  }
  
  const proofreader = await window.Proofreader.create();
  const result = await proofreader.proofread(text);
  let correctedText = result.correctedInput;
  // Remove "PROOFREAD_TEXT: " prefix if present
  if (correctedText.startsWith('PROOFREAD_TEXT: ')) {
    correctedText = correctedText.substring('PROOFREAD_TEXT: '.length);
  }
  return correctedText;
}

export async function rewrite(text) {
  if (!('Rewriter' in window)) throw new Error('Rewriter API not supported.');
  
  const availability = await window.Rewriter.availability();
  if (availability === 'unavailable') throw new Error('Rewriter not available.');
  if (availability === 'downloadable' && !navigator.userActivation.isActive) {
    throw new Error('User activation required to download model.');
  }
  
  const rewriter = await window.Rewriter.create();
  return await rewriter.rewrite(text, {}); // Passing empty options for default rewrite
}

export async function generateTitle(text) {
  if (!('LanguageModel' in window)) throw new Error('LanguageModel API not supported.');
  
  const availability = await window.LanguageModel.availability();
  if (availability === 'unavailable') throw new Error('LanguageModel not available.');
  if (availability === 'downloadable' && !navigator.userActivation.isActive) {
    throw new Error('User activation required to download model.');
  }
  
  const session = await window.LanguageModel.create();
  const prompt = `Generate a concise title (maximum 5-7 words) for the following note content. Return only the title, nothing else:\n\n${text}`;
  const result = await session.prompt(prompt);
  session.destroy();
  return result.trim();
}
```

---

### Step 7: Create the AIActions Component

**See Slide 28**

**CREATE a new file: `src/components/AIActions.jsx`**

Copy and paste this complete code:

```javascript
function AIActions({ aiAvailable, loading, hasContent, hasTitle, onAIAction }) {
  if (!aiAvailable) return null;

  const buttons = [
    { action: 'generateTitle', label: 'Generate Title', requiresContent: true },
    { action: 'generateBody', label: 'Write For Me', requiresTitle: true },
    { action: 'summarize', label: 'Summarize', requiresContent: true },
    { action: 'proofread', label: 'Proofread', requiresContent: true },
    { action: 'rewrite', label: 'Rewrite', requiresContent: true },
  ];

  return (
    <div className="ai-actions">
      {buttons.map(({ action, label, requiresContent, requiresTitle }) => (
        <button 
          key={action} 
          className="button button-ai"
          onClick={() => onAIAction(action)} 
          disabled={loading || (requiresContent && !hasContent) || (requiresTitle && !hasTitle)}
        >
          {loading ? '...' : label}
        </button>
      ))}
    </div>
  );
}
export default AIActions;
```

---

### Step 8: Final Integration in App.jsx

**See Slide 29**

**OPEN the existing file: `src/App.jsx`**

**Step 8.1: REPLACE the import line with this updated version:**

```javascript
import { isAIAvailable, summarize, proofread, rewrite, generateTitle, generateBody } from './lib/ai';
import AIActions from './components/AIActions';
```

**Step 8.2: REPLACE the `handleGenerateBody` and `handleSummarize` functions with this complete `handleAI` function:**

```javascript
async function handleAI(action) {
  setLoading(true);
  try {
    const aiActions = {
      generateTitle: async () => {
        if (!currentNote.content) {
          alert('Please provide content for this action.');
          return null;
        }
        const result = await generateTitle(currentNote.content);
        return result ? { title: result } : null;
      },
      generateBody: async () => {
        if (!currentNote.title) {
          alert('Please provide a title to generate content.');
          return null;
        }
        const result = await generateBody(currentNote.title);
        return result ? { content: result } : null;
      },
      summarize: async () => {
        if (!currentNote.content) {
          alert('Please provide content for this action.');
          return null;
        }
        const result = await summarize(currentNote.content);
        return result ? { content: result } : null;
      },
      proofread: async () => {
        if (!currentNote.content) {
          alert('Please provide content for this action.');
          return null;
        }
        const result = await proofread(currentNote.content);
        return result ? { content: result } : null;
      },
      rewrite: async () => {
        if (!currentNote.content) {
          alert('Please provide content for this action.');
          return null;
        }
        const result = await rewrite(currentNote.content);
        return result ? { content: result } : null;
      },
    };

    const update = await aiActions[action]();
    if (update) {
      setCurrentNote({ ...currentNote, ...update });
    } else if (update === null) {
      // User was alerted, just return
    } else {
      alert('No result returned from AI');
    }
  } catch (error) {
    console.error('AI error:', error);
    alert(error.message || 'AI feature not available. Enable Chrome AI flags in chrome://flags');
  }
  setLoading(false);
}
```

**Step 8.3: REPLACE the entire action-bar div and AIWarning with this complete version:**

```javascript
<div className="action-bar">
  <button className="button button-primary" onClick={handleSave}>
    Save
  </button>
  <AIActions
    aiAvailable={aiAvailable}
    loading={loading}
    hasContent={!!currentNote.content}
    hasTitle={!!currentNote.title}
    onAIAction={handleAI}
  />
</div>
{!aiAvailable && <AIWarning />}
```

---

## Testing Your Implementation

After completing all steps, test your application:

1. **Refresh your browser** - The app should reload with all AI features

2. **Test each AI feature:**
   - **Generate Title**: Write some content and click "Generate Title"
   - **Write For Me**: Enter a title and click "Write For Me"
   - **Summarize**: Write a long note and click "Summarize"
   - **Proofread**: Write a note with grammar errors and click "Proofread"
   - **Rewrite**: Write a note and click "Rewrite"

3. **Test error cases:**
   - Try using AI features without content (for Generate Title, Summarize, Proofread, Rewrite)
   - Try using "Write For Me" without a title
   - Test when Chrome AI flags are disabled (should show warning)

**Performance Notes:**
- **First-time use**: May take 10-30 seconds as Chrome downloads the model (~100-200MB). Check Chrome DevTools → Network tab to see the download.
- **Subsequent uses**: Much faster (1-3 seconds) since the model is cached locally.
- **Offline capable**: After initial download, all processing happens locally - no internet needed.
- **Privacy**: All processing happens in your browser - no data sent to external servers.

---

## What You've Built

Congratulations! You've successfully added five AI-powered features to your note-taking app:

1. **Generate Title** - Automatically creates a title from note content
2. **Write For Me** - Generates note content from a title
3. **Summarize** - Condenses long notes into shorter summaries
4. **Proofread** - Fixes grammar and spelling errors
5. **Rewrite** - Rewrites text in a different style

All features run entirely in your browser using Chrome's on-device AI capabilities!

---

## Troubleshooting

### AI features not showing?
- Make sure you've enabled all Chrome AI flags in `chrome://flags`
- Restart Chrome after enabling flags
- Check that you're using Chrome version 131 or later

### Getting "unavailable" errors?
- Some APIs require specific hardware support
- Check Chrome's hardware requirements documentation
- Try a different device if possible

### First use is very slow?
- This is normal! Chrome needs to download the AI model (100-200MB)
- Subsequent uses will be much faster
- The download happens automatically when you click an AI button

### Buttons are disabled?
- Some features require content (Generate Title, Summarize, Proofread, Rewrite)
- "Write For Me" requires a title
- Make sure you've entered the required content before clicking

---

## Next Steps

- Experiment with different prompt styles for the LanguageModel API
- Add more AI actions (e.g., "Make it formal", "Make it casual")
- Customize the Rewriter options for different writing styles
- Add language selection for multilingual features

---

## Resources

- [Chrome AI APIs Documentation](https://developer.chrome.com/docs/ai)
- [Chrome Flags](chrome://flags)
- [React Documentation](https://react.dev)

---

**Happy coding! 🚀**
