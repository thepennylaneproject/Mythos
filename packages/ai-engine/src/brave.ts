export interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
}

export class BraveSearch {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string, count: number = 5): Promise<BraveSearchResult[]> {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "X-Subscription-Token": this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brave Search API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    // Brave Search API returns results in data.web.results
    return (data.web?.results || []).map((res: any) => ({
      title: res.title,
      url: res.url,
      description: res.description,
    }));
  }
}
