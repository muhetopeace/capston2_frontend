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
  // If content contains HTML, strip it first
  const textContent = content.includes("<") ? stripHtmlTags(content) : content;
  
  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{textContent}</ReactMarkdown>
    </div>
  );
}

