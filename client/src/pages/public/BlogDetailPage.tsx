import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { BlogPost } from '../../types';
import { getPost } from '../../api/blog';
import { formatDate } from '../../utils/formatDate';

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getPost(slug)
      .then(setPost)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
        <div className="space-y-3 mt-8">
          {[...Array(8)].map((_, i) => <div key={i} className="h-4 bg-gray-200 dark:bg-gray-800 rounded" />)}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Post not found</h2>
        <Link to="/blog" className="text-primary-600 hover:text-primary-700 font-medium">Back to Blog</Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{post.title}</h1>

      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
        <span className="flex items-center gap-1"><User className="w-4 h-4" /> {post.author}</span>
        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(post.created_at)}</span>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        {post.content.split('\n').map((paragraph, i) => {
          if (paragraph.startsWith('## ')) {
            return <h2 key={i} className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">{paragraph.replace('## ', '')}</h2>;
          }
          if (paragraph.startsWith('- **')) {
            const match = paragraph.match(/- \*\*(.*?)\*\*: (.*)/);
            if (match) {
              return (
                <p key={i} className="text-gray-600 dark:text-gray-400 mb-1">
                  <strong className="text-gray-900 dark:text-white">{match[1]}:</strong> {match[2]}
                </p>
              );
            }
          }
          if (paragraph.startsWith('- ')) {
            return <li key={i} className="text-gray-600 dark:text-gray-400 ml-4 mb-1">{paragraph.replace('- ', '')}</li>;
          }
          if (paragraph.trim() === '') return <br key={i} />;
          return <p key={i} className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{paragraph}</p>;
        })}
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
        <Link to="/blog" className="text-primary-600 hover:text-primary-700 font-medium">
          &larr; More Articles
        </Link>
      </div>
    </article>
  );
}
