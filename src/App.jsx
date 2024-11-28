import './assets/main.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from './components/RootLayout.jsx';
import { NewsDescription } from './components/NewsDescription.jsx';
import { NewsList } from './components/NewsList.jsx';

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <RootLayout />,
      children: [
        {
          path: '/',
          element: <NewsList />,
        },
        {
          path: '/:newsId',
          element: <NewsDescription />,
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
