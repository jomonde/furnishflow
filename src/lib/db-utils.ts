import { PostgrestError } from '@supabase/supabase-js';

type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never;
type DbResultErr = PostgrestError;

export const handleDbError = (error: DbResultErr | null) => {
  if (error) {
    console.error('Database error:', error);
    throw new Error(error.message);
  }
};

export const handleDbResult = <T extends PromiseLike<{ data: any; error: any }>>(
  result: T
): DbResultOk<T> => {
  const { data, error } = result as DbResult<T>;
  if (error) handleDbError(error);
  return data as DbResultOk<T>;
};

// Helper function to handle pagination
export const paginate = <T>(
  query: any,
  page: number = 1,
  pageSize: number = 10
) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return query.range(from, to);
};

// Helper function to handle sorting
export const sortBy = <T>(
  query: any,
  column: string,
  ascending: boolean = true
) => {
  return query.order(column, { ascending });
};
