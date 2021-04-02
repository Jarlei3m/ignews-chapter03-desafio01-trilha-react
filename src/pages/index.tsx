import { FiCalendar, FiUser } from 'react-icons/fi';
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';

import Link from 'next/link';
import Head from 'next/head';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { LoadButton } from '../components/LoadButton';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  return (
    <>
      <Head>
        <title> Home | Spacetraveling </title>
      </Head>
      <main className={styles.container}>
        <article className={styles.posts}>
          {postsPagination.results.map(post => {
            const { title, subtitle, author } = post.data;
            return (
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <a>
                  <strong>{title}</strong>
                  <p>{subtitle}</p>
                  <div>
                    <time>
                      <FiCalendar /> {post.first_publication_date}
                    </time>
                    <p>
                      <FiUser /> {author}
                    </p>
                  </div>
                </a>
              </Link>
            );
          })}
        </article>
        {postsPagination.next_page && <LoadButton />}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 5,
    }
  );

  const { next_page } = postsResponse;

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.last_publication_date),
        'dd MMM yy',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = { next_page, results };

  return {
    props: { postsPagination },
  };
};
