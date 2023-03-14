import { useRef, createContext, useContext } from 'react';
import { MetricTimeframe } from '@prisma/client';
import { SelectMenu } from '~/components/SelectMenu/SelectMenu';
import { useCookies } from '~/providers/CookiesProvider';
import { BrowsingMode, PostSort } from '~/server/common/enums';
import { PostsFilterInput } from '~/server/schema/post.schema';
import { setCookie } from '~/utils/cookies-helpers';
import { splitUppercase } from '~/utils/string-helpers';
import { createStore, useStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { QS } from '~/utils/qs';

type PostsFilterProps = {
  filters: PostsFilterInput;
};

type PostsFilterState = PostsFilterProps & {
  setBrowsingMode: (mode: BrowsingMode) => void;
  setSort: (sort: PostSort) => void;
  setPeriod: (period: MetricTimeframe) => void;
};

type PostsFilterStore = ReturnType<typeof createPostsFilterStore>;

const createPostsFilterStore = ({ initialValues }: { initialValues: PostsFilterInput }) => {
  return createStore<PostsFilterState>()(
    devtools(
      immer((set, get) => {
        const updateCookie = (data: Partial<PostsFilterInput>) => {
          const state = get();
          const current = Object.entries(state)
            .filter(([, value]) => typeof value !== 'function')
            .reduce<PostsFilterInput>((acc, [key, value]) => ({ ...acc, [key]: value }), {} as any);
          setCookie('p_filters', QS.stringify({ ...current, ...data }));
        };

        return {
          filters: { ...initialValues },
          setBrowsingMode: (mode: BrowsingMode) => {
            updateCookie({ browsingMode: mode });
            set((state) => {
              state.filters.browsingMode = mode;
            });
          },
          setSort: (sort: PostSort) => {
            updateCookie({ sort });
            set((state) => {
              state.filters.sort = sort;
            });
          },
          setPeriod: (period: MetricTimeframe) => {
            updateCookie({ period });
            set((state) => {
              state.filters.period = period;
            });
          },
        };
      })
    )
  );
};

const PostsFilterContext = createContext<PostsFilterStore | null>(null);
export function usePostsFilterContext<T>(selector: (state: PostsFilterState) => T) {
  const store = useContext(PostsFilterContext);
  if (!store) throw new Error('Missing PostsFilterCtx.Provider in the tree');
  return useStore(store, selector);
}

export const PostsFilterProvider = ({ children }: { children: React.ReactNode }) => {
  const cookies = useCookies().post;
  const storeRef = useRef<PostsFilterStore>();

  if (!storeRef.current) {
    storeRef.current = createPostsFilterStore({ initialValues: cookies });
  }

  return (
    <PostsFilterContext.Provider value={storeRef.current}>{children}</PostsFilterContext.Provider>
  );
};

const periodOptions = Object.values(MetricTimeframe);
export function PostsPeriod() {
  const period = usePostsFilterContext((state) => state.filters.period);
  const setPeriod = usePostsFilterContext((state) => state.setPeriod);
  return (
    <SelectMenu
      label={period && splitUppercase(period.toString())}
      options={periodOptions.map((option) => ({ label: splitUppercase(option), value: option }))}
      onClick={(period) => setPeriod(period)}
      value={period}
    />
  );
}

const sortOptions = Object.values(PostSort);
export function PostsSort() {
  const sort = usePostsFilterContext((state) => state.filters.sort);
  const setSort = usePostsFilterContext((state) => state.setSort);

  return (
    <SelectMenu
      label={sort}
      options={sortOptions.map((x) => ({ label: x, value: x }))}
      onClick={(sort) => setSort(sort)}
      value={sort}
    />
  );
}
