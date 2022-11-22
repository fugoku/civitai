import { Group, Stack, Container, Title } from '@mantine/core';
import Head from 'next/head';
import { InfiniteModels } from '~/components/InfiniteModels/InfiniteModels';
import { ListSort } from '~/components/ListSort/ListSort';
import { ListPeriod } from '~/components/ListPeriod/ListPeriod';
import { ListFilter } from '~/components/ListFilter/ListFilter';
import { useRouter } from 'next/router';

function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <meta name="description" content="Community driven AI model sharing tool" />
      </Head>
      <Container size="xl" p={0}>
        {router.query.username && <Title>Models by {router.query.username}</Title>}
        <Stack spacing="xs">
          <Group position="apart">
            <ListSort />
            <Group spacing="xs">
              <ListPeriod />
              <ListFilter />
            </Group>
          </Group>
          <InfiniteModels />
        </Stack>
      </Container>
    </>
  );
}

// Home.getLayout = (page: React.ReactElement) => <>{page}</>;
export default Home;
