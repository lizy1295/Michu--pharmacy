import { getProducts } from './products';

describe('products API helper', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it('normalizes paginated product responses into a product array', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: [{
          id: 1,
          name: 'Test Product',
          price: '12.50',
          brand: 'Brand',
          category: 'Medicine',
          prescriptionRequired: false,
          stock: 5,
          description: 'A test product',
          imageUrl: null,
          attributes: {},
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      }),
    }) as unknown as typeof fetch;

    const products = await getProducts();

    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({ id: 1, name: 'Test Product' });
  });
});
