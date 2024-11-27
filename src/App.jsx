import './assets/main.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from './components/RootLayout.jsx';
import { NewsDescription } from './components/NewsDescription.jsx';
import { NewsList } from './components/NewsList.jsx';
const news = [
  {
    id: 1,
    title: 'New AI Model Revolutionizes Medical Diagnostics',
    author: 'Dr. Emily Carter',
    description:
      'A breakthrough AI model developed by researchers at Stanford University significantly improves early detection of rare diseases, potentially saving thousands of lives annually.',
    source: 'Stanford News',
    img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },

  {
    id: 2,
    title: 'Global Climate Summit Yields Historic Agreement',
    author: 'John Daniels',
    description:
      'Leaders from over 100 nations have agreed on a robust framework to combat climate change, committing to substantial reductions in greenhouse gas emissions by 2030.',
    source: 'BBC News',
    img: 'https://plus.unsplash.com/premium_photo-1688561384438-bfa9273e2c00?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];
function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <RootLayout />,
      children: [
        {
          path: '/',
          element: <NewsList news={news} />,
        },
        {
          path: '/:newsId',
          element: <NewsDescription news={news} />,
        },
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
