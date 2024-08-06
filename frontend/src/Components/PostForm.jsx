import { useState } from 'react';
import axios from 'axios';

const PostForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState({});

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const submitPost = async () => {
    const maxContentLength = 50; 
    const truncatedContent = content.length > maxContentLength ? content.substring(0, maxContentLength) + '...' : content;
  
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', truncatedContent); 
    formData.append('image', image);
    formData.append('posterName', 'developersIndia'); 
  
    try {
      const response = await axios.post('http://localhost:3000/generate-og-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      });
  
      const url = URL.createObjectURL(response.data);
      const newPost = { title, content: truncatedContent, imageUrl: url, posterName: 'User Name' }; // Use truncated content
      setPosts([newPost, ...posts]); 
  
      setTitle('');
      setContent('');
      setImage(null);
      setImagePreview('');
    } catch (error) {
      console.error('Error generating OG image:', error);
    }
  };
  

  const handleLike = (index) => {
    const newLikes = { ...likes, [index]: (likes[index] || 0) + 1 };
    setLikes(newLikes);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="p-8 border border-gray-300 rounded-lg bg-white shadow-lg mb-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Create a New Post</h1>
        
        <div className="mb-6">
          <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-2">Title</label>
          <textarea
            id="title"
            type="text"
            placeholder="Enter post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="content" className="block text-lg font-medium text-gray-700 mb-2">Content</label>
          <textarea
            id="content"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg h-48 resize-none text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="image" className="block text-lg font-medium text-gray-700 mb-2">Upload Image (Optional)</label>
          <input
            id="image"
            type="file"
            onChange={handleImageUpload}
            className="block w-full text-gray-500 file:border file:border-gray-300 file:rounded-lg file:p-2 file:mr-2 file:bg-gray-50 file:text-gray-700 file:hover:bg-gray-100"
          />
        </div>
        
        {imagePreview && (
          <div className="mb-6">
            <img
              src={imagePreview}
              alt="Uploaded Preview"
              className="w-full h-auto max-h-80 object-cover rounded-lg border border-gray-300"
            />
          </div>
        )}
        
        <button
          onClick={submitPost}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300"
        >
          Submit Post
        </button>
      </div>

      <div className="space-y-8">
        {posts.map((post, index) => (
          <div key={index} className="p-8 border border-gray-300 rounded-lg bg-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{post.title}</h2>
              <img src="/branding/reddit-logo.png" alt="Reddit Logo" className="w-12 h-12" />
            </div>
            <p className="text-gray-700 mb-4">{post.content}</p>
            <img
              src={post.imageUrl}
              alt="Generated OG"
              className="w-full h-auto max-h-80 object-cover rounded-lg border border-gray-300 mb-4"
            />
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleLike(index)}
                className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300"
              >
                Like {likes[index] || 0}
              </button>
              <a
                href={post.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Full Image
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostForm;
