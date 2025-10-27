export interface LibraryItem {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  icon: string;
  tags: string[];
  ageGroups: string[];
  complexity: 'simple' | 'medium' | 'detailed';
}

export interface LibraryCategory {
  id: string;
  name: string;
  emoji: string;
  items: LibraryItem[];
}

interface MetadataResponse {
  categories: LibraryCategory[];
}

export class ImageLibraryService {
  private static metadata: LibraryCategory[] | null = null;
  private static loading: Promise<LibraryCategory[]> | null = null;

  /**
   * Load metadata from JSON file
   */
  static async loadMetadata(): Promise<LibraryCategory[]> {
    if (this.metadata) {
      return this.metadata;
    }

    // Prevent multiple simultaneous loads
    if (this.loading) {
      return this.loading;
    }

    this.loading = (async () => {
      try {
        const response = await fetch('/image-library/metadata.json');
        if (!response.ok) {
          throw new Error(`Failed to load metadata: ${response.status}`);
        }
        
        const data: MetadataResponse = await response.json();
        this.metadata = data.categories;
        return this.metadata;
      } catch (error) {
        console.error('Error loading image library metadata:', error);
        this.metadata = []; // Return empty array on error
        return this.metadata;
      } finally {
        this.loading = null;
      }
    })();

    return this.loading;
  }

  /**
   * Get all categories
   */
  static async getCategories(): Promise<LibraryCategory[]> {
    await this.loadMetadata();
    return this.metadata || [];
  }

  /**
   * Get items by category ID
   */
  static async getItemsByCategory(categoryId: string): Promise<LibraryItem[]> {
    const categories = await this.getCategories();
    const category = categories.find(c => c.id === categoryId);
    return category?.items || [];
  }

  /**
   * Search items by query (searches in name, nameEn, and tags)
   */
  static async searchItems(query: string): Promise<LibraryItem[]> {
    if (!query.trim()) {
      return this.getAllItems();
    }

    const categories = await this.getCategories();
    const allItems = categories.flatMap(c => c.items);
    
    const lowerQuery = query.toLowerCase();
    return allItems.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.nameEn.toLowerCase().includes(lowerQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Filter items by age group
   */
  static async filterByAgeGroup(ageGroup: string): Promise<LibraryItem[]> {
    const categories = await this.getCategories();
    const allItems = categories.flatMap(c => c.items);
    
    return allItems.filter(item => item.ageGroups.includes(ageGroup));
  }

  /**
   * Get all items from all categories
   */
  static async getAllItems(): Promise<LibraryItem[]> {
    const categories = await this.getCategories();
    return categories.flatMap(c => c.items);
  }

  /**
   * Get SVG content from lucide-react icon
   * Since we're using lucide-react icons by name, we return a placeholder
   * The actual icon will be rendered by the React component
   */
  static async getSvgFromIcon(iconName: string): Promise<string> {
    // This is a placeholder - actual SVG will be rendered by lucide-react
    // We return a simple marker that the component will replace with the actual icon
    return `<lucide-icon name="${iconName}" />`;
  }

  /**
   * Get item by ID
   */
  static async getItemById(itemId: string): Promise<LibraryItem | null> {
    const allItems = await this.getAllItems();
    return allItems.find(item => item.id === itemId) || null;
  }

  /**
   * Filter items by multiple criteria
   */
  static async filterItems(filters: {
    category?: string;
    ageGroup?: string;
    complexity?: 'simple' | 'medium' | 'detailed';
    query?: string;
  }): Promise<LibraryItem[]> {
    let items = await this.getAllItems();

    if (filters.category) {
      items = items.filter(item => item.category === filters.category);
    }

    if (filters.ageGroup) {
      items = items.filter(item => item.ageGroups.includes(filters.ageGroup));
    }

    if (filters.complexity) {
      items = items.filter(item => item.complexity === filters.complexity);
    }

    if (filters.query && filters.query.trim()) {
      const lowerQuery = filters.query.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.nameEn.toLowerCase().includes(lowerQuery) ||
        item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    return items;
  }

  /**
   * Clear cached metadata (useful for testing)
   */
  static clearCache(): void {
    this.metadata = null;
    this.loading = null;
  }
}

