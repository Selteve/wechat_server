interface RequestOptions<T = any> {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    data?: T;
}

export const request = async <T = any, R = any>(
    url: string,
    options?: RequestOptions<T>
): Promise<R> => {
    try {
        const response = await fetch(url, {
            method: options?.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            body: options?.data ? JSON.stringify(options.data) : undefined,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return (await response.json()) as R;
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
};