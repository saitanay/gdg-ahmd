import { useState, useEffect } from 'react';
import { isAIAvailable, generateSocialPosts } from './lib/ai';

function App() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [posts, setPosts] = useState({
    linkedin: '',
    twitter: '',
    instagram: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    setAiAvailable(isAIAvailable());
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic for your post');
      return;
    }

    if (!aiAvailable) {
      setError('AI features not available. Enable Chrome AI flags in chrome://flags');
      return;
    }

    setLoading(true);
    setError('');
    setPosts({ linkedin: '', twitter: '', instagram: '' });

    try {
      const generatedPosts = await generateSocialPosts(topic.trim());
      setPosts(generatedPosts);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate posts. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text, platform) {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${platform} post copied to clipboard!`);
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>GDG Social Media Post Generator</h1>
          <p>Generate engaging posts for LinkedIn, Twitter, and Instagram</p>
        </header>

        {!aiAvailable && (
          <div className="warning">
            <strong>⚠️ AI Features Not Available</strong>
            <p>To use this app, enable Chrome AI flags:</p>
            <ol>
              <li>Go to <code>chrome://flags</code></li>
              <li>Enable "Prompt API for Experimental AI Features"</li>
              <li>Restart Chrome</li>
            </ol>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="topic">What would you like to post about?</label>
            <textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="E.g., Excited to announce our new AI workshop next week..."
              rows="4"
              disabled={loading || !aiAvailable}
            />
          </div>
          <button
            type="submit"
            className="button button-primary"
            disabled={loading || !aiAvailable || !topic.trim()}
          >
            {loading ? 'Generating Posts...' : 'Generate Posts'}
          </button>
        </form>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {(posts.linkedin || posts.twitter || posts.instagram) && (
          <div className="posts-container">
            {posts.linkedin && (
              <div className="post-card">
                <div className="post-header">
                  <h2>LinkedIn</h2>
                  <button
                    className="button button-copy"
                    onClick={() => handleCopy(posts.linkedin, 'LinkedIn')}
                  >
                    Copy
                  </button>
                </div>
                <div className="post-content">{posts.linkedin}</div>
              </div>
            )}

            {posts.twitter && (
              <div className="post-card">
                <div className="post-header">
                  <h2>Twitter</h2>
                  <button
                    className="button button-copy"
                    onClick={() => handleCopy(posts.twitter, 'Twitter')}
                  >
                    Copy
                  </button>
                </div>
                <div className="post-content">{posts.twitter}</div>
              </div>
            )}

            {posts.instagram && (
              <div className="post-card">
                <div className="post-header">
                  <h2>Instagram</h2>
                  <button
                    className="button button-copy"
                    onClick={() => handleCopy(posts.instagram, 'Instagram')}
                  >
                    Copy
                  </button>
                </div>
                <div className="post-content">{posts.instagram}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

