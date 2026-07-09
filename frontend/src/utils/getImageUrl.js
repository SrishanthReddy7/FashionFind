export const getImageUrl = (image) => {
  if (!image) return 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80';
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseUrl}/${image.replace(/^\//, '')}`;
};
