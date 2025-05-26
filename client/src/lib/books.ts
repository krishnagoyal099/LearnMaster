export interface BookResource {
  id: string;
  title: string;
  author: string;
  description: string;
  previewUrl: string;
  downloadUrl: string;
  totalPages: number;
  rating: number;
  difficulty?: string;
}

export async function getBookRecommendations(subject: string): Promise<BookResource[]> {
  try {
    const response = await fetch(`/api/books/recommendations?subject=${encodeURIComponent(subject)}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch book recommendations');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching book recommendations:', error);
    return [];
  }
}
