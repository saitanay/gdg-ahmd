// Checks if Prompt API is available
export function isAIAvailable() {
  return typeof window !== 'undefined' && 'LanguageModel' in window;
}

// Generate social media posts using Prompt API
export async function generateSocialPosts(topic) {
  if (!isAIAvailable()) {
    throw new Error('Prompt API not available. Enable Chrome AI flags in chrome://flags');
  }

  const session = await window.LanguageModel.create();
  
  const prompt = `Generate 3 social media posts about: "${topic}"

Format your response EXACTLY as follows (use these exact labels):
LINKEDIN:
[LinkedIn post content with relevant hashtags]

TWITTER:
[Twitter post content with relevant hashtags - keep it concise, under 280 characters]

INSTAGRAM:
[Instagram post content with relevant hashtags]

Make each post engaging, professional, and platform-appropriate. Include relevant hashtags for each platform.`;

  try {
    const result = await session.prompt(prompt);
    session.destroy();
    
    // Parse the result into separate posts
    const posts = {
      linkedin: '',
      twitter: '',
      instagram: ''
    };

    const lines = result.split('\n');
    let currentPlatform = null;
    let currentContent = [];

    for (const line of lines) {
      if (line.trim().startsWith('LINKEDIN:')) {
        if (currentPlatform && currentContent.length > 0) {
          posts[currentPlatform] = currentContent.join('\n').trim();
        }
        currentPlatform = 'linkedin';
        currentContent = [];
      } else if (line.trim().startsWith('TWITTER:')) {
        if (currentPlatform && currentContent.length > 0) {
          posts[currentPlatform] = currentContent.join('\n').trim();
        }
        currentPlatform = 'twitter';
        currentContent = [];
      } else if (line.trim().startsWith('INSTAGRAM:')) {
        if (currentPlatform && currentContent.length > 0) {
          posts[currentPlatform] = currentContent.join('\n').trim();
        }
        currentPlatform = 'instagram';
        currentContent = [];
      } else if (currentPlatform && line.trim()) {
        currentContent.push(line);
      }
    }

    // Add the last platform's content
    if (currentPlatform && currentContent.length > 0) {
      posts[currentPlatform] = currentContent.join('\n').trim();
    }

    // Fallback: if parsing failed, try to extract from raw result
    if (!posts.linkedin && !posts.twitter && !posts.instagram) {
      const parts = result.split(/(?=LINKEDIN:|TWITTER:|INSTAGRAM:)/i);
      parts.forEach(part => {
        if (part.toLowerCase().includes('linkedin')) {
          posts.linkedin = part.replace(/linkedin:\s*/i, '').trim();
        } else if (part.toLowerCase().includes('twitter')) {
          posts.twitter = part.replace(/twitter:\s*/i, '').trim();
        } else if (part.toLowerCase().includes('instagram')) {
          posts.instagram = part.replace(/instagram:\s*/i, '').trim();
        }
      });
    }

    return posts;
  } catch (error) {
    session.destroy();
    throw error;
  }
}

