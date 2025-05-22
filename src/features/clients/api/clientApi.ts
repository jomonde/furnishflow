import { baseApi } from '@/lib/api/baseApi';
import { Client, ClientStatus } from '@/types';

export const clientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClients: builder.query<Client[], void>({
      query: () => ({
        table: 'clients',
        order: { column: 'created_at', ascending: false },
      }),
      providesTags: ['Client'],
    }),
    getClient: builder.query<Client, string>({
      query: (id) => ({
        table: 'clients',
        eq: ['id', id],
      }),
      transformResponse: (response: Client[]) => response[0],
      providesTags: (result, error, id) => [{ type: 'Client', id }],
    }),
    createClient: builder.mutation<Client, Omit<Client, 'id' | 'created_at' | 'updated_at'>>({
      query: (client) => ({
        table: 'clients',
        method: 'POST',
        body: client,
      }),
      invalidatesTags: ['Client'],
    }),
    updateClient: builder.mutation<Client, Partial<Client> & Pick<Client, 'id'>>({
      query: ({ id, ...updates }) => ({
        table: 'clients',
        method: 'PATCH',
        id,
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Client', id },
        'Client',
      ],
    }),
    deleteClient: builder.mutation<void, string>({
      query: (id) => ({
        table: 'clients',
        method: 'DELETE',
        id,
      }),
      invalidatesTags: ['Client'],
    }),
    updateClientStatus: builder.mutation<Client, { id: string; status: ClientStatus }>({
      query: ({ id, status }) => ({
        table: 'clients',
        method: 'PATCH',
        id,
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Client', id },
        'Client',
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetClientsQuery,
  useGetClientQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useUpdateClientStatusMutation,
} = clientApi;
