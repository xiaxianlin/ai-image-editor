import { createBrowserRouter } from 'react-router-dom'
import Layout from '../components/Layout'
import Editor from '../pages/Editor'
import Gallery from '../pages/Gallery'
import Styles from '../pages/Styles'
import Settings from '../pages/Settings'
import NotFound from '../pages/NotFound'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Editor />
      },
      {
        path: 'gallery',
        element: <Gallery />
      },
      {
        path: 'styles',
        element: <Styles />
      },
      {
        path: 'settings',
        element: <Settings />
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
])