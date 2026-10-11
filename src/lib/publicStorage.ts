export interface SavePublicHtmlResponse {
  success: boolean;
  slug: string;
  message: string;
  files: {
    terms?: string;
    publicTerms?: string;
    privacy?: string;
    publicPrivacy?: string;
    default?: string;
    publicDefault?: string;
  };
}

export async function saveHtmlToPublicFolder(
  appName: string,
  termsHtml: string,
  privacyHtml: string
): Promise<SavePublicHtmlResponse | null> {
  try {
    const response = await fetch('/api/save-public-html', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appName,
        termsHtml,
        privacyHtml,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return data as SavePublicHtmlResponse;
  } catch (err) {
    console.warn('Gagal menyimpan via API server (mungkin hosting statis murni):', err);
    return null;
  }
}
