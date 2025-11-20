import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PostContentProps {
  content: string;
}

// Function to strip HTML tags from content if present
function stripHtmlTags(html: string): string {
  if (!html.includes("<")) {
    return html; // Already plain text
  }
  // Strip HTML tags and decode common entities
  return html
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

export default function PostContent({ content }: PostContentProps) {
  // Check if content is HTML (from Jodit editor) or Markdown
  const isHTML = content.includes("<") && (
    content.includes("<p>") || 
    content.includes("<div>") || 
    content.includes("<h1>") || 
    content.includes("<img>") ||
    content.includes("<strong>") ||
    content.includes("<em>")
  );
  
  if (isHTML) {
    // Render HTML content directly
    return (
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  
  // Render as Markdown
  const textContent = content.includes("<") ? stripHtmlTags(content) : content;
  
  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{textContent}</ReactMarkdown>
    </div>
  );
}

